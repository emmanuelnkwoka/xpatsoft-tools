# Tool Development Guide

## Add a 6th tool without touching existing modules

1. Create folder: `tools/my-tool/`
2. Create `tools/my-tool/my-tool.php`:
```php
<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }
XPATSOFT_Registry::register( 'my-tool', array(
    'title' => 'My Tool',
    'description' => 'One-line description.',
    'category' => 'Text',
    'icon' => 'dashicons-admin-generic',
    'version' => '1.0.0',
    'popular' => false,
    'keywords' => 'my tool',
    'instructions' => 'How to use...',
    'faqs' => array( array( 'q' => '...', 'a' => '...' ) ),
    'privacy' => 'Local only.',
) );
```
3. Create `tools/my-tool/views/tool.php` — use `.xpatsoft-tool-wrap`, `.xpatsoft-panel`, `.xpatsoft-btn` classes. Escape all output.
4. Create `tools/my-tool/assets/js/my-tool.js` and `assets/css/my-tool.css`. Keep JS IIFE-scoped, no globals, no AJAX unless essential.
5. If you need a CDN lib, add a branch in `includes/class-xpatsoft-assets.php::enqueue_tool()` for your ID only (lazy load).
6. Create a WP page with `[xpatsoft_tool id="my-tool"]`, unique title/description/H1.
7. Add tests in `tests/` mirroring existing patterns.

## Rules
- Browser-first; no server storage of user content.
- No global asset loading.
- Sanitise + escape; nonce + caps for any admin/server action.
- Independent failure: wrap risky code in try/catch; never fatal the plugin.

## v1.1.0 rules for new or edited modules

1. **Never assign HTML from a string.** Use `textContent`, or build nodes with `document.createElement`
   and append them. `innerHTML`, `outerHTML`, `insertAdjacentHTML` and `document.write` are banned and
   enforced by `tests/run-regression-tests.js` §2.
2. **Route untrusted text through `XPATSOFT_Utils`** — `safeFilename()`, `withSuffix()`, `setText()`,
   `formatBytes()`, `reductionPercent()`. Do not write your own filename handling.
3. **Track every `URL.createObjectURL`** and revoke it on reset, before reuse, and on `pagehide`.
4. **Guard optional vendor libraries** with `typeof X === 'undefined'` and a human-readable message;
   never assume the CDN-loaded global exists.
5. **Bound the work**: max file size, max page/px count, max batch size, mobile-aware limits, and a
   `yieldUI()` between heavy iterations.
6. **Declare the trade-off in the UI** when an operation degrades output (e.g. rasterising a PDF).
7. **Add tests** for new guards to `tests/run-regression-tests.js` and keep the suite green.
8. **Pin vendor files** in `assets/vendor/<pkg>/` with a licence; update `Dependency-licenses.md` and
   `assets/vendor/README.md` in the same commit.
