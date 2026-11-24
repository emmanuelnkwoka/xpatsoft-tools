(function(){
  'use strict';
  function $(id){return document.getElementById(id);}
  var MAX=50*1024*1024; // 50MB guard for low-memory devices
  var currentFile=null, resultBlob=null;
  var PRESETS={high:{scale:2.0,q:0.85},medium:{scale:1.5,q:0.65},low:{scale:1.0,q:0.45}};
  function fmt(b){ if(b<1024) return b+' B'; if(b<1048576) return (b/1024).toFixed(1)+' KB'; return (b/1048576).toFixed(2)+' MB'; }
  function setStatus(msg,ok){ $('pdf-status').innerHTML='<div class="'+(ok?'xpatsoft-success':'xpatsoft-error')+'">'+msg+'</div>'; }
  function setFile(f){
    if(!f) return;
    if(f.type!=='application/pdf' && !/\.pdf$/i.test(f.name)){ setStatus('Only PDF files are supported.'); return; }
    if(f.size>MAX){ setStatus('File exceeds 50 MB limit for browser processing.'); return; }
    currentFile=f; $('pdf-compress').disabled=false; $('pdf-download').disabled=true; resultBlob=null;
    $('pdf-stats').innerHTML='<div class="xpatsoft-stat"><b>'+fmt(f.size)+'</b>Original</div>';
    setStatus('Selected: '+f.name+' ('+fmt(f.size)+'). Ready to compress.',true);
  }
  async function compress(){
    if(!currentFile) return;
    if(typeof PDFLib==='undefined'||typeof pdfjsLib==='undefined'){ setStatus('PDF libraries failed to load. Check connection and retry.'); return; }
    $('pdf-compress').disabled=true; $('pdf-progress').value=5;
    try{
      var buf=await currentFile.arrayBuffer();
      pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
      var pdf=await pdfjsLib.getDocument({data:buf}).promise;
      var preset=PRESETS[$('pdf-quality').value]||PRESETS.medium;
      var target=parseInt($('pdf-target').value,10)||0;
      var scale=preset.scale, q=preset.q;
      var best=null;
      for(var attempt=0; attempt<4; attempt++){
        var out=await renderAll(pdf,scale,q);
        best=out;
        if(!target || out.size<=target) break;
        scale=Math.max(0.6,scale*0.8); q=Math.max(0.25,q*0.8);
        $('pdf-progress').value=10+attempt*10;
      }
      resultBlob=best.blob;
      var red=currentFile.size?Math.round((1-best.size/currentFile.size)*100):0;
      $('pdf-stats').innerHTML='<div class="xpatsoft-stat"><b>'+fmt(currentFile.size)+'</b>Original</div><div class="xpatsoft-stat"><b>'+fmt(best.size)+'</b>Compressed</div><div class="xpatsoft-stat"><b>'+red+'%</b>Reduction</div><div class="xpatsoft-stat"><b>'+pdf.numPages+'</b>Pages</div>';
      $('pdf-download').disabled=false; $('pdf-progress').value=100;
      var note=target&&best.size>target?' (target not fully reached; best valid result returned)':'';
      setStatus('Compression complete.'+note,true);
    }catch(e){
      console.error(e);
      setStatus('Could not process this PDF. It may be encrypted, malformed, or too large. Error: '+e.message);
    }
    $('pdf-compress').disabled=false;
  }
  async function renderAll(pdf,scale,q){
    var outPdf=await PDFLib.PDFDocument.create();
    for(var i=1;i<=pdf.numPages;i++){
      var page=await pdf.getPage(i);
      var vp=page.getViewport({scale:scale});
      var canvas=document.createElement('canvas'); canvas.width=vp.width; canvas.height=vp.height;
      await page.render({canvasContext:canvas.getContext('2d'),viewport:vp}).promise;
      var blob=await new Promise(function(res){canvas.toBlob(res,'image/jpeg',q);});
      var imgBytes=await blob.arrayBuffer();
      var img=await outPdf.embedJpg(imgBytes);
      var p=outPdf.addPage([vp.width, vp.height]);
      p.drawImage(img,{x:0,y:0,width:vp.width,height:vp.height});
      $('pdf-progress').value=Math.round((i/pdf.numPages)*90)+5;
    }
    var bytes=await outPdf.save();
    return {blob:new Blob([bytes],{type:'application/pdf'}), size:bytes.length};
  }
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
      var a=document.createElement('a'); a.href=URL.createObjectURL(resultBlob); a.download=currentFile.name.replace(/\.pdf$/i,'')+'-compressed.pdf'; a.click();
    });
    $('pdf-reset').addEventListener('click',function(){location.reload();});
  });
})();
