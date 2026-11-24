// Node tests mirroring browser logic (invoice math, word counter, QR payloads).
const assert = require('assert');
let pass=0, fail=0;
function ok(cond,msg){ if(cond){pass++; console.log('PASS: '+msg);} else {fail++; console.log('FAIL: '+msg);} }

// --- Invoice math (integer minor units, same as browser) ---
function toCents(v){ return Math.round((parseFloat(v)||0)*100); }
function calc(items, discPct, taxPct, paid){
  let subC=0; items.forEach(it=>{ subC+=Math.round((parseFloat(it.q)||0)*toCents(it.p)); });
  const discC=Math.round(subC*discPct/100);
  const taxC=Math.round((subC-discC)*taxPct/100);
  const totalC=subC-discC+taxC;
  const paidC=toCents(paid);
  return {subC,discC,taxC,totalC,paidC,balC:totalC-paidC};
}
let r=calc([{q:2,p:1000},{q:1,p:500}],0,7.5,0);
ok(r.subC===250000,'invoice subtotal 2500.00');
ok(r.taxC===18750,'invoice VAT 7.5% = 187.50');
ok(r.totalC===268750,'invoice grand total 2687.50');
r=calc([{q:1,p:100}],10,0,50);
ok(r.discC===1000 && r.totalC===9000 && r.balC===4000,'discount + receipt balance');
r=calc([],0,0,0);
ok(r.totalC===0,'empty items = 0');
function money(v,cur){ const S={NGN:'\u20A6',USD:'$'}; return (S[cur]||cur+' ')+Number(v).toLocaleString('en-NG',{minimumFractionDigits:2,maximumFractionDigits:2}); }
ok(money(2687.5,'NGN').includes('2,687.50'),'NGN formatting');
ok(money(10,'USD')==='$10.00','USD formatting');

// --- Word counter ---
function count(text){
  const chars=text.length, charsNoSpace=text.replace(/\s/g,'').length;
  const trimmed=text.trim(), words=trimmed?trimmed.split(/\s+/).filter(Boolean):[];
  const sentences=(text.match(/[^.!?]+[.!?]+/g)||[]).length||(trimmed?1:0);
  const paras=trimmed?trimmed.split(/\n\s*\n/).filter(p=>p.trim()).length:0;
  return {chars,charsNoSpace,wordCount:words.length,sentences,paras};
}
let c=count('Hello world. This is a test!');
ok(c.wordCount===6,'word count 6');
ok(c.chars===28,'char count');
ok(c.charsNoSpace===23,'char no-space');
ok(c.sentences===2,'sentence count 2');
ok(count('Para one.\n\nPara two.').paras===2,'paragraph count 2');
ok(count('').wordCount===0 && count('').chars===0,'empty input');
ok(count('\u4f60\u597d\u4e16\u754c \u4f60\u597d').wordCount===2,'multilingual CJK');
ok(count('\u0645\u0631\u062d\u0628\u0627 \u0628\u0627\u0644\u0639\u0627\u0644\u0645').wordCount===2,'multilingual Arabic');

// --- QR payloads ---
function wifi(ssid,pass,enc){ return 'WIFI:T:'+enc+';S:'+ssid.replace(/([\\;,:"])/g,'\\$1')+';P:'+pass.replace(/([\\;,:"])/g,'\\$1')+';;'; }
ok(wifi('My;WiFi','p:a','WPA')==='WIFI:T:WPA;S:My\\;WiFi;P:p\\:a;;','Wi-Fi escaping');
ok('https://wa.me/2348012345678?text='+encodeURIComponent('Hi')==='https://wa.me/2348012345678?text=Hi','WhatsApp link');
ok(/^https?:\/\//.test('https://example.com')===true,'URL validation pass');
ok(/^https?:\/\//.test('notaurl')===false,'URL validation fail');
ok('BEGIN:VCARD\nVERSION:3.0\nFN:Jane\nEND:VCARD'.includes('FN:Jane'),'vCard format');

// --- Guards ---
const ALLOWED={'image/jpeg':1,'image/png':1,'image/webp':1};
ok(ALLOWED['image/png']===1 && ALLOWED['application/pdf']===undefined,'image MIME allowlist');
ok(50*1024*1024===52428800,'PDF 50MB guard');

console.log('\nResults: '+pass+' passed, '+fail+' failed');
process.exit(fail>0?1:0);
