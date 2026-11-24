(function(){
  'use strict';
  function $(id){return document.getElementById(id);}
  function el(tag, cls, text){ var e=document.createElement(tag); if(cls) e.className=cls; if(text!=null) e.textContent=text; return e; }
  var MAX_FILES=20, MAX_DIM=8000;
  // Canvas memory guard: 1 canvas pixel = 4 bytes. Cap total pixels per image so a
  // single decode cannot exhaust memory on low-RAM/mobile devices (~64 MB canvas).
  var MAX_PIXELS=16000000;
  var IS_MOBILE=(/Android|iPhone|iPad|iPod|Mobile/i.test((navigator&&navigator.userAgent)||''));
  var BATCH_LIMIT=IS_MOBILE?10:MAX_FILES;
  function guardPixels(w,h){
    if(!w||!h) throw new Error('Image has no dimensions.');
    if(w>MAX_DIM||h>MAX_DIM) throw new Error('Image exceeds '+MAX_DIM+'px dimension limit.');
    if(w*h>MAX_PIXELS) throw new Error('Image is too large to process safely in this browser ('+w+'\u00D7'+h+'px). Resize it first.');
  }
  var files=[], results=[], objectUrls=[];
  var MIME={ 'image/jpeg':'jpg','image/png':'png','image/webp':'webp' };
  function fmt(b){ if(b<1024) return b+' B'; if(b<1048576) return (b/1024).toFixed(1)+' KB'; return (b/1048576).toFixed(2)+' MB'; }
  function track(url){ objectUrls.push(url); return url; }
  function cleanupUrls(){ objectUrls.forEach(function(u){ URL.revokeObjectURL(u); }); objectUrls=[]; }
  function status(msg,ok){
    var box=$('img-status'); box.textContent='';
    box.appendChild(el('div', ok?'xpatsoft-success':'xpatsoft-error', msg));
  }
  function addFiles(list){
    Array.from(list).forEach(function(f){
      if(files.length>=BATCH_LIMIT){ status('Batch limit reached ('+BATCH_LIMIT+' files'+(IS_MOBILE?' on this device':'')+'). Remove some files to add more.'); return; }
      if(!MIME[f.type]){ status('Unsupported format: '+f.name+'. Use JPG, PNG or WebP.'); return; }
      files.push(f);
    });
    renderList(); $('img-compress').disabled=files.length===0;
    if(files.length) status(files.length+' file(s) ready.',true);
  }
  function renderList(){
    var box=$('img-list'); box.textContent='';
    files.forEach(function(f,i){
      var d=el('div','img-item');
      var img=document.createElement('img'); img.src=track(URL.createObjectURL(f)); img.alt='';
      var info=el('div');
      info.appendChild(el('b',null,f.name));
      info.appendChild(document.createTextNode('\n'+fmt(f.size)+' \u00B7 '+f.type));
      info.style.whiteSpace='pre-line';
      var btn=el('button','xpatsoft-btn secondary','Remove'); btn.type='button';
      btn.addEventListener('click',function(){files.splice(i,1); renderList();});
      d.appendChild(img); d.appendChild(info); d.appendChild(btn); box.appendChild(d);
    });
  }
  function loadImage(file){
    return new Promise(function(res,rej){
      var url=track(URL.createObjectURL(file));
      var img=new Image();
      img.onload=function(){ res(img); };
      img.onerror=function(){ rej(new Error('Could not decode image.')); };
      img.src=url;
    });
  }
  function canvasToBlob(c,mime,q){ return new Promise(function(res){ c.toBlob(res,mime,q); }); }
  function yieldUI(){ return new Promise(function(r){ setTimeout(r,0); }); }
  async function compressAll(){
    if(!files.length) return;
    results=[]; cleanupUrls(); $('img-compress').disabled=true;
    var q=parseInt($('img-quality').value,10)/100;
    var fmtSel=$('img-format').value;
    var list=$('img-list'); list.textContent='';
    for(var i=0;i<files.length;i++){
      var f=files[i];
      try{
        var img=await loadImage(f);
        guardPixels(img.naturalWidth,img.naturalHeight);
        var c=document.createElement('canvas'); c.width=img.naturalWidth; c.height=img.naturalHeight;
        var ctx=c.getContext('2d');
        var outMime=fmtSel==='same'?f.type:fmtSel;
        if(outMime==='image/jpeg'){ ctx.fillStyle='#ffffff'; ctx.fillRect(0,0,c.width,c.height); }
        ctx.drawImage(img,0,0);
        var blob=await canvasToBlob(c,outMime,q);
        // Release canvas backing store and decoded image promptly.
        c.width=0; c.height=0; img.src='';
        if(!blob) throw new Error('Encoding failed');
        var ext=MIME[outMime]||'png';
        var U=window.XPATSOFT_Utils;
        var baseName=U?U.safeFilename(f.name,'image'):f.name;
        var stem=baseName.replace(/\.[^.]*$/,'')||'image';
        var name=U?U.safeFilename(stem+'-compressed.'+ext,'image-compressed.'+ext):stem+'-compressed.'+ext;
        var url=track(URL.createObjectURL(blob));
        results.push({name:name,blob:blob,orig:f.size,comp:blob.size,url:url});
        var red=f.size?Math.round((1-blob.size/f.size)*100):0;
        var d=el('div','img-item');
        var prev=document.createElement('img'); prev.src=url; prev.alt='';
        var info=el('div');
        info.appendChild(el('b',null,name));
        info.appendChild(document.createTextNode('\n'+fmt(f.size)+' \u2192 '+fmt(blob.size)+' ('+red+'% smaller)'));
        info.style.whiteSpace='pre-line';
        var a=el('a','xpatsoft-btn secondary','Download'); a.href=url; a.download=name;
        d.appendChild(prev); d.appendChild(info); d.appendChild(a); list.appendChild(d);
        await yieldUI(); // keep UI responsive between files
      }catch(e){ status('Failed: '+f.name+' \u2014 '+e.message); }
    }
    $('img-zip').disabled=results.length===0;
    status('Compressed '+results.length+' image(s).',true);
    $('img-compress').disabled=false;
  }
  document.addEventListener('DOMContentLoaded', function(){
    if(!$('img-files')) return;
    var drop=$('img-drop');
    $('img-quality').addEventListener('input',function(){ $('img-quality-val').textContent=this.value; });
    $('img-files').addEventListener('change',function(e){ addFiles(e.target.files); });
    drop.addEventListener('dragover',function(e){e.preventDefault(); drop.classList.add('drag');});
    drop.addEventListener('dragleave',function(){drop.classList.remove('drag');});
    drop.addEventListener('drop',function(e){e.preventDefault(); drop.classList.remove('drag'); addFiles(e.dataTransfer.files);});
    $('img-compress').addEventListener('click',compressAll);
    $('img-zip').addEventListener('click',async function(){
      if(typeof JSZip==='undefined'){ alert('ZIP library not loaded. Download files individually.'); return; }
      var zip=new JSZip();
      results.forEach(function(r){ zip.file(r.name,r.blob); });
      var content=await zip.generateAsync({type:'blob'});
      var url=track(URL.createObjectURL(content));
      var a=document.createElement('a'); a.href=url; a.download='xpatsoft-images.zip'; document.body.appendChild(a); a.click(); a.remove();
    });
    $('img-reset').addEventListener('click',function(){ cleanupUrls(); location.reload(); });
    window.addEventListener('pagehide', cleanupUrls);
    window.addEventListener('beforeunload', cleanupUrls);
  });
})();
