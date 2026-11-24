const { PDFDocument, StandardFonts } = require('/tmp/node_modules/pdf-lib');
const pdfjs = require('pdfjs-dist/legacy/build/pdf.js');
/**
 * Verifies the PDF "Optimise" (text-preserving) strategy used by the browser module:
 * pdf-lib page copy + object streams, then text extraction with pdf.js.
 * Fails if extracted text from the optimised PDF differs from the source.
 * Requires: npm install pdf-lib@1.17.1 pdfjs-dist@3.11.174
 *
 * pdf.js runs in Node without the optional `canvas` package: parsing/extraction is
 * unaffected, only page rendering is. The warnings are noise, not errors.
 */
// 1. Silence pdf.js's optional-canvas + standard-font noise (extraction only).
const origWarn = console.warn.bind(console);
console.warn = (...args) => { if (/Cannot polyfill|fetchStandardFontData/.test(args.join(' '))) return; origWarn(...args); };
// 2. pdf.js 3.x expects a DOM-ish global; provide the minimum it touches.
globalThis.DOMMatrix = globalThis.DOMMatrix || class { constructor() { this.a=1;this.b=0;this.c=0;this.d=1;this.e=0;this.f=0; } };
globalThis.Path2D = globalThis.Path2D || class { constructor() {} };
globalThis.ImageData = globalThis.ImageData || class { constructor() {} };

(async () => {
  const src = await PDFDocument.create();
  const font = await src.embedFont(StandardFonts.Helvetica);
  const page = src.addPage([595, 842]);
  page.drawText('Hello XPATSOFT selectable text', { x: 50, y: 750, size: 14, font });
  src.setTitle('Test Doc');
  const srcBytes = await src.save();

  const loaded = await PDFDocument.load(srcBytes);
  const out = await PDFDocument.create();
  out.setTitle(loaded.getTitle());
  const copied = await out.copyPages(loaded, loaded.getPageIndices());
  copied.forEach(p => out.addPage(p));
  const outBytes = await out.save({ useObjectStreams: true });

  // Extract text with pdf.js from BOTH source and optimised
  async function extract(bytes) {
    const doc = await pdfjs.getDocument({ data: bytes }).promise;
    const p = await doc.getPage(1);
    const tc = await p.getTextContent();
    return tc.items.map(i => i.str).join(' ');
  }
  const srcText = await extract(srcBytes);
  const outText = await extract(outBytes);
  console.log('SOURCE text:    ', JSON.stringify(srcText));
  console.log('OPTIMISED text: ', JSON.stringify(outText));
  console.log('pages:', (await PDFDocument.load(outBytes)).getPages().length);
  const preserved = srcText === outText && outText.includes('selectable');
  console.log('VERDICT text preserved:', preserved);
  if (!preserved) { console.error('FAIL: text was not preserved by the optimise strategy'); process.exit(1); }
  process.exit(0);
})().catch(e => {
  console.error('ERROR: ' + (e && e.message ? e.message : String(e)));
  if (e && e.stack) console.error(e.stack.split('\n').slice(0, 8).join('\n'));
  process.exit(1);
});
