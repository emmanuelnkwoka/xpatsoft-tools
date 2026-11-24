# Testing

## Automated tests (executed in this delivery)
Run: `php tests/run-tests.php` and `node tests/run-js-tests.js`

### PHP tests (`tests/run-tests.php`)
- Plugin bootstrap constants and files exist
- Registry registers all 5 tools with required keys
- Helpers: `format_bytes`, `sanitize_id`, active-tool toggling (stubbed WP functions)
- Shortcode handlers exist; directory/tool templates exist
- Security class: capability + nonce methods present
- All 5 tool views + JS + CSS files present
- No `eval`, no hardcoded API keys, no `$_GET` without sanitisation in admin

### JS tests (`tests/run-js-tests.js`, Node)
- Invoice math: subtotal, discount, tax, grand total, receipt balance (integer minor-unit logic mirrors browser code)
- Currency formatting (NGN, USD)
- Word counter: word/char/sentence/paragraph counts, empty input, multilingual (e.g. Chinese, Arabic, Yoruba diacritics)
- QR payload builders: URL validation, Wi-Fi escaping, WhatsApp, vCard format
- Image/PDF guards: MIME allowlist, size limits

## Static inspections
- `php -l` on all PHP files
- Grep for unescaped output, `eval`, secrets
- Asset loading: per-tool enqueue only (verified in `class-xpatsoft-assets.php`)

## Manual browser tests (to run on staging)
- [ ] Activate plugin, verify dashboard counts
- [ ] Directory search + category filter
- [ ] Each shortcode renders; tool above the fold on mobile
- [ ] QR: generate each type, scan with phone, download PNG/SVG
- [ ] Invoice: multi-item totals, VAT edit, print, PDF, WhatsApp link
- [ ] PDF: valid/invalid/encrypted/oversized handling, before/after sizes
- [ ] Image: JPG/PNG/WebP, batch, transparency, ZIP
- [ ] Word counter: live counts, copy, platform limits
- [ ] Toggle each module off/on; verify isolation
- [ ] Low-memory / mobile viewport check

Only tests actually executed are reported in the final report; manual items above are listed as outstanding until run.

## Execution note (this delivery)
- JS tests: **executed** via Node — 22 passed, 0 failed.
- PHP tests (`tests/run-tests.php`): **written but not executed** in the sandbox (no PHP runtime available; apt install blocked by network policy). Run `php tests/run-tests.php` on any PHP 7.4+ environment or inside WordPress to execute.
- Static checks executed: JS `node --check` on all 7 JS files (pass), Python brace/guard/pattern scan on 21 PHP files (pass, 1 expected false-positive for the string `eval(` inside the test file itself).
- Manual browser tests: **not executed** (no WordPress/browser in sandbox). Listed above as outstanding.
