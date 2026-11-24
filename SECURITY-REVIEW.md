# Security Review — Assignment 02

Scope: every JavaScript module and every PHP code path that renders user-controlled data.
Method: static audit of all `assets/js`, `tools/*/assets/js` and `*.php` files, then correction, then
regression tests that fail if the pattern returns.

## Findings and resolution

### F1 — `innerHTML` with user-controlled data (High)

17 assignment sites across the five tool modules:

| Module | Sink | Data reaching it |
|---|---|---|
| QR | `showStatus()` / `clearError()` | validation error messages echoing user input |
| QR | `preview.innerHTML = svg` | generated SVG string |
| Invoice | `row.innerHTML` | item description in the editor |
| Invoice | `inv-preview.innerHTML` | business name, address, customer name, notes, item descriptions |
| PDF | `setStatus()`, stats block | filenames, exception messages |
| Image | `status()`, `info.innerHTML`, result row | filenames, error messages |
| Word Counter | stats grid, top-words list | user text tokens |

**Why it mattered:** the invoice `esc()` helper escaped `& < > " '` but the result was then re-parsed as
HTML, so correctness depended on the escaper being perfect; error paths concatenated raw filenames and
exception text. A filename such as `<img src=x onerror=...>` is fully attacker-controlled (a user can be
tricked into selecting a crafted file, and any future server-side or shared-page reuse of these strings
becomes script execution).

**Fix:** removed every HTML-parsing sink. All dynamic text now goes through `textContent` or
`document.createElement(...)` + `textContent` (`el()` helper). Multi-line invoice/preview content uses
`white-space: pre-line` with `textContent`, so newlines render without a single `<br>` injection.
QR SVG is parsed with `DOMParser('image/svg+xml')` and only the parsed `<svg>` element is imported via
`document.importNode`.

Verified: `tests/run-regression-tests.js` §2 fails the build on any `.innerHTML =`, `.outerHTML =`,
`insertAdjacentHTML`, `document.write`, `eval(` or `new Function(` in the shipped JavaScript.

### F2 — Object URLs never revoked (Medium)

`URL.createObjectURL()` was called for the PDF result, the image ZIP, per-image previews and the QR logo,
and never released. Long sessions leaked the entire blob contents of every processed file.

**Fix:** every created URL is tracked; `cleanupUrls()` runs on reset, `pagehide` and `beforeunload`;
the PDF result URL is revoked before replacement and on `pagehide`; the QR logo URL is revoked before
reuse; one-shot downloads revoke after click.

### F3 — Unsanitised download filenames (Medium)

Downloads reused `input.name` directly (`f.name.replace(...)+'-compressed.png'`,
`currentFile.name.replace(...)+'-compressed.pdf'`). A crafted name could inject path separators, control
characters, right-to-left overrides (a disguised extension) or Windows reserved device names.

**Fix:** new shared `assets/js/xpatsoft-utils.js` with `safeFilename()` / `withSuffix()`:
strips control characters and bidi overrides, takes the basename only (defeats `../` and `..\`),
replaces `<>:"/\|?*`, strips leading dots/spaces/dashes, de-prefixes reserved device names, caps at
120 characters. Covered by regression §1 with 10 hostile inputs.

### F4 — QR payload newline/control injection (Medium)

Wi-Fi SSIDs and vCard fields accepted raw `\r\n`, so a crafted field could inject extra `WIFI:`/vCard
properties into the payload.

**Fix:** `oneLine()` strips control characters and collapses CR/LF/TAB before escaping in the Wi-Fi and
vCard builders.

### F5 — Unguarded capability/nonce assertion weakness (Low, test gap)

Admin actions correctly gated through `XPATSOFT_Security::verify_admin_request()` (capability +
nonce), but the PHP assertion looked for the literal token `current_user_can` in the admin class
where the check lives in the security helper.

**Fix:** the security helper is now itself asserted for `wp_verify_nonce` + `current_user_can`, and the
admin class is asserted to route every action through `verify_admin_request()`.

### F6 — Weak DOM hardening on the dashboard (Low)

Four `echo $on ? ... : ...` ternaries in `admin/views/dashboard.php` emitted unescaped values.

**Fix:** wrapped in `esc_attr()` / `esc_html()`. The static escaping audit now reports zero bare
`echo $var` in plugin code.

## Reviewed and found sound

- No `outerHTML`, `insertAdjacentHTML`, `document.write`, `eval`, `new Function` anywhere in plugin JS.
- No `javascript:` URL sinks; QR URL input is validated against `^https?://`.
- All tool views escape output (`esc_html`/`esc_attr`/`esc_url`).
- No secrets, API keys or credentials in the repository (asserted by the PHP static check).
- File inputs remain client-side; no upload endpoint exists, so upload validation is defence in depth only.
- SVG export is generated from the library's own serialiser with colours substituted from validated hex
  inputs; no user text is placed inside the SVG markup.

## Residual risk

- Attacker-supplied **file content** is still handed to pdf-lib / pdf.js / image decoders. These are
  third-party parsers; a decoder vulnerability would be a browser-level issue outside this plugin's
  control. Mitigated by size/page/dimension limits and by pinned, self-hosted versions.
- `textContent` prevents markup execution but a filename still appears in the UI; a bidi override could
  visually reorder text inside the label. The download name is sanitised; the on-screen label is not
  reordered because bidi controls are stripped from the sanitised name we display.
