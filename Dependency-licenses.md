# Dependency Licenses

All libraries are loaded via CDN (jsDelivr) pinned to exact versions, only on the tool page that needs them. No build step, no bundled copies.

| Library | Version | Used by | License | CDN |
|---|---|---|---|---|
| qrcode-generator (kazuhikoarase) | 1.4.4 | QR | MIT | https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js |
| pdf-lib | 1.17.1 | PDF | MIT | https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js |
| pdf.js (pdfjs-dist) | 3.11.174 | PDF | Apache-2.0 | https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js (+ worker) |
| JSZip | 3.10.1 | Image ZIP | MIT | https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js |
| jsPDF | 2.5.1 | Invoice PDF | MIT | https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js |
| html2canvas | 1.4.1 | Invoice PDF | MIT | https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js |

WordPress core (GPL-2.0-or-later) is the host platform. Plugin code is GPL-2.0-or-later.

## Notes
- If CDN access is unavailable, tools degrade gracefully with an error message (QR/PDF/Invoice PDF). Image compression works without JSZip except ZIP export.
- Self-hosting: download the pinned files into `assets/vendor/` and update `class-xpatsoft-assets.php` URLs.
