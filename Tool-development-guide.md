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
