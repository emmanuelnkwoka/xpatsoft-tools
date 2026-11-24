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
- No build step. CDN libraries load lazily per-tool only.
