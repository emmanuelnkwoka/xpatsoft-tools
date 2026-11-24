(function(){
  'use strict';
  function $(id){return document.getElementById(id);}
  var SYM={NGN:'\u20A6',USD:'$',GBP:'\u00A3',EUR:'\u20AC',GHS:'GH\u20B5',KES:'KSh ',ZAR:'R'};
  function money(v,cur){ return (SYM[cur]||cur+' ')+Number(v||0).toLocaleString('en-NG',{minimumFractionDigits:2,maximumFractionDigits:2}); }
  // Integer minor-unit math to avoid float errors: work in cents.
  function toCents(v){ return Math.round((parseFloat(v)||0)*100); }
  function fromCents(c){ return c/100; }
  function addItem(desc,qty,price){
    var row=document.createElement('div'); row.className='xpatsoft-row inv-item-row';
    row.innerHTML='<div class="xpatsoft-field"><label>Description</label><input class="it-desc" value="'+(desc||'Service')+'"></div>'+
      '<div class="xpatsoft-field"><label>Qty</label><input class="it-qty" type="number" min="0" step="1" value="'+(qty||1)+'"></div>'+
      '<div class="xpatsoft-field"><label>Unit price</label><input class="it-price" type="number" min="0" step="0.01" value="'+(price||0)+'"></div>'+
      '<div class="xpatsoft-field"><label>&nbsp;</label><button class="xpatsoft-btn secondary it-del">Remove</button></div>';
    row.querySelector('.it-del').addEventListener('click',function(){row.remove();});
    $('inv-items').appendChild(row);
  }
  function calc(){
    var cur=$('inv-currency').value;
    var rows=document.querySelectorAll('.inv-item-row'); var subC=0;
    rows.forEach(function(r){
      var q=parseFloat(r.querySelector('.it-qty').value)||0;
      var pC=toCents(r.querySelector('.it-price').value);
      subC+=Math.round(q*pC);
    });
    var discPct=parseFloat($('inv-discount').value)||0;
    var taxPct=parseFloat($('inv-tax').value)||0;
    var discC=Math.round(subC*discPct/100);
    var afterC=subC-discC;
    var taxC=Math.round(afterC*taxPct/100);
    var totalC=afterC+taxC;
    var paidC=toCents($('inv-paid').value);
    var balC=totalC-paidC;
    return {cur:cur,subC:subC,discC:discC,taxC:taxC,totalC:totalC,paidC:paidC,balC:balC,taxPct:taxPct,discPct:discPct};
  }
  function esc(s){return String(s||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function render(){
    var c=calc(), mode=$('inv-mode').value;
    var rows=''; document.querySelectorAll('.inv-item-row').forEach(function(r){
      var d=r.querySelector('.it-desc').value,q=r.querySelector('.it-qty').value,p=r.querySelector('.it-price').value;
      var line=fromCents(Math.round((parseFloat(q)||0)*toCents(p)));
      rows+='<tr><td>'+esc(d)+'</td><td>'+esc(q)+'</td><td>'+money(p,c.cur)+'</td><td>'+money(line,c.cur)+'</td></tr>';
    });
    if(!rows) rows='<tr><td colspan="4">No items. Add at least one item.</td></tr>';
    var title=mode==='receipt'?'RECEIPT':'INVOICE';
    var paidBadge=mode==='receipt'&&c.balC<=0?'<span class="inv-paid-badge">PAID</span>':'';
    $('inv-preview').innerHTML='<div class="inv-doc"><div class="inv-head"><div><h2>'+title+' '+esc($('inv-number').value)+'</h2><p>'+esc($('biz-name').value)+'<br>'+esc($('biz-addr').value)+'<br>'+esc($('biz-email').value)+' &middot; '+esc($('biz-phone').value)+'<br>'+esc($('biz-bank').value)+'</p></div><div style="text-align:right"><p>Date: '+esc($('inv-date').value)+'<br>Due: '+esc($('inv-due').value)+'<br>'+paidBadge+'</p></div></div>'+
      '<p><strong>Bill to:</strong> '+esc($('cust-name').value)+'<br>'+esc($('cust-addr').value)+'<br>'+esc($('cust-email').value)+'</p>'+
      '<table class="inv-table"><thead><tr><th>Description</th><th>Qty</th><th>Unit</th><th>Amount</th></tr></thead><tbody>'+rows+'</tbody></table>'+
      '<div class="inv-totals"><div><span>Subtotal</span><span>'+money(fromCents(c.subC),c.cur)+'</span></div>'+
      '<div><span>Discount ('+c.discPct+'%)</span><span>-'+money(fromCents(c.discC),c.cur)+'</span></div>'+
      '<div><span>Tax/VAT ('+c.taxPct+'%)</span><span>'+money(fromCents(c.taxC),c.cur)+'</span></div>'+
      '<div><strong>Total</strong><strong>'+money(fromCents(c.totalC),c.cur)+'</strong></div>'+
      (mode==='receipt'?'<div><span>Amount paid</span><span>'+money(fromCents(c.paidC),c.cur)+'</span></div><div><span>Outstanding</span><span>'+money(fromCents(c.balC),c.cur)+'</span></div><div><span>Method</span><span>'+esc($('inv-paymethod').value)+'</span></div>':'')+
      '</div><p>'+esc($('inv-notes').value)+'</p><p style="font-size:.8rem;color:#666">This document is generated locally and does not constitute legal or tax advice.</p></div>';
  }
  document.addEventListener('DOMContentLoaded', function(){
    if(!$('inv-mode')) return;
    var today=new Date().toISOString().slice(0,10); $('inv-date').value=today; $('inv-due').value=today;
    addItem('Consulting services',1,50000); addItem('Design work',2,25000);
    $('inv-add-item').addEventListener('click',function(){addItem('',1,0);});
    $('inv-preview-btn').addEventListener('click',render);
    $('inv-print').addEventListener('click',function(){render(); window.print();});
    $('inv-clear').addEventListener('click',function(){location.reload();});
    $('inv-whatsapp').addEventListener('click',function(){
      var c=calc(); var txt=($('inv-mode').value==='receipt'?'Receipt ':'Invoice ')+$('inv-number').value+' — Total '+money(fromCents(c.totalC),c.cur)+' from '+$('biz-name').value;
      window.open('https://wa.me/?text='+encodeURIComponent(txt),'_blank');
    });
    $('inv-download').addEventListener('click',function(){
      render();
      if(typeof jspdf==='undefined'||typeof html2canvas==='undefined'){ alert('PDF library not loaded. Use Print / Save as PDF instead.'); return; }
      var el=$('inv-preview');
      html2canvas(el,{scale:2}).then(function(canvas){
        var pdf=new jspdf.jsPDF('p','mm','a4');
        var img=canvas.toDataURL('image/jpeg',0.95);
        var w=pdf.internal.pageSize.getWidth()-20;
        var h=canvas.height*w/canvas.width;
        pdf.addImage(img,'JPEG',10,10,w,h);
        pdf.save($('inv-number').value+'.pdf');
      });
    });
    render();
  });
})();
