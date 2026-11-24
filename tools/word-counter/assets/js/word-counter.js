(function(){
  'use strict';
  function $(id){return document.getElementById(id);}
  function el(tag, cls, text){ var e=document.createElement(tag); if(cls) e.className=cls; if(text!=null) e.textContent=text; return e; }
  function count(text){
    var chars=text.length;
    var charsNoSpace=text.replace(/\s/g,'').length;
    var trimmed=text.trim();
    var words=trimmed?trimmed.split(/\s+/).filter(Boolean):[];
    var wordCount=words.length;
    var sentences=(text.match(/[^.!?]+[.!?]+/g)||[]).length || (trimmed?1:0);
    var paras=trimmed?trimmed.split(/\n\s*\n/).filter(function(p){return p.trim();}).length:0;
    var avgLen=wordCount? (words.reduce(function(a,w){return a+w.length;},0)/wordCount):0;
    var readMin=wordCount/200, speakMin=wordCount/150;
    var freq={};
    words.forEach(function(w){ var k=w.toLowerCase().replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu,''); if(k) freq[k]=(freq[k]||0)+1; });
    var top=Object.keys(freq).map(function(k){return [k,freq[k]];}).sort(function(a,b){return b[1]-a[1];}).slice(0,10);
    var density=top.length&&wordCount? (top[0][1]/wordCount*100):0;
    return {chars:chars,charsNoSpace:charsNoSpace,wordCount:wordCount,sentences:sentences,paras:paras,avgLen:avgLen,readMin:readMin,speakMin:speakMin,top:top,density:density};
  }
  function fmtMin(m){ if(m<1) return Math.max(1,Math.round(m*60))+' sec'; return m.toFixed(1)+' min'; }
  function render(){
    var text=$('wc-text').value, c=count(text);
    var limit=parseInt($('wc-platform').value,10);
    var over=c.chars>limit;
    var box=$('wc-stats'); box.textContent='';
    var items=[
      [String(c.wordCount),'Words'],[String(c.chars),'Characters'],[String(c.charsNoSpace),'Chars (no spaces)'],
      [String(c.sentences),'Sentences'],[String(c.paras),'Paragraphs'],[fmtMin(c.readMin),'Reading time'],
      [fmtMin(c.speakMin),'Speaking time'],[c.avgLen.toFixed(1),'Avg word length'],
      [c.density.toFixed(1)+'%','Top keyword density'],[c.chars+' / '+limit,'Platform limit']
    ];
    items.forEach(function(it){
      var d=el('div','xpatsoft-stat');
      d.appendChild(el('b',null,it[0])); d.appendChild(el('span',null,it[1]));
      box.appendChild(d);
    });
    $('wc-platform-note').textContent=over?('Over limit by '+(c.chars-limit)+' characters. Platform limits change; treat this as guidance.'):('Within limit ('+(limit-c.chars)+' remaining). Platform limits change; treat this as guidance.');
    var topBox=$('wc-top'); topBox.textContent='';
    if(!c.top.length){ topBox.appendChild(el('p',null,'No words yet.')); }
    else {
      var list=el('div','wc-top-list');
      c.top.forEach(function(t){ list.appendChild(el('span','wc-chip',t[0]+' \u00D7'+t[1])); });
      topBox.appendChild(list);
    }
  }
  document.addEventListener('DOMContentLoaded', function(){
    if(!$('wc-text')) return;
    $('wc-text').addEventListener('input',render);
    $('wc-platform').addEventListener('change',render);
    $('wc-clear').addEventListener('click',function(){ $('wc-text').value=''; render(); $('wc-text').focus(); });
    $('wc-copy').addEventListener('click',function(){
      var c=count($('wc-text').value);
      var txt='Words: '+c.wordCount+'\nCharacters: '+c.chars+'\nChars (no spaces): '+c.charsNoSpace+'\nSentences: '+c.sentences+'\nParagraphs: '+c.paras+'\nReading time: '+fmtMin(c.readMin);
      if(navigator.clipboard && navigator.clipboard.writeText){ navigator.clipboard.writeText(txt).then(function(){ alert('Result copied.'); }); }
      else { alert(txt); }
    });
    render();
  });
})();
