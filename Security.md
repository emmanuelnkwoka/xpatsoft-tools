# Security

## Model
All tools are browser-local. The server never receives user files or text. No uploads are stored. No REST endpoints expose user data.

## Implemented controls
- **Capabilities:** admin actions require `manage_options`.
- **Nonces:** `xpatsoft_admin` nonce on all admin POSTs; `xpatsoft_frontend` nonce localised for future AJAX.
- **Sanitisation/escaping:** `sanitize_key`, `sanitize_text_field`, `sanitize_textarea_field`, `esc_html/attr/url/textarea` throughout.
- **File validation:** `XPATSOFT_Security::validate_file_upload()` uses `wp_check_filetype_and_ext`, MIME allowlists, size caps (50 MB PDF guard client-side; server-side helper enforces caps if uploads are ever added).
- **XSS:** all user input rendered via `esc()` in JS invoice preview; PHP views escaped.
- **CSRF:** nonce-verified admin forms; frontend tools are stateless (no server writes).
- **No secrets:** no API keys, passwords, or private config in repo. `.gitignore` excludes credentials.
- **Dependencies:** self-hosted, pinned versions with upstream licence files; see Dependency-licenses.md for the audited update procedure. Review vendor versions and upstream advisories quarterly.
- **Dynamic DOM:** `innerHTML`/`outerHTML`/`insertAdjacentHTML`/`document.write`/`eval` are banned in shipped JS and enforced by `tests/run-regression-tests.js` §2. User-supplied text goes through `textContent` or constructed nodes.

## Privacy
No logging of sensitive inputs. No email collection in this phase. Optional capture (if added later) must be consent-based with clear purpose.

## Review checklist
- [x] Capability checks on admin
- [x] Nonce validation
- [x] Input sanitisation + output escaping
- [x] No SQL (options API only)
- [x] MIME + size validation helper
- [x] No file storage
- [x] No REST exposure
