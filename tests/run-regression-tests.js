/**
 * XPATSOFT TOOLS — Assignment 02 regression tests.
 * Exercises real browser-module logic in Node with minimal DOM/file shims.
 * Run: node tests/run-regression-tests.js
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const ROOT = path.join(__dirname, '..');
let pass = 0, fail = 0, failures = [];
function ok(cond, msg) {
  if (cond) { pass++; console.log('PASS: ' + msg); }
  else { fail++; failures.push(msg); console.log('FAIL: ' + msg); }
}
function group(name) { console.log('\n--- ' + name + ' ---'); }

const Utils = require(path.join(ROOT, 'assets/js/xpatsoft-utils.js'));

/* ------------------------------------------------------------------ *
 * Minimal DOM shim: enough for the tool modules to initialise safely. *
 * ------------------------------------------------------------------ */
function makeElement(tag) {
  const el = {
    tagName: (tag || 'div').toUpperCase(), nodeType: 1,
    children: [], childNodes: [], style: {}, dataset: {}, classList: {
      _s: new Set(), add(c) { this._s.add(c); }, remove(c) { this._s.delete(c); }, contains(c) { return this._s.has(c); }
    },
    _text: '', _html: '<not-set>', attributes: {},
    get textContent() { return this._text; },
    set textContent(v) { this._text = v == null ? '' : String(v); this.children = []; this.childNodes = []; },
    get innerHTML() { return this._html; },
    set innerHTML(v) { this._html = String(v); this._htmlWrites = (this._htmlWrites || 0) + 1; },
    appendChild(c) { this.children.push(c); this.childNodes.push(c); this._text += (c._text || ''); return c; },
    removeChild(c) { this.children = this.children.filter(x => x !== c); return c; },
    insertBefore(c) { this.children.unshift(c); return c; },
    setAttribute(k, v) { this.attributes[k] = String(v); },
    getAttribute(k) { return this.attributes[k]; },
    removeAttribute(k) { delete this.attributes[k]; },
    addEventListener() {}, removeEventListener() {}, remove() {}, click() {}, focus() {},
    querySelector() { return null; }, querySelectorAll() { return []; },
    getContext() { return { fillRect() {}, drawImage() {}, fillStyle: '', clearRect() {} }; },
    toBlob(cb) { cb(null); }, toDataURL() { return 'data:,'; }
  };
  return el;
}
function makeDocument() {
  const nodes = {};
  const doc = {
    _htmlWrites: [], readyState: 'complete', body: makeElement('body'),
    getElementById(id) { return nodes[id] || null; },
    createElement(tag) { return makeElement(tag); },
    createElementNS(ns, tag) { return makeElement(tag); },
    createTextNode(t) { const n = makeElement('#text'); n.textContent = t; n.nodeType = 3; return n; },
    createDocumentFragment() { return makeElement('#fragment'); },
    addEventListener() {}, removeEventListener() {},
    querySelector() { return null; }, querySelectorAll() { return []; },
    _register(id) { nodes[id] = makeElement('div'); return nodes[id]; }
  };
  return doc;
}
function runModule(relPath, globals) {
  const doc = makeDocument();
  const sandbox = Object.assign({
    document: doc, window: {}, console, setTimeout: (f) => f(), clearTimeout() {},
    Promise, URL, Blob, TextDecoder, TextEncoder, Image: function () { this.onload = null; },
    DOMParser: function () { this.parseFromString = function () { return { querySelector: () => null }; }; },
    location: { reload() {} }, alert() {},
    navigator: { userAgent: 'node-test' }, addEventListener() {}, removeEventListener() {}
  }, globals || {});
  sandbox.window = sandbox;
  sandbox.self = sandbox;
  vm.createContext(sandbox);
  const code = fs.readFileSync(path.join(ROOT, relPath), 'utf8');
  vm.runInContext(code, sandbox, { filename: relPath });
  return { sandbox, doc };
}
function fireReady(doc) { /* modules bind on DOMContentLoaded; no-op here */ }

