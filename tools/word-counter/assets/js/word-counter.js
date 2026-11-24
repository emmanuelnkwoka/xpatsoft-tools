(function(){
  'use strict';
  function $(id){return document.getElementById(id);}
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
    // Keyword density: top word frequency
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
    $('wc-stats').innerHTML=
      '<div class="xpatsoft-stat"><b>'+c.wordCount+'</b>Words</div>'+
      '<div class="xpatsoft-stat"><b>'+c.chars+'</b>Characters</div>'+
      '<div class="xpatsoft-stat"><b>'+c.charsNoSpace+'</b>Chars (no spaces)</div>'+
      '<div class="xpatsoft-stat"><b>'+c.sentences+'</b>Sentences</div>'+
      '<div class="xpatsoft-stat"><b>'+c.paras+'</b>Paragraphs</div>'+
      '<div class="xpatsoft-stat"><b>'+fmtMin(c.readMin)+'</b>Reading time</div>'+
      '<div class="xpatsoft-stat"><b>'+fmtMin(c.speakMin)+'</b>Speaking time</div>'+
      '<div class="xpatsoft-stat"><b>'+c.avgLen.toFixed(1)+'</b>Avg word length</div>'+
      '<div class="xpatsoft-stat"><b>'+c.density.toFixed(1)+'%</b>Top keyword density</div>'+
      '<div class="xpatsoft-stat"><b>'+c.chars+' / '+limit+'</b>Platform limit</div>';
    $('wc-platform-note').textContent=over?'Over limit by '+(c.chars-limit)+' characters. Platform limits change; treat this as guidance.':'Within limit ('+(limit-c.chars)+' remaining). Platform limits change; treat this as guidance.';
    $('wc-top').innerHTML=c.top.length?'<div class="wc-top-list">'+c.top.map(function(t){return '<span class="wc-chip">'+t[0]+' ×'+t[1]+'</span>';}).join('')+'</div>':'<p>No words yet.</p>';
  }
  document.addEventListener('DOMContentLoaded', function(){
    if(!$('wc-text')) return;
    $('wc-text').addEventListener('input',render);
    $('wc-platform').addEventListener('change',render);
    $('wc-clear').addEventListener('click',function(){ $('wc-text').value=''; render(); $('wc-text').focus(); });
    $('wc-copy').addEventListener('click',function(){
      var c=count($('wc-text').value);
      var txt='Words: '+c.wordCount+'\nCharacters: '+c.chars+'\nChars (no spaces): '+c.charsNoSpace+'\nSentences: '+c.sentences+'\nParagraphs: '+c.paras+'\nReading time: '+fmtMin(c.readMin);
      navigator.clipboard.writeText(txt).then(function(){ alert('Result copied.'); });
    });
    render();
  });
})();
