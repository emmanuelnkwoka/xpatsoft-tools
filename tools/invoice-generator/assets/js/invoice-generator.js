(function(){
  'use strict';
  function $(id){return document.getElementById(id);}
  function el(tag, cls, text){ var e=document.createElement(tag); if(cls) e.className=cls; if(text!=null) e.textContent=text; return e; }
  var SYM={NGN:'\u20A6',USD:'$',GBP:'\u00A3',EUR:'\u20AC',GHS:'GH\u20B5',KES:'KSh ',ZAR:'R'};
  function money(v,cur){ return (SYM[cur]||cur+' ')+Number(v||0).toLocaleString('en-NG',{minimumFractionDigits:2,maximumFractionDigits:2}); }
  function toCents(v){ return Math.round((parseFloat(v)||0)*100); }
  function fromCents(c){ return c/100; }
  function addItem(desc,qty,price){
    var row=el('div','xpatsoft-row inv-item-row');
    var f1=el('div','xpatsoft-field'); f1.appendChild(el('label',null,'Description'));
    var i1=document.createElement('input'); i1.className='it-desc'; i1.value=desc||'Service'; f1.appendChild(i1);
    var f2=el('div','xpatsoft-field'); f2.appendChild(el('label',null,'Qty'));
    var i2=document.createElement('input'); i2.className='it-qty'; i2.type='number'; i2.min='0'; i2.step='1'; i2.value=qty||1; f2.appendChild(i2);
    var f3=el('div','xpatsoft-field'); f3.appendChild(el('label',null,'Unit price'));
    var i3=document.createElement('input'); i3.className='it-price'; i3.type='number'; i3.min='0'; i3.step='0.01'; i3.value=price||0; f3.appendChild(i3);
    var f4=el('div','xpatsoft-field'); f4.appendChild(el('label',null,'\u00A0'));
    var del=el('button','xpatsoft-btn secondary','Remove'); del.type='button';
    del.addEventListener('click',function(){row.remove();});
    f4.appendChild(del);
    row.appendChild(f1); row.appendChild(f2); row.appendChild(f3); row.appendChild(f4);
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
  function render(){
    var c=calc(), mode=$('inv-mode').value;
    var box=$('inv-preview'); box.textContent='';
    var doc=el('div','inv-doc');
    var head=el('div','inv-head');
    var left=document.createElement('div');
    left.appendChild(el('h2',null,(mode==='receipt'?'RECEIPT ':'INVOICE ')+$('inv-number').value));
    var biz=el('p');
    biz.textContent=$('biz-name').value+'\n'+$('biz-addr').value+'\n'+$('biz-email').value+' \u00B7 '+$('biz-phone').value+'\n'+$('biz-bank').value;
    biz.style.whiteSpace='pre-line';
    left.appendChild(biz);
    var right=document.createElement('div'); right.style.textAlign='right';
    var meta=el('p'); meta.textContent='Date: '+$('inv-date').value+'\nDue: '+$('inv-due').value; meta.style.whiteSpace='pre-line';
    right.appendChild(meta);
    if(mode==='receipt' && c.balC<=0) right.appendChild(el('span','inv-paid-badge','PAID'));
    head.appendChild(left); head.appendChild(right); doc.appendChild(head);
    var bill=el('p');
    var strong=el('strong',null,'Bill to: '); bill.appendChild(strong);
    bill.appendChild(document.createTextNode($('cust-name').value+'\n'+$('cust-addr').value+'\n'+$('cust-email').value));
    bill.style.whiteSpace='pre-line'; doc.appendChild(bill);
    var table=el('table','inv-table');
    var thead=document.createElement('thead'); var hr=document.createElement('tr');
    ['Description','Qty','Unit','Amount'].forEach(function(h){ hr.appendChild(el('th',null,h)); });
    thead.appendChild(hr); table.appendChild(thead);
    var tbody=document.createElement('tbody');
    var rows=document.querySelectorAll('.inv-item-row');
    if(!rows.length){
      var tr=document.createElement('tr'); var td=el('td',null,'No items. Add at least one item.'); td.colSpan=4; tr.appendChild(td); tbody.appendChild(tr);
    }
    rows.forEach(function(r){
      var d=r.querySelector('.it-desc').value,q=r.querySelector('.it-qty').value,p=r.querySelector('.it-price').value;
      var line=fromCents(Math.round((parseFloat(q)||0)*toCents(p)));
      var tr=document.createElement('tr');
      [d,q,money(p,c.cur),money(line,c.cur)].forEach(function(v){ tr.appendChild(el('td',null,v)); });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody); doc.appendChild(table);
    var totals=el('div','inv-totals');
    function trow(label,val,bold){
      var d=document.createElement('div');
      d.appendChild(el(bold?'strong':'span',null,label));
      d.appendChild(el(bold?'strong':'span',null,val));
      totals.appendChild(d);
    }
    trow('Subtotal',money(fromCents(c.subC),c.cur),false);
    trow('Discount ('+c.discPct+'%)','-'+money(fromCents(c.discC),c.cur),false);
    trow('Tax/VAT ('+c.taxPct+'%)',money(fromCents(c.taxC),c.cur),false);
    trow('Total',money(fromCents(c.totalC),c.cur),true);
    if(mode==='receipt'){
      trow('Amount paid',money(fromCents(c.paidC),c.cur),false);
      trow('Outstanding',money(fromCents(c.balC),c.cur),false);
      trow('Method',$('inv-paymethod').value,false);
    }
    doc.appendChild(totals);
    doc.appendChild(el('p',null,$('inv-notes').value));
    doc.appendChild(el('p',null,'This document is generated locally and does not constitute legal or tax advice.'));
    box.appendChild(doc);
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
      var c=calc(); var txt=( $('inv-mode').value==='receipt'?'Receipt ':'Invoice ')+$('inv-number').value+' \u2014 Total '+money(fromCents(c.totalC),c.cur)+' from '+$('biz-name').value;
      window.open('https://wa.me/?text='+encodeURIComponent(txt),'_blank','noopener');
    });
    $('inv-download').addEventListener('click',function(){
      render();
      if(typeof jspdf==='undefined'||typeof html2canvas==='undefined'){ alert('PDF library not loaded. Use Print / Save as PDF instead.'); return; }
      html2canvas($('inv-preview'),{scale:2}).then(function(canvas){
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
