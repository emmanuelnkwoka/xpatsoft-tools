# Dependency Licenses

All third-party libraries are **self-hosted inside the plugin** under `assets/vendor/`, pinned to exact
versions, and enqueued only on the tool page that needs them. No CDN, no build step, no runtime
third-party network requests. This removes a single point of failure (CDN outage, DNS block, corporate
firewall, CSP denial) and makes the plugin work offline and in air-gapped WordPress installs.

## Bundled libraries

| Library | Version | Used by | License | Licence file | Files |
|---|---|---|---|---|---|
| qrcode-generator (kazuhikoarase) | 1.4.4 | QR Code Generator | MIT | `assets/vendor/qrcode-generator/LICENSE.txt` | `qrcode.js`, `qrcode_UTF8.js` |
| pdf-lib | 1.17.1 | PDF Compressor, Invoice | MIT | `assets/vendor/pdf-lib/LICENSE.md` | `pdf-lib.min.js` |
| pdf.js (pdfjs-dist) | 3.11.174 | PDF Compressor (Rebuild mode) | Apache-2.0 | `assets/vendor/pdfjs-dist/LICENSE` | `pdf.min.js`, `pdf.worker.min.js` |
| JSZip | 3.10.1 | Image Compressor (ZIP export) | MIT / GPL-3.0 dual | `assets/vendor/jszip/LICENSE.markdown` | `jszip.min.js` |
| jsPDF | 2.5.1 | Invoice & Receipt Generator | MIT | `assets/vendor/jspdf/LICENSE` | `jspdf.umd.min.js` |
| html2canvas | 1.4.1 | Invoice & Receipt Generator | MIT | `assets/vendor/html2canvas/LICENSE` | `html2canvas.min.js` |

WordPress core (GPL-2.0-or-later) is the host platform. Plugin code is GPL-2.0-or-later.

## Source and integrity

- Source: the public **npm registry** (`registry.npmjs.org`), the same artefacts referenced by the
  previous CDN URLs. No forks, no unofficial mirrors, no minified files of unknown origin.
- Versions match the CDN versions used in v1.0.0 exactly — no dependency was upgraded in this change.
- Each vendor directory contains the upstream licence text shipped by the package itself.
- `assets/vendor/README.md` records the version map; `tests/run-regression-tests.js` asserts that every
  vendor file, every licence and every pinned version string is present.

## Update procedure

1. `npm install <package>@<new-exact-version>` in a scratch directory (never a floating range).
2. Read the upstream changelog and licence; confirm the licence is unchanged and compatible with GPL-2.0-or-later.
3. Copy the distributed file(s) into the matching `assets/vendor/<package>/` directory and replace the
   licence file if upstream changed it.
4. Update the version string in `includes/class-xpatsoft-assets.php` (`wp_enqueue_script( ..., '<version>', true )`).
5. Update the table above and `assets/vendor/README.md`.
6. Run `node tests/run-regression-tests.js` (Section 9 asserts versions, files and licences) and let CI
   run the PHP + JS + PDF verification jobs.
7. Note the change in the commit message; never bundle a library that is not in this table.

## Failure behaviour

No vendor script is loaded on a page that does not render its tool. If a vendor file is missing or blocked:

- QR: "QR library failed to load. Check connection and retry."
- PDF: Optimise mode needs pdf-lib; Rebuild mode additionally needs pdf.js. Each is checked separately and reported.
- Invoice: falls back to **Print / Save as PDF** (browser-native) when jsPDF or html2canvas is unavailable.
- Image: compression still works; only the ZIP export requires JSZip and it says so.

## Why not CDN (production reasoning)

| Concern | CDN (v1.0.0) | Self-hosted (v1.1.0) |
|---|---|---|
| Third-party outage | tools break | unaffected |
| Privacy claim "nothing leaves your device" | a third-party host is contacted on page load | strictly true — no third-party requests |
| Supply-chain tampering | depends on CDN integrity | pinned file inside the plugin, reviewed in git |
| CSP / firewall environments | often blocked | works |
| Plugin download size | ~2.5 MB lighter | ~2.7 MB heavier (acceptable) |
| Update cadence | instant upstream | deliberate, via the procedure above |
