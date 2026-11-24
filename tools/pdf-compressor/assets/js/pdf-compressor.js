(function(){
  'use strict';
  function $(id){return document.getElementById(id);}
  function el(tag, cls, text){ var e=document.createElement(tag); if(cls) e.className=cls; if(text!=null) e.textContent=text; return e; }
  var MAX_BYTES=50*1024*1024, MAX_PAGES=100;
  var currentFile=null, resultBlob=null, resultUrl=null;
  var PRESETS={high:{scale:2.0,q:0.85},medium:{scale:1.5,q:0.65},low:{scale:1.0,q:0.45}};
  function fmt(b){ if(b<1024) return b+' B'; if(b<1048576) return (b/1024).toFixed(1)+' KB'; return (b/1048576).toFixed(2)+' MB'; }
  function status(msg,ok){
    var box=$('pdf-status'); box.textContent='';
    box.appendChild(el('div', ok?'xpatsoft-success':'xpatsoft-error', msg));
  }
  function stats(items){
    var box=$('pdf-stats'); box.textContent='';
    items.forEach(function(it){
      var d=el('div','xpatsoft-stat');
      d.appendChild(el('b',null,it[0])); d.appendChild(el('span',null,it[1]));
      box.appendChild(d);
    });
  }
  function yieldUI(){ return new Promise(function(r){ setTimeout(r,0); }); }
  function setFile(f){
    if(!f) return;
    if(f.size===0){ status('File is empty.'); return; }
    if(f.type!=='application/pdf' && !/\.pdf$/i.test(f.name)){ status('Only PDF files are supported.'); return; }
    if(f.size>MAX_BYTES){ status('File exceeds 50 MB limit for browser processing.'); return; }
    currentFile=f;
    if(resultUrl){ URL.revokeObjectURL(resultUrl); resultUrl=null; }
    resultBlob=null;
    $('pdf-compress').disabled=false; $('pdf-download').disabled=true;
    stats([[fmt(f.size),'Original']]);
    status('Selected: '+f.name+' ('+fmt(f.size)+'). Ready to compress.',true);
  }
  function isEncrypted(bytes){
    // Cheap heuristic: /Encrypt marker in trailer. pdf-lib also throws on encrypted loads.
    var s=new TextDecoder('latin1').decode(bytes.slice(0,65536));
    return /\/Encrypt\b/.test(s);
  }
  async function compress(){
    if(!currentFile) return;
    if(typeof PDFLib==='undefined'){ status('PDF library failed to load. Check connection and retry.'); return; }
    var mode=$('pdf-mode').value;
    if(mode==='rebuild' && typeof pdfjsLib==='undefined'){ status('PDF renderer failed to load. Choose Optimise mode or retry.'); return; }
    $('pdf-compress').disabled=true; $('pdf-progress').value=5;
    try{
      var buf=await currentFile.arrayBuffer();
      if(buf.byteLength===0) throw new Error('File is empty.');
      if(isEncrypted(new Uint8Array(buf))) throw new Error('Encrypted PDFs cannot be processed. Remove the password first.');
      var result;
      if(mode==='optimise'){ result=await optimise(buf); }
      else { result=await rebuild(buf); }
      resultBlob=result.blob;
      if(resultUrl) URL.revokeObjectURL(resultUrl);
      resultUrl=URL.createObjectURL(resultBlob);
      var red=currentFile.size?Math.round((1-result.size/currentFile.size)*100):0;
      stats([[fmt(currentFile.size),'Original'],[fmt(result.size),'Compressed'],[red+'%','Reduction'],[String(result.pages),'Pages']]);
      $('pdf-download').disabled=false; $('pdf-progress').value=100;
      var note='';
      if(result.target && result.size>result.target) note=' Target not fully reached; best valid result returned.';
      status('Compression complete ('+result.modeLabel+').'+note,true);
    }catch(e){
      console.error(e);
      status('Could not process this PDF. It may be encrypted, malformed, or too large. Error: '+e.message);
    }
    $('pdf-compress').disabled=false;
  }
  // Mode A: text-preserving optimisation via pdf-lib page copy + object streams.
  // Best-effort JPEG recompression of embedded DCTDecode images; falls back to plain copy.
  async function optimise(buf){
    var src=await PDFLib.PDFDocument.load(buf,{ignoreEncryption:false});
    var pages=src.getPages();
    if(pages.length>MAX_PAGES) throw new Error('PDF has '+pages.length+' pages (limit '+MAX_PAGES+'). Split the file and retry.');
    var out=await PDFLib.PDFDocument.create();
    // Preserve metadata where available.
    try{
      var meta={title:src.getTitle(),author:src.getAuthor(),subject:src.getSubject(),keywords:src.getKeywords(),producer:src.getProducer(),creator:src.getCreator(),creationDate:src.getCreationDate(),modificationDate:src.getModificationDate()};
      if(meta.title) out.setTitle(meta.title);
      if(meta.author) out.setAuthor(meta.author);
      if(meta.subject) out.setSubject(meta.subject);
      if(meta.keywords) out.setKeywords(meta.keywords);
      if(meta.producer) out.setProducer(meta.producer);
      if(meta.creator) out.setCreator(meta.creator);
      if(meta.creationDate) out.setCreationDate(meta.creationDate);
      if(meta.modificationDate) out.setModificationDate(meta.modificationDate);
    }catch(e){ /* metadata optional */ }
    var copied=await out.copyPages(src, src.getPageIndices());
    copied.forEach(function(p){ out.addPage(p); });
    // Best-effort embedded JPEG recompression (never fatal).
    var recompressed=0;
    try{ recompressed=await recompressJpegs(src, out); }catch(e){ recompressed=0; }
    var bytes=await out.save({useObjectStreams:true});
    return {blob:new Blob([bytes],{type:'application/pdf'}), size:bytes.length, pages:pages.length, modeLabel:'Optimise mode — text preserved'+(recompressed?(', '+recompressed+' image(s) recompressed'):'')};
  }
  async function recompressJpegs(src, out){
    // pdf-lib low-level: find image XObjects with DCTDecode in source, recompress, replace in output.
    // This is best-effort: any API mismatch simply skips recompression.
    if(!PDFLib.PDFName || !src.context || !src.context.enumerateIndirectObjects) return 0;
    var preset=PRESETS[$('pdf-quality').value]||PRESETS.medium;
    var count=0;
    var entries=src.context.enumerateIndirectObjects();
    for(var i=0;i<entries.length;i++){
      var ref=entries[i][0], obj=entries[i][1];
      try{
        if(!obj || !obj.dict || !obj.getContents) continue;
        var dict=obj.dict;
        var subtype=dict.get(PDFLib.PDFName.of('Subtype'));
        if(!subtype || subtype.toString()!=='/Image') continue;
        var filter=dict.get(PDFLib.PDFName.of('Filter'));
        if(!filter || filter.toString()!=='/DCTDecode') continue;
        var raw=obj.getContents();
        if(!raw || raw.length<1024) continue;
        var blob=new Blob([raw],{type:'image/jpeg'});
        var url=URL.createObjectURL(blob);
        var img=await new Promise(function(res,rej){ var im=new Image(); im.onload=function(){res(im);}; im.onerror=rej; im.src=url; });
        URL.revokeObjectURL(url);
        var c=document.createElement('canvas'); c.width=img.naturalWidth; c.height=img.naturalHeight;
        c.getContext('2d').drawImage(img,0,0);
        var outBlob=await new Promise(function(res){ c.toBlob(res,'image/jpeg',preset.q); });
        c.width=0; c.height=0;
        if(!outBlob || outBlob.size>=raw.length) continue;
        var newBytes=new Uint8Array(await outBlob.arrayBuffer());
        var newStream=out.context.stream(newBytes,{Filter:PDFLib.PDFName.of('DCTDecode')});
        out.context.assign(ref,newStream);
        count++;
        await yieldUI();
      }catch(e){ continue; }
    }
    return count;
  }
  // Mode B: raster rebuild (smallest size, text becomes non-selectable). pdf.js + pdf-lib.
  async function rebuild(buf){
    var loc=window.XPATSOFT_PDF_COMPRESSOR||{}; pdfjsLib.GlobalWorkerOptions.workerSrc=loc.workerUrl||'';
    var pdf=await pdfjsLib.getDocument({data:buf}).promise;
    if(pdf.numPages>MAX_PAGES) throw new Error('PDF has '+pdf.numPages+' pages (limit '+MAX_PAGES+'). Split the file and retry.');
    if(pdf.numPages>50) status('Large document: '+pdf.numPages+' pages. Rebuild mode renders one page at a time and may be slow on mobile.',true);
    var preset=PRESETS[$('pdf-quality').value]||PRESETS.medium;
    var target=parseInt($('pdf-target').value,10)||0;
    var scale=preset.scale, q=preset.q, best=null;
    for(var attempt=0; attempt<4; attempt++){
      best=await renderAll(pdf,scale,q);
      if(!target || best.size<=target) break;
      scale=Math.max(0.6,scale*0.8); q=Math.max(0.25,q*0.8);
      $('pdf-progress').value=10+attempt*10;
    }
    best.pages=pdf.numPages; best.target=target; best.modeLabel='Rebuild mode — rasterised (text not selectable)';
    return best;
  }
  async function renderAll(pdf,scale,q){
    var outPdf=await PDFLib.PDFDocument.create();
    for(var i=1;i<=pdf.numPages;i++){
      var page=await pdf.getPage(i);
      var vp=page.getViewport({scale:scale});
      var canvas=document.createElement('canvas'); canvas.width=vp.width; canvas.height=vp.height;
      await page.render({canvasContext:canvas.getContext('2d'),viewport:vp}).promise;
      var blob=await new Promise(function(res){canvas.toBlob(res,'image/jpeg',q);});
      canvas.width=0; canvas.height=0; // release backing store
      var imgBytes=await blob.arrayBuffer();
      var img=await outPdf.embedJpg(imgBytes);
      var p=outPdf.addPage([vp.width, vp.height]);
      p.drawImage(img,{x:0,y:0,width:vp.width,height:vp.height});
      $('pdf-progress').value=Math.round((i/pdf.numPages)*90)+5;
      await yieldUI();
    }
    var bytes=await outPdf.save({useObjectStreams:true});
    return {blob:new Blob([bytes],{type:'application/pdf'}), size:bytes.length};
  }
  // Free retained buffers when the page goes away.
  window.addEventListener('pagehide', function(){ if(resultUrl){ URL.revokeObjectURL(resultUrl); resultUrl=null; } });
  document.addEventListener('DOMContentLoaded', function(){
    if(!$('pdf-file')) return;
    var drop=$('pdf-drop');
    $('pdf-file').addEventListener('change',function(e){ setFile(e.target.files[0]); });
    drop.addEventListener('dragover',function(e){e.preventDefault(); drop.classList.add('drag');});
    drop.addEventListener('dragleave',function(){drop.classList.remove('drag');});
    drop.addEventListener('drop',function(e){e.preventDefault(); drop.classList.remove('drag'); setFile(e.dataTransfer.files[0]);});
    $('pdf-compress').addEventListener('click',compress);
    $('pdf-download').addEventListener('click',function(){
      if(!resultBlob) return;
      var a=document.createElement('a'); a.href=resultUrl; a.download=currentFile.name.replace(/\.pdf$/i,'')+'-compressed.pdf'; document.body.appendChild(a); a.click(); a.remove();
    });
    $('pdf-reset').addEventListener('click',function(){ if(resultUrl) URL.revokeObjectURL(resultUrl); location.reload(); });
  });
})();
