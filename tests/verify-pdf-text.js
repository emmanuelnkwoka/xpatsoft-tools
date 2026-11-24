/**
 * XPATSOFT TOOLS — PDF text-preservation verification.
 *
 * Reproduces the browser module's "Optimise" strategy in Node:
 *   load with pdf-lib -> copy pages -> save with object streams
 * then extracts text from BOTH the source and the output with pdf.js and fails
 * if they differ. This is the evidence behind the claim that Optimise mode
 * preserves selectable/searchable text.
 *
 * Requires: npm install --no-save pdf-lib@1.17.1 pdfjs-dist@3.11.174
 * Run:      node tests/verify-pdf-text.js
 */
'use strict';

const path = require('path');
const fs = require('fs');
const { createRequire } = require('module');

/* ---------------- dependency resolution (deterministic) ---------------- */
// Search order: XPATSOFT_PDF_DEPS (set by CI), then the plugin root.
// createRequire anchors resolution at a real path; plain require.resolve with
// { paths } also consults global folders and can pick up a stale /tmp tree.
const ROOTS = [];
if (process.env.XPATSOFT_PDF_DEPS) { ROOTS.push(path.resolve(process.env.XPATSOFT_PDF_DEPS)); }
ROOTS.push(path.join(__dirname, '..'));

function resolveDep(spec) {
  const tried = [];
  for (const root of ROOTS) {
    const isNodeModules = path.basename(root) === 'node_modules';
    const anchor = isNodeModules
      ? path.join(root, '__xpatsoft_resolve__.js')
      : path.join(root, 'node_modules', '__xpatsoft_resolve__.js');
    if (!fs.existsSync(isNodeModules ? root : path.join(root, 'node_modules'))) {
      tried.push(root + ' (no node_modules)');
      continue;
    }
    try {
      const resolved = createRequire(anchor).resolve(spec);
      if (fs.existsSync(resolved)) { return resolved; }
      tried.push(resolved + ' (missing on disk)');
    } catch (e) {
      tried.push(path.join(root, 'node_modules', spec) + ' (' + (e.code || 'error') + ')');
    }
  }
  console.error('DEPENDENCY MISSING: ' + spec);
  console.error('Roots searched: ' + ROOTS.join(', '));
  tried.forEach((t) => console.error('  tried ' + t));
  console.error('Install with: npm install --no-save pdf-lib@1.17.1 pdfjs-dist@3.11.174');
  process.exit(2);
}

const PDFLIB_PATH = resolveDep('pdf-lib');
const PDFJS_PATH = resolveDep('pdfjs-dist/legacy/build/pdf.js');
const { PDFDocument, StandardFonts } = require(PDFLIB_PATH);

/* ---------------- quiet, DOM-tolerant pdf.js bootstrap ---------------- */
// pdf.js probes optional native canvas deps and standard font data. Text
// extraction needs neither, so those specific warnings are suppressed.
const realWarn = console.warn.bind(console);
console.warn = (...args) => {
  const line = args.map(String).join(' ');
  if (/Cannot polyfill|fetchStandardFontData|UnknownErrorException/.test(line)) { return; }
  realWarn(...args);
};
globalThis.DOMMatrix = globalThis.DOMMatrix || class { constructor() { this.a = 1; this.b = 0; this.c = 0; this.d = 1; this.e = 0; this.f = 0; } };
globalThis.Path2D = globalThis.Path2D || class { constructor() {} };
globalThis.ImageData = globalThis.ImageData || class { constructor() {} };

let pdfjs;
try {
  pdfjs = require(PDFJS_PATH);
  if (typeof pdfjs.getDocument !== 'function' && pdfjs.default && typeof pdfjs.default.getDocument === 'function') {
    pdfjs = pdfjs.default;
  }
  if (typeof pdfjs.getDocument !== 'function') {
    throw new Error('getDocument unavailable; exports: ' + Object.keys(pdfjs || {}).join(','));
  }
} catch (e) {
  console.error('PDFJS LOAD FAILED: ' + e.message);
  console.error(String(e.stack || '').split('\n').slice(0, 8).join('\n'));
  process.exit(2);
}

/* ---------------- test ---------------- */
const SAMPLE = 'Hello XPATSOFT selectable text';
const EXPECTED_PAGES = 1;

async function extractText(bytes) {
  const doc = await pdfjs.getDocument({ data: bytes, isEvalSupported: false }).promise;
  const page = await doc.getPage(1);
  const content = await page.getTextContent();
  const text = content.items.map((i) => i.str).join(' ');
  await doc.destroy();
  return text;
}

(async () => {
  console.log('pdf-lib: ' + PDFLIB_PATH);
  console.log('pdf.js : ' + PDFJS_PATH);

  // 1. Build a source PDF that contains real, selectable text.
  const src = await PDFDocument.create();
  const font = await src.embedFont(StandardFonts.Helvetica);
  const page = src.addPage([595, 842]); // A4
  page.drawText(SAMPLE, { x: 50, y: 750, size: 14, font });
  src.setTitle('XPATSOFT Test Document');
  src.setAuthor('XPATSOFT');
  const srcBytes = await src.save();

  // 2. Apply the optimise strategy exactly as the browser module does.
  const loaded = await PDFDocument.load(srcBytes);
  const out = await PDFDocument.create();
  if (loaded.getTitle()) { out.setTitle(loaded.getTitle()); }
  if (loaded.getAuthor()) { out.setAuthor(loaded.getAuthor()); }
  const copied = await out.copyPages(loaded, loaded.getPageIndices());
  copied.forEach((p) => out.addPage(p));
  const outBytes = await out.save({ useObjectStreams: true });

  // 3. Verify geometry, metadata and text.
  const check = await PDFDocument.load(outBytes);
  const size = check.getPage(0).getSize();
  const pages = check.getPages().length;

  const srcText = await extractText(srcBytes);
  const outText = await extractText(outBytes);

  console.log('source bytes:   ' + srcBytes.length);
  console.log('optimised bytes:' + outBytes.length);
  console.log('pages:          ' + pages + ' (source ' + EXPECTED_PAGES + ')');
  console.log('page size:      ' + JSON.stringify(size));
  console.log('title:          ' + check.getTitle());
  console.log('SOURCE text:    ' + JSON.stringify(srcText));
  console.log('OPTIMISED text: ' + JSON.stringify(outText));

  const failures = [];
  if (pages !== EXPECTED_PAGES) { failures.push('page count changed'); }
  if (size.width !== 595 || size.height !== 842) { failures.push('page dimensions changed'); }
  if (check.getTitle() !== 'XPATSOFT Test Document') { failures.push('metadata lost'); }
  if (srcText !== outText) { failures.push('text differs after optimise'); }
  if (!outText.includes('selectable')) { failures.push('expected text missing from output'); }

  if (failures.length) {
    console.error('FAIL: ' + failures.join('; '));
    process.exit(1);
  }
  console.log('VERDICT: text, page geometry and metadata preserved by the optimise strategy');
  process.exit(0);
})().catch((e) => {
  console.error('ERROR: ' + (e && e.message ? e.message : String(e)));
  console.error(String((e && e.stack) || '').split('\n').slice(0, 8).join('\n'));
  process.exit(1);
});
