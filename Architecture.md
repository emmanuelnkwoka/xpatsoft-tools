# Architecture

## Overview

One plugin, five independent modules, one registry. A failure in one module cannot disable others (each tool file is loaded in try/catch; assets enqueue per-tool only).

## Structure

```
xpatsoft-tools.php            Bootstrap, constants, hooks
includes/
  class-xpatsoft-tools.php    Singleton, activation, init order
  class-xpatsoft-registry.php Tool discovery & registration
  class-xpatsoft-assets.php   Shared + per-tool asset loading (lazy CDN)
  class-xpatsoft-shortcodes.php [xpatsoft_tools] / [xpatsoft_tool]
  class-xpatsoft-admin.php    Dashboard, settings, toggles (nonce + caps)
  class-xpatsoft-security.php Caps, nonces, sanitisation, upload validation
  class-xpatsoft-helpers.php  Bytes, options, active-tool state
templates/directory.php       Directory rendering (search + filters)
tools/<id>/<id>.php           Registration (title, desc, FAQs, privacy)
tools/<id>/views/tool.php     Frontend view
tools/<id>/assets/js|css/     Per-tool assets (loaded only on that tool)
assets/                       Shared CSS/JS
admin/views/dashboard.php     Admin dashboard
tests/                        PHP + JS tests
```

## Registry pattern

Each `tools/<id>/<id>.php` calls `XPATSOFT_Registry::register($id, $args)`. The registry auto-discovers `tools/*/*.php`. Active state is stored in `xpatsoft_tools_active` option; settings in `xpatsoft_tools_settings`.

## Asset strategy

Shared assets register once. Per-tool JS/CSS + CDN deps (qrcode-generator, pdf-lib/pdf.js, JSZip, jsPDF/html2canvas) enqueue only when that tool's shortcode renders. No global bloat; mobile-friendly.

## Rendering

- `[xpatsoft_tools]` → directory with search, category filters, popular section, cards.
- `[xpatsoft_tool id="..."]` → validates ID, checks active, enqueues assets, includes view. Each tool page should be a dedicated WP page with unique title/description/H1/FAQs (content provided in views; SEO handled by theme/SEO plugin).

## Adding a 6th tool

See Tool-development-guide.md. No changes to existing modules required.

## Performance

Browser-first, zero AJAX, minimal DB (2 options). CDN with version pins. 50 MB PDF guard for low-memory devices.

## Changes in v1.1.0

- **New shared script**: `assets/js/xpatsoft-utils.js` (filenames, byte formatting, reduction %,
  safe text setter, download helper). Registered as `xpatsoft-utils` and a dependency of every tool
  module; also exported as CommonJS so Node tests exercise the identical code.
- **Asset registration**: `assets/vendor/` replaces all CDN URLs. Vendor scripts keep their own handles
  (`qrcode-generator`, `pdf-lib`, `pdfjs`, `jszip`, `jspdf`, `html2canvas`) so a tool only loads what it
  needs, still gated behind that tool's shortcode.
- **PDF module**: two explicit strategies — `optimise` (pdf-lib page copy, text/vector preserving) and
  `rebuild` (pdf.js raster, opt-in). The worker URL comes from `wp_localize_script`, not a CDN.
- **Testing tree**: `tests/run-js-tests.js` (unit), `tests/run-regression-tests.js` (security/regression),
  `tests/verify-pdf-text.js` (PDF text preservation), `tests/wp/` (WordPress PHPUnit), `bin/` (WP test
  suite installer), `.github/workflows/ci.yml` (three jobs).