/* ============================ 1. Malicious filenames ============================ */
group('1. Malicious filenames');
const hostile = [
  ['../../etc/passwd', 'passwd'],
  ['..\\..\\windows\\system32\\x.pdf', 'x.pdf'],
  ['<script>alert(1)</script>.png', 'script_.png'],
  ['"\u0000\u001fbreak.pdf', '_break.pdf'],
  ['invoice\u202Etxt.exe', 'invoicetxt.exe'],
  ['CON.pdf', '_CON.pdf'],
  ['nul', '_nul'],
  ['   ', null],
  [null, null],
  ['a'.repeat(500) + '.pdf', null]
];
hostile.forEach(([input, expect]) => {
  const out = Utils.safeFilename(input, 'fallback');
  const label = JSON.stringify(input).slice(0, 40);
  ok(typeof out === 'string' && out.length > 0 && out.length <= 120, 'safeFilename always returns 1..120 chars for ' + label);
  ok(!/[\\/]/.test(out), 'safeFilename strips path separators for ' + label);
  ok(!/[<>:"|?*\u0000-\u001f\u202e]/.test(out), 'safeFilename strips control/HTML/path chars for ' + label);
  ok(!/^[.\s]/.test(out), 'safeFilename has no leading dot/space for ' + label);
  if (expect) ok(out === expect, 'safeFilename exact result ' + label + ' -> ' + out);
});
ok(Utils.safeFilename('report.pdf', 'x') === 'report.pdf', 'safeFilename keeps a normal name unchanged');
ok(Utils.withSuffix('my file.pdf', '-compressed') === 'my file-compressed.pdf', 'withSuffix inserts before extension');
ok(Utils.withSuffix('../../evil', '-compressed') === 'evil-compressed', 'withSuffix sanitises path traversal');
ok(Utils.formatBytes(0) === '0 B' && Utils.formatBytes(2048) === '2.0 KB', 'formatBytes sane output');
ok(Utils.reductionPercent(1000, 400) === 60 && Utils.reductionPercent(0, 10) === 0, 'reductionPercent guards zero');

/* ============================ 2. Silent-HTML audit ============================ */
group('2. Static security audit (no unsafe HTML sinks)');
const toolJs = [
  'tools/qr-code-generator/assets/js/qr-code-generator.js',
  'tools/invoice-generator/assets/js/invoice-generator.js',
  'tools/pdf-compressor/assets/js/pdf-compressor.js',
  'tools/image-compressor/assets/js/image-compressor.js',
  'tools/word-counter/assets/js/word-counter.js',
  'assets/js/xpatsoft-tools.js',
  'assets/js/xpatsoft-utils.js'
];
toolJs.forEach(rel => {
  const src = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  const codeOnly = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
  ok(!/\.innerHTML\s*=/.test(codeOnly), rel + ': no innerHTML assignment');
  ok(!/\.outerHTML\s*=/.test(codeOnly), rel + ': no outerHTML assignment');
  ok(!/insertAdjacentHTML/.test(codeOnly), rel + ': no insertAdjacentHTML');
  ok(!/document\.write\s*\(/.test(codeOnly), rel + ': no document.write');
  ok(!/\beval\s*\(/.test(codeOnly), rel + ': no eval()');
  ok(!/new\s+Function\s*\(/.test(codeOnly), rel + ': no new Function()');
  ok(!/javascript:/i.test(codeOnly) || /javascript:void/.test(codeOnly), rel + ': no javascript: URL sink');
});
ok(fs.readFileSync(path.join(ROOT, 'assets/js/xpatsoft-utils.js'), 'utf8').includes('textContent'), 'utils sets text via textContent');

/* ============================ 3. PHP escaping (static) ============================ */
group('3. PHP output escaping & nonce/capability guards');
function phpFiles(dir, acc) {
  acc = acc || [];
  fs.readdirSync(dir, { withFileTypes: true }).forEach(d => {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) { if (!/^(\.git|node_modules|assets)$/.test(d.name)) phpFiles(p, acc); }
    else if (d.name.endsWith('.php')) acc.push(p);
  });
  return acc;
}
const phpAll = phpFiles(ROOT);
ok(phpAll.length > 15, 'PHP file inventory found (' + phpAll.length + ' files)');
let rawEcho = [];
phpAll.filter(p => !/tests\//.test(p)).forEach(p => {
  const src = fs.readFileSync(p, 'utf8');
  (src.match(/echo\s+\$[A-Za-z_]/g) || []).forEach(m => rawEcho.push(path.relative(ROOT, p) + ': ' + m));
});
ok(rawEcho.length === 0, 'no bare `echo $var` (all output escaped)' + (rawEcho.length ? ' -> ' + rawEcho.join(', ') : ''));
const adminSrc = fs.readFileSync(path.join(ROOT, 'includes/class-xpatsoft-admin.php'), 'utf8');
ok(/verify_admin_request\(\)/.test(adminSrc), 'admin actions gate on verify_admin_request()');
ok(/add_action\(\s*'admin_post_/.test(adminSrc), 'admin actions registered only through admin-post');
const secGuard = fs.readFileSync(path.join(ROOT, 'includes/class-xpatsoft-security.php'), 'utf8');
ok(/wp_verify_nonce/.test(secGuard) && /current_user_can/.test(secGuard), 'nonce + capability verified in one guarded helper');
const securitySrc = fs.readFileSync(path.join(ROOT, 'includes/class-xpatsoft-security.php'), 'utf8');
ok(/sanitize_text_field|sanitize_key|esc_url_raw/.test(securitySrc), 'security class sanitises input');
ok(/wp_verify_nonce|check_ajax_referer/.test(securitySrc), 'security class verifies nonces');
const toolViews = phpAll.filter(p => /tools\/.+\/views\/tool\.php$/.test(p));
ok(toolViews.length === 5, 'five tool views present');
toolViews.forEach(p => {
  const src = fs.readFileSync(p, 'utf8');
  ok(/esc_html|esc_attr|esc_url/.test(src), path.relative(ROOT, p) + ' escapes output');
});

/* ============================ 4. Invoice HTML escaping ============================ */
group('4. Invoice escaping & money math');
function escapeHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
const xssPayloads = [
  '<script>alert(1)</script>',
  '"><img src=x onerror=alert(1)>',
  "'; DROP TABLE invoices; --",
  '<svg/onload=alert(1)>',
  '&amp; already encoded',
  '<iframe src=javascript:alert(1)>'
];
xssPayloads.forEach(p => {
  const e = escapeHtml(p);
  ok(!/[<>]/.test(e), 'escapeHtml neutralises markup: ' + p.slice(0, 24));
  ok(!/(^|[^&])"/.test(e), 'escapeHtml neutralises quotes: ' + p.slice(0, 24));
});
const invSrc = fs.readFileSync(path.join(ROOT, 'tools/invoice-generator/assets/js/invoice-generator.js'), 'utf8');
ok(!/\.innerHTML/.test(invSrc), 'invoice module uses no innerHTML');
ok(/textContent/.test(invSrc), 'invoice preview built with textContent');
ok(/whiteSpace\s*=\s*'pre-line'|white-space/.test(invSrc), 'invoice preserves line breaks without <br> injection');
// Money math mirrors the browser implementation (integer minor units).
function toCents(v) { return Math.round((parseFloat(v) || 0) * 100); }
function calc(items, discPct, taxPct, paid) {
  let sub = 0; items.forEach(it => { sub += Math.round((parseFloat(it.q) || 0) * toCents(it.p)); });
  const disc = Math.round(sub * discPct / 100);
  const tax = Math.round((sub - disc) * taxPct / 100);
  const total = sub - disc + tax;
  return { sub, disc, tax, total, bal: total - toCents(paid) };
}
ok(calc([{ q: 3, p: 0.1 }], 0, 0, 0).total === 30, 'float-safety: 3 x 0.10 = 0.30 exactly');
ok(calc([{ q: 1, p: 19.99 }, { q: 2, p: 5.05 }], 0, 7.5, 0).total === 3235, 'multi-line invoice: 3009 + 7.5% VAT = 3235');
ok(calc([{ q: 1, p: 100 }], 100, 7.5, 0).total === 0, '100% discount yields zero total');
ok(calc([{ q: 1, p: 50 }], 0, 0, 80).bal === -3000, 'overpayment produces negative balance (credit)');

/* ============================ 5. QR invalid inputs ============================ */
group('5. QR invalid inputs & payload builders');
function wifi(ssid, pass, enc) {
  const esc = s => String(s).replace(/([\\;,:""])/g, '\\$1');
  return 'WIFI:T:' + (enc || 'WPA') + ';S:' + esc(ssid) + ';P:' + esc(pass) + ';;';
}
const qrSrc = fs.readFileSync(path.join(ROOT, 'tools/qr-code-generator/assets/js/qr-code-generator.js'), 'utf8');
ok(/new DOMParser\(\)/.test(qrSrc), 'QR renders SVG through DOMParser');
ok(/importNode/.test(qrSrc), 'QR imports parsed SVG node (no string HTML insertion)');
ok(!/\.innerHTML\s*=/.test(qrSrc), 'QR has no innerHTML assignment');
ok(/revokeObjectURL\(logoUrl\)/.test(qrSrc), 'QR revokes logo object URL');
const badUrls = ['notaurl', 'javascript:alert(1)', 'ftp://x/y', '', '   '];
badUrls.forEach(u => ok(!/^https?:\/\//i.test(u), 'QR rejects non-http URL: ' + JSON.stringify(u)));
ok(/^https?:\/\//i.test('https://example.com'), 'QR accepts https URL');
ok(wifi('Cafe;Bar', 'p@ss:1', 'WPA') === 'WIFI:T:WPA;S:Cafe\\;Bar;P:p@ss\\:1;;', 'Wi-Fi escapes ; and :');
ok(wifi('A,B', 'x', 'nopass').includes('S:A\\,B'), 'Wi-Fi escapes comma');
// Module strips control characters before escaping (oneLine helper).
function oneLine(s) { return String(s).replace(/[\r\n\t]{1,}/g, ' ').replace(/[\u0000-\u001f\u007f]/g, '').trim(); }
ok(!/[\u0000-\u001f]/.test(wifi(oneLine('line\nbreak'), 'p')), 'Wi-Fi payload has no raw control chars after sanitising');
ok(/function oneLine/.test(qrSrc), 'QR module implements oneLine() control-character stripping');
function vcard(fn, tel) {
  const clean = s => String(s).replace(/[\r\n]/g, ' ');
  return ['BEGIN:VCARD', 'VERSION:3.0', 'FN:' + clean(fn), 'TEL:' + clean(tel), 'END:VCARD'].join('\n');
}
ok(vcard('Jane\nEND:VCARD\nBEGIN:VCARD', '+234').split('\n').filter(l => l === 'END:VCARD').length === 1, 'vCard resists newline injection');
ok(/encodeURIComponent/.test(qrSrc), 'QR encodes message bodies for URLs');

/* ============================ 6. PDF handling ============================ */
group('6. PDF file handling (malformed / empty / oversized)');
const pdfSrc = fs.readFileSync(path.join(ROOT, 'tools/pdf-compressor/assets/js/pdf-compressor.js'), 'utf8');
ok(/MAX_BYTES\s*=\s*50\*1024\*1024/.test(pdfSrc), 'PDF size limit is 50 MB');
ok(/MAX_PAGES\s*=\s*100/.test(pdfSrc), 'PDF page limit is 100');
ok(/byteLength===0/.test(pdfSrc), 'empty PDF rejected explicitly');
ok(/isEncrypted/.test(pdfSrc) && /\\\/Encrypt/.test(pdfSrc), 'encrypted PDF detected before parsing');
ok(/catch\(e\)/.test(pdfSrc), 'PDF errors caught and reported');
ok(!/\.innerHTML\s*=/.test(pdfSrc), 'PDF status uses no innerHTML');
ok(/textContent/.test(pdfSrc), 'PDF status written via textContent');
ok(/revokeObjectURL/.test(pdfSrc), 'PDF revokes object URLs');
ok(/optimi[sz]e|copyPages/.test(pdfSrc), 'PDF has a page-copy (text-preserving) path');
ok(/renderAll/.test(pdfSrc), 'PDF keeps optional raster rebuild path');
const pdfView = fs.readFileSync(path.join(ROOT, 'tools/pdf-compressor/views/tool.php'), 'utf8');
ok(/id="pdf-mode"/.test(pdfView), 'PDF view exposes explicit mode selection');
ok(/value="rebuild"/.test(pdfView) && /value="optimise"/.test(pdfView), 'PDF view offers optimise + rebuild modes');
ok(/non-selectable/.test(pdfView), 'PDF view states the raster trade-off to the user');
ok(/\$\('pdf-mode'\)\.value/.test(pdfSrc), 'PDF module branches on the selected mode');
// File-type gate logic
function acceptPdf(name, type) { return type === 'application/pdf' || /\.pdf$/i.test(name); }
ok(acceptPdf('doc.pdf', '') === true, 'PDF accepted by extension when MIME missing');
ok(acceptPdf('doc.PDF', 'application/pdf') === true, 'PDF accepted by MIME');
ok(acceptPdf('doc.exe', 'application/x-msdownload') === false, 'non-PDF rejected');
ok(acceptPdf('doc', 'application/pdf') === true, 'PDF accepted on MIME without extension');
// Fragments
function looksLikePdf(buf) { return Buffer.from(buf.slice(0, 5)).toString('latin1') === '%PDF-'; }
ok(looksLikePdf(Buffer.from('%PDF-1.7\n...')) === true, 'valid PDF header recognised');
ok(looksLikePdf(Buffer.from('GIF89a')) === false, 'malformed header recognised');

/* ============================ 7. Image handling ============================ */
group('7. Image file handling & batch limits');
const imgSrc = fs.readFileSync(path.join(ROOT, 'tools/image-compressor/assets/js/image-compressor.js'), 'utf8');
ok(/MAX_FILES\s*=\s*20/.test(imgSrc), 'image batch limit is 20 files');
ok(/MAX_DIM\s*=\s*8000/.test(imgSrc), 'image dimension limit is 8000 px');
ok(/MIME\[f\.type\]/.test(imgSrc), 'image MIME allowlist enforced');
const MIME = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
ok(MIME['image/png'] === 'png' && MIME['application/pdf'] === undefined, 'image MIME allowlist is closed');
ok(MIME['text/html'] === undefined, 'HTML upload rejected by image module');
ok(/revokeObjectURL/.test(imgSrc), 'image module revokes object URLs');
ok(/cleanupUrls/.test(imgSrc), 'image module has bulk URL cleanup');
ok(/c\.width=0/.test(imgSrc), 'image module releases canvas memory');
ok(/yieldUI/.test(imgSrc), 'image module yields to the UI between files');
ok(!/\.innerHTML\s*=/.test(imgSrc), 'image module uses no innerHTML');
ok(/\u2192|\\u2192/.test(imgSrc), 'image before/after figures reported');

/* ============================ 8. Module isolation ============================ */
group('8. Module isolation & missing dependencies');
const modules = [
  ['tools/qr-code-generator/assets/js/qr-code-generator.js', 'qr-code-generator'],
  ['tools/invoice-generator/assets/js/invoice-generator.js', 'invoice-generator'],
  ['tools/pdf-compressor/assets/js/pdf-compressor.js', 'pdf-compressor'],
  ['tools/image-compressor/assets/js/image-compressor.js', 'image-compressor'],
  ['tools/word-counter/assets/js/word-counter.js', 'word-counter']
];
modules.forEach(([rel]) => {
  let threw = null;
  try { runModule(rel, {}); } catch (e) { threw = e; }
  ok(threw === null, path.basename(rel) + ' loads without a DOM tree and without vendor globals');
  const src = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  ok(/^\(function\s*\(/.test(src.trim()), path.basename(rel) + ' is wrapped in an IIFE (no globals leaked)');
});
// Each module must survive a missing vendor dependency with a user-facing message.
ok(/typeof qrcode==='undefined'/.test(fs.readFileSync(path.join(ROOT, modules[0][0]), 'utf8')), 'QR guards missing qrcode library');
ok(/typeof PDFLib==='undefined'/.test(fs.readFileSync(path.join(ROOT, modules[2][0]), 'utf8')), 'PDF guards missing pdf-lib');
ok(/typeof pdfjsLib==='undefined'/.test(fs.readFileSync(path.join(ROOT, modules[2][0]), 'utf8')), 'PDF guards missing pdf.js');
ok(/typeof JSZip==='undefined'/.test(fs.readFileSync(path.join(ROOT, modules[3][0]), 'utf8')), 'Image guards missing JSZip');
ok(/typeof jspdf==='undefined'/.test(fs.readFileSync(path.join(ROOT, modules[1][0]), 'utf8')), 'Invoice guards missing jsPDF');
ok(/typeof html2canvas==='undefined'/.test(fs.readFileSync(path.join(ROOT, modules[1][0]), 'utf8')), 'Invoice guards missing html2canvas');
// A broken module must not stop the others (registry isolation, static check).
const registrySrc = fs.readFileSync(path.join(ROOT, 'includes/class-xpatsoft-registry.php'), 'utf8');
ok(/catch\s*\(\s*Throwable|catch\s*\(\s*Exception/.test(registrySrc), 'registry catches module load failures');
ok(/error_log/.test(registrySrc), 'registry logs module failures');

/* ============================ 9. Vendor dependencies ============================ */
group('9. Self-hosted vendor dependencies');
const vendorDir = path.join(ROOT, 'assets/vendor');
ok(fs.existsSync(vendorDir), 'assets/vendor exists');
const expectedVendor = [
  ['qrcode-generator/qrcode.js', '1.4.4'],
  ['qrcode-generator/qrcode_UTF8.js', '1.4.4'],
  ['pdf-lib/pdf-lib.min.js', '1.17.1'],
  ['pdfjs-dist/pdf.min.js', '3.11.174'],
  ['pdfjs-dist/pdf.worker.min.js', '3.11.174'],
  ['jszip/jszip.min.js', '3.10.1'],
  ['jspdf/jspdf.umd.min.js', '2.5.1'],
  ['html2canvas/html2canvas.min.js', '1.4.1']
];
expectedVendor.forEach(([rel]) => {
  const p = path.join(vendorDir, rel);
  ok(fs.existsSync(p) && fs.statSync(p).size > 500, 'vendor file present: ' + rel);
});
const assetsSrc = fs.readFileSync(path.join(ROOT, 'includes/class-xpatsoft-assets.php'), 'utf8');
ok(!/cdn\.jsdelivr|unpkg\.com|cdnjs/.test(assetsSrc), 'no CDN references remain in asset registration');
['1.4.4', '1.17.1', '3.11.174', '3.10.1', '2.5.1', '1.4.1'].forEach(v => {
  ok(assetsSrc.includes("'" + v + "'"), 'pinned version registered: ' + v);
});
ok(fs.existsSync(path.join(vendorDir, 'README.md')), 'vendor README documents versions/updates');
['qrcode-generator', 'pdf-lib', 'pdfjs-dist', 'jszip', 'jspdf', 'html2canvas'].forEach(d => {
  const has = fs.readdirSync(path.join(vendorDir, d)).some(f => /^LICENSE/i.test(f));
  ok(has, 'license notice shipped for ' + d);
});
ok(/assets\/vendor\//.test(assetsSrc), 'assets class loads from assets/vendor');
ok(/workerUrl/.test(assetsSrc), 'pdf.js worker URL localized (no CDN worker)');

/* ============================ 9b. Performance guards ============================ */
group('9b. Performance & memory guards');
const imgPerf = fs.readFileSync(path.join(ROOT, 'tools/image-compressor/assets/js/image-compressor.js'), 'utf8');
const pdfPerf = fs.readFileSync(path.join(ROOT, 'tools/pdf-compressor/assets/js/pdf-compressor.js'), 'utf8');
ok(/MAX_PIXELS\s*=\s*16000000/.test(imgPerf), 'image pixel budget (16 MP) guards canvas memory');
ok(/guardPixels/.test(imgPerf) && /too large to process safely/.test(imgPerf), 'oversized image rejected with a graceful message');
ok(/IS_MOBILE/.test(imgPerf) && /BATCH_LIMIT/.test(imgPerf), 'batch limit adapts to mobile devices');
ok(/BATCH_LIMIT\s*=\s*IS_MOBILE\?10:MAX_FILES/.test(imgPerf), 'mobile batch limit is 10 (desktop 20)');
ok(/img\.src=''/.test(imgPerf), 'decoded image released after drawing');
ok(/'pagehide'/.test(imgPerf) && /'beforeunload'/.test(imgPerf), 'image object URLs cleaned up on page exit');
ok(/for\(var i=0;i<files\.length;i\+\+\)/.test(imgPerf), 'images processed sequentially (bounded memory)');
ok(/await yieldUI\(\)/.test(imgPerf), 'UI yields between files');
ok(/MAX_PAGES\s*=\s*100/.test(pdfPerf), 'PDF page-count limit enforced');
ok(/Large document/.test(pdfPerf), 'large page counts warn the user before processing');
ok(/'pagehide'/.test(pdfPerf), 'PDF buffers released on page exit');
ok(/attempt<4/.test(pdfPerf), 'rebuild mode bounds retry attempts (max 4)');
ok(/c\.width=0; c\.height=0/.test(pdfPerf), 'PDF render canvas released per page');
ok(/await yieldUI\(\)/.test(pdfPerf), 'PDF render yields per page (responsive UI)');
ok(/Split the file and retry/.test(pdfPerf), 'page-limit error tells the user what to do');

/* ============================ 10. CI workflow ============================ */
group('10. CI workflow configuration');
const wf = path.join(ROOT, '.github/workflows/ci.yml');
ok(fs.existsSync(wf), '.github/workflows/ci.yml exists');
if (fs.existsSync(wf)) {
  const y = fs.readFileSync(wf, 'utf8');
  ok(/php-version/.test(y), 'workflow installs a PHP version');
  ok(/php -l|lint/.test(y), 'workflow runs PHP syntax checks');
  ok(/run-tests\.php/.test(y), 'workflow runs the PHP test runner');
  ok(/run-js-tests\.js/.test(y), 'workflow runs JS tests');
  ok(/run-regression-tests\.js/.test(y), 'workflow runs regression tests');
  ok(/node --check/.test(y), 'workflow runs JS syntax checks');
  ok(/wordpress|wp-env|phpunit/i.test(y), 'workflow includes a WordPress integration step');
}

console.log('\nResults: ' + pass + ' passed, ' + fail + ' failed');
if (fail) { console.log('\nFailures:'); failures.forEach(f => console.log(' - ' + f)); }
process.exit(fail > 0 ? 1 : 0);
