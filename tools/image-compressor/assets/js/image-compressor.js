(function(){
  'use strict';
  function $(id){return document.getElementById(id);}
  var files=[], results=[];
  var MIME={ 'image/jpeg':'jpg','image/png':'png','image/webp':'webp' };
  function fmt(b){ if(b<1024) return b+' B'; if(b<1048576) return (b/1024).toFixed(1)+' KB'; return (b/1048576).toFixed(2)+' MB'; }
  function status(m,ok){ $('img-status').innerHTML='<div class="'+(ok?'xpatsoft-success':'xpatsoft-error')+'">'+m+'</div>'; }
  function addFiles(list){
    Array.from(list).forEach(function(f){
      if(!MIME[f.type]){ status('Unsupported format: '+f.name+'. Use JPG, PNG or WebP.'); return; }
      files.push(f);
    });
    renderList(); $('img-compress').disabled=files.length===0;
    if(files.length) status(files.length+' file(s) ready.',true);
  }
  function renderList(){
    var box=$('img-list'); box.innerHTML='';
    files.forEach(function(f,i){
      var d=document.createElement('div'); d.className='img-item';
      var img=document.createElement('img'); img.src=URL.createObjectURL(f); img.alt=f.name;
      var info=document.createElement('div'); info.innerHTML='<b>'+f.name+'</b><br>'+fmt(f.size)+' &middot; '+f.type;
      var btn=document.createElement('button'); btn.className='xpatsoft-btn secondary'; btn.textContent='Remove';
      btn.addEventListener('click',function(){files.splice(i,1); renderList();});
      d.appendChild(img); d.appendChild(info); d.appendChild(btn); box.appendChild(d);
    });
  }
  function loadImage(file){ return new Promise(function(res,rej){ var img=new Image(); img.onload=function(){res(img);}; img.onerror=rej; img.src=URL.createObjectURL(file); }); }
  function canvasToBlob(c,mime,q){ return new Promise(function(res){ c.toBlob(res,mime,q); }); }
  async function compressAll(){
    if(!files.length) return;
    if(typeof JSZip==='undefined'){ status('ZIP library not loaded (needed only for batch ZIP). Individual downloads still work.'); }
    results=[]; $('img-compress').disabled=true;
    var q=parseInt($('img-quality').value,10)/100;
    var fmtSel=$('img-format').value;
    var list=$('img-list'); list.innerHTML='';
    for(var i=0;i<files.length;i++){
      var f=files[i];
      try{
        var img=await loadImage(f);
        var c=document.createElement('canvas'); c.width=img.naturalWidth; c.height=img.naturalHeight;
        var ctx=c.getContext('2d');
        var outMime=fmtSel==='same'?f.type:fmtSel;
        if(outMime==='image/jpeg'){ ctx.fillStyle='#ffffff'; ctx.fillRect(0,0,c.width,c.height); }
        ctx.drawImage(img,0,0);
        var blob=await canvasToBlob(c,outMime,q);
        if(!blob) throw new Error('Encoding failed');
        var ext=MIME[outMime]||'png';
        var name=f.name.replace(/\.[^.]+$/,'')+'-compressed.'+ext;
        results.push({name:name,blob:blob,orig:f.size,comp:blob.size,url:URL.createObjectURL(blob),preview:URL.createObjectURL(blob)});
        var red=f.size?Math.round((1-blob.size/f.size)*100):0;
        var d=document.createElement('div'); d.className='img-item';
        d.innerHTML='<img src="'+results[results.length-1].preview+'" alt=""><div><b>'+name+'</b><br>'+fmt(f.size)+' \u2192 '+fmt(blob.size)+' ('+red+'% smaller)</div>';
        var a=document.createElement('a'); a.className='xpatsoft-btn secondary'; a.textContent='Download'; a.href=results[results.length-1].url; a.download=name;
        d.appendChild(a); list.appendChild(d);
      }catch(e){ status('Failed: '+f.name+' — '+e.message); }
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
      var a=document.createElement('a'); a.href=URL.createObjectURL(content); a.download='xpatsoft-images.zip'; a.click();
    });
    $('img-reset').addEventListener('click',function(){location.reload();});
  });
})();
