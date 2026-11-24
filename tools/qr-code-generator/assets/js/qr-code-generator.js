(function(){
  'use strict';
  function $(id){return document.getElementById(id);}
  function el(tag, cls, text){ var e=document.createElement(tag); if(cls) e.className=cls; if(text!=null) e.textContent=text; return e; }
  function showStatus(box, msg, ok){
    box.textContent='';
    box.appendChild(el('div', ok?'xpatsoft-success':'xpatsoft-error', msg));
  }
  function fieldsFor(type){
    var map={
      url:[['url','URL','https://example.com']],
      text:[['text','Text','Hello world']],
      whatsapp:[['phone','WhatsApp number (intl, digits only)','2348012345678'],['msg','Message','Hello!']],
      wifi:[['ssid','Network name (SSID)','MyWiFi'],['pass','Password',''],['enc','Encryption','WPA']],
      email:[['email','Email','you@example.com'],['subject','Subject','Hello'],['body','Body','']],
      phone:[['phone','Phone','+2348012345678']],
      vcard:[['fn','Full name','Jane Doe'],['tel','Phone','+2348012345678'],['email','Email','jane@example.com'],['org','Organisation',''],['url','Website','https://example.com']]
    };
    return map[type]||map.url;
  }
  function renderFields(){
    var t=$('qr-type').value, box=$('qr-fields');
    box.textContent='';
    fieldsFor(t).forEach(function(f){
      var d=el('div','xpatsoft-field');
      var l=el('label',null,f[1]); l.htmlFor='qr-'+f[0];
      var i=document.createElement('input'); i.id='qr-'+f[0]; i.value=f[2]; i.type=(f[0]==='email'?'email':'text');
      d.appendChild(l); d.appendChild(i); box.appendChild(d);
    });
  }
  function val(id){var e=$(id); return e?e.value.trim():'';}
  // Payload fields must not carry raw control characters (WIFI:/vCard injection).
  function oneLine(id){ return val(id).replace(/[\r\n\t]{1,}/g,' ').replace(/[\u0000-\u001f\u007f]/g,'').trim(); }
  function buildPayload(){
    var t=$('qr-type').value;
    if(t==='url'){var u=val('qr-url'); if(!/^https?:\/\//i.test(u)) throw new Error('Enter a valid URL starting with http:// or https://'); return u;}
    if(t==='text'){var x=val('qr-text'); if(!x) throw new Error('Enter text.'); return x;}
    if(t==='whatsapp'){var p=val('qr-phone').replace(/\D/g,''); if(!p) throw new Error('Enter WhatsApp number.'); var m=val('qr-msg'); return 'https://wa.me/'+p+(m?'?text='+encodeURIComponent(m):'');}
    if(t==='wifi'){var s=oneLine('qr-ssid'); if(!s) throw new Error('Enter Wi-Fi network name.'); var pw=oneLine('qr-pass').replace(/([\\;,:"])/g,'\\$1'); var enc=oneLine('qr-enc')||'WPA'; return 'WIFI:T:'+enc+';S:'+s.replace(/([\\;,:"])/g,'\\$1')+';P:'+pw+';;';}
    if(t==='email'){var e=val('qr-email'); if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) throw new Error('Enter a valid email.'); return 'mailto:'+e+'?subject='+encodeURIComponent(val('qr-subject'))+'&body='+encodeURIComponent(val('qr-body'));}
    if(t==='phone'){var ph=val('qr-phone'); if(!ph) throw new Error('Enter phone number.'); return 'tel:'+ph;}
    if(t==='vcard'){var fn=oneLine('qr-fn'); if(!fn) throw new Error('Enter full name.'); return 'BEGIN:VCARD\nVERSION:3.0\nFN:'+fn+'\nTEL:'+oneLine('qr-tel')+'\nEMAIL:'+oneLine('qr-email')+'\nORG:'+oneLine('qr-org')+'\nURL:'+oneLine('qr-url')+'\nEND:VCARD';}
    throw new Error('Unknown type.');
  }
  var lastSvg='', lastPng=null, logoUrl=null;
  function generate(){
    showStatus($('qr-error'),'');
    try{
      if(typeof qrcode==='undefined') throw new Error('QR library failed to load. Check connection and retry.');
      var payload=buildPayload();
      var size=parseInt($('qr-size').value,10), ec=$('qr-ec').value, fg=$('qr-fg').value, bg=$('qr-bg').value;
      var qr=qrcode(0,ec); qr.addData(payload); qr.make();
      var svg=qr.createSvgTag({scalable:true,margin:4});
      svg=svg.replace(/#000000/gi,fg).replace(/#ffffff/gi,bg);
      lastSvg=svg;
      var preview=$('qr-preview'); preview.textContent='';
      // Safe SVG insertion via DOMParser (no innerHTML).
      var doc=new DOMParser().parseFromString(svg,'image/svg+xml');
      var svgEl=doc.querySelector('svg');
      if(svgEl) preview.appendChild(document.importNode(svgEl,true));
      var c=document.createElement('canvas'); c.width=size; c.height=size;
      var ctx=c.getContext('2d'); ctx.fillStyle=bg; ctx.fillRect(0,0,size,size);
      var modules=qr.getModuleCount(), cell=size/modules;
      ctx.fillStyle=fg;
      for(var r=0;r<modules;r++)for(var col=0;col<modules;col++){ if(qr.isDark(r,col)) ctx.fillRect(col*cell,r*cell,cell,cell); }
      var logoInput=$('qr-logo');
      function finish(){ lastPng=c; $('qr-download-png').disabled=false; $('qr-download-svg').disabled=false; }
      if(logoInput.files && logoInput.files[0]){
        if(logoUrl) URL.revokeObjectURL(logoUrl);
        logoUrl=URL.createObjectURL(logoInput.files[0]);
        var img=new Image();
        img.onload=function(){
          var s=size*0.22, x=(size-s)/2, y=(size-s)/2;
          ctx.fillStyle=bg; ctx.fillRect(x-4,y-4,s+8,s+8);
          ctx.drawImage(img,x,y,s,s); finish();
        };
        img.onerror=function(){ showStatus($('qr-error'),'Logo could not be loaded. Continuing without logo.',false); finish(); };
        img.src=logoUrl;
      } else finish();
    }catch(e){ showStatus($('qr-error'), e.message, false); }
  }
  function download(name, blob){
    var U=window.XPATSOFT_Utils;
    var a=document.createElement('a'); var url=URL.createObjectURL(blob);
    a.href=url; a.download=U?U.safeFilename(name,'xpatsoft-qr'):name; a.rel='noopener';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function(){URL.revokeObjectURL(url);},2000);
  }
  document.addEventListener('DOMContentLoaded', function(){
    if(!$('qr-type')) return;
    renderFields();
    $('qr-type').addEventListener('change', renderFields);
    $('qr-generate').addEventListener('click', generate);
    $('qr-download-png').addEventListener('click', function(){ if(lastPng) lastPng.toBlob(function(b){ if(b) download('xpatsoft-qr.png',b); }); });
    $('qr-download-svg').addEventListener('click', function(){ download('xpatsoft-qr.svg', new Blob([lastSvg],{type:'image/svg+xml'})); });
    $('qr-reset').addEventListener('click', function(){ location.reload(); });
  });
})();
