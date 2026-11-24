# XPATSOFT TOOLS

**FREE. PRIVATE. USEFUL. NO UNNECESSARY SIGNUP.**

A modular WordPress plugin providing five browser-first utility tools. All processing happens locally in the visitor's browser — no uploads, no accounts, no tracking of content.

**Website:** https://xpatsoft.com/ · **Tools directory:** https://xpatsoft.com/tools/

## Tools

| ID | Tool | What it does |
|---|---|---|
| `qr-code-generator` | QR Code Generator | Static QR for URL, text, WhatsApp, Wi-Fi, email, phone, vCard. PNG/SVG download, colours, logo, sizes, error correction. |
| `invoice-generator` | Invoice & Receipt Generator | Invoice + receipt modes, multi-currency (incl. NGN), editable 7.5% Nigerian VAT preset, print/PDF/WhatsApp share. |
| `pdf-compressor` | PDF Compressor | Real browser-local compression (pdf.js render + pdf-lib rebuild). Quality presets + target sizes. |
| `image-compressor` | Image Compressor | Batch JPG/PNG/WebP compression via Canvas, quality slider, ZIP download. |
| `word-counter` | Word & Character Counter | Live counts, reading/speaking time, keyword density, platform limits. |

## Quick start

1. Copy this folder to `wp-content/plugins/xpatsoft-tools/`.
2. Activate **XPATSOFT TOOLS** in WordPress admin.
3. Create a page, add `[xpatsoft_tools]`.
4. Create one page per tool with `[xpatsoft_tool id="qr-code-generator"]` etc.
5. Manage modules under **XPATSOFT Tools** admin menu.

See [Installation.md](Installation.md), [Architecture.md](Architecture.md), [Security.md](Security.md), [Testing.md](Testing.md), [Tool-development-guide.md](Tool-development-guide.md), [Dependency-licenses.md](Dependency-licenses.md).

## Privacy promise

Files and text never leave the device. No server storage, no forced email capture. Optional email capture is out of scope for this phase.

## Requirements

- WordPress 6.0+, PHP 7.4+
- No build step. All libraries are self-hosted (pinned versions, licences included) and enqueued lazily per tool only. Zero third-party requests.

## v1.1.0 — Security audit & engineering corrections (Assignment 02)

This release is a corrective pass over v1.0.0. No new tools, no redesign, no deployment.

### Security
- Removed **all 17** `innerHTML` sites in the five tool modules. Dynamic text is now written with
  `textContent` or safely constructed DOM nodes. QR SVG is inserted through `DOMParser` +
  `importNode`, never as an HTML string.
- New shared `assets/js/xpatsoft-utils.js` sanitises download filenames (`../`, control characters,
  bidi overrides, reserved device names, length) and centralises byte/reduction formatting.
- QR Wi-Fi/vCard payloads strip control characters before escaping (no property injection).
- Escaped the remaining unescaped admin ternaries; the static audit now reports zero bare `echo $var`.

### PDF compressor
- New **Optimise mode (default)**: pages are copied with pdf-lib, so text, vectors, page dimensions and
  metadata survive; output is written with object streams and embedded JPEGs are recompressed where
  technically feasible. Text preservation is *asserted by an executable test*
  (`tests/verify-pdf-text.js`, pdf.js text extraction before/after).
- **Rebuild mode** (previous rasterising behaviour) is retained as an explicit opt-in with a visible
  trade-off warning: smallest size, text no longer selectable/searchable.
- Encrypted PDFs are detected before parsing; 50 MB size and 100 page limits with actionable errors.

### Dependencies
- All six libraries are now **self-hosted** under `assets/vendor/`, pinned to the exact versions used
  before (qrcode-generator 1.4.4, pdf-lib 1.17.1, pdfjs-dist 3.11.174, jszip 3.10.1, jspdf 2.5.1,
  html2canvas 1.4.1), each with its upstream licence file. Zero third-party requests at runtime.
  See `Dependency-licenses.md` and `assets/vendor/README.md`.

### Testing & CI
- `tests/run-regression-tests.js` — **247 assertions** covering malicious filenames, unsafe HTML sinks,
  PHP escaping, invoice escaping, QR invalid inputs, empty/malformed/oversized PDFs, image limits,
  module isolation, missing vendor libraries, vendor integrity and performance guards.
- `tests/run-js-tests.js` — the original 22 tests, unchanged and still passing.
- `.github/workflows/ci.yml` — PHP 8.1/8.2/8.3 syntax + test runner, Node syntax + both JS suites +
  PDF text-preservation test, and a MySQL-backed WordPress PHPUnit job (`tests/wp/`, 15 tests).
- Local sandbox has **no PHP runtime**, so PHP execution is verified in CI only. See `Testing.md`.

### Performance
- Image: 16 MP pixel budget per file, 10-file mobile batch limit (20 desktop), sequential processing,
  canvas and decoded-image release after each file, object URLs cleaned on `pagehide`/`beforeunload`.
- PDF: 100 page limit, persisted page-by-page canvas release, bounded (4) rebuild retries, UI yield per
  page, warning before large documents.

Full findings and residual risk: `SECURITY-REVIEW.md`.
