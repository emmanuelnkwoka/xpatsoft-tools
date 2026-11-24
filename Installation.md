# Installation

## Requirements
- WordPress 6.0+, PHP 7.4+, any modern theme (tested with block + classic themes; styles are scoped under `.xpatsoft-*`).

## Install
1. Upload `xpatsoft-tools` folder to `wp-content/plugins/`.
2. Activate **XPATSOFT TOOLS**.
3. Go to **XPATSOFT Tools** in admin to verify 5 active tools and diagnostics.
4. Create pages:
   - `/tools/` → `[xpatsoft_tools]`
   - `/tools/qr-code-generator/` → `[xpatsoft_tool id="qr-code-generator"]` (repeat for each ID)
5. Give each page a unique title, meta description, H1, and internal links to related tools.

## Configuration
- Settings (tagline, privacy note) under admin dashboard.
- Toggle modules individually; deactivating one does not affect others.
- No API keys required. CDN libraries load over HTTPS; ensure outbound access to `cdn.jsdelivr.net` or self-host if required.

## Updates
Bump `XPATSOFT_TOOLS_VERSION` and plugin header version together. Assets use version query strings for cache-busting.
