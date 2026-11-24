# Testing

Honest status of every check in this repository. Anything not listed as **executed** was **not** executed.

## 1. What is automated

| Suite | Command | Scope |
|---|---|---|
| JS unit tests | `node tests/run-js-tests.js` | Invoice integer-cent math, currency formatting, word counting (incl. CJK/Arabic), QR payload builders, guards |
| JS regression & security tests | `node tests/run-regression-tests.js` | Malicious filenames, `innerHTML`/`eval`/`document.write` audit, PHP escaping audit, invoice escaping, QR invalid inputs, PDF/empty/malformed/oversized handling, image batch & canvas limits, module isolation, missing-vendor guards, vendor integrity, performance guards, CI config |
| PDF text-preservation test | `node tests/verify-pdf-text.js` | Builds a text PDF, applies the Optimise strategy (pdf-lib page copy + object streams), extracts text with pdf.js from input and output and asserts they are identical |
| PHP test runner | `php tests/run-tests.php` | WP-stubbed registry/helpers/security/shortcodes behaviour, static checks, lint |
| PHP syntax | `php -l` (workflow, all `.php`) | Parse-level validity on PHP 8.1, 8.2, 8.3 |
| JS syntax | `node --check` (workflow, all non-minified `.js`) | Parse-level validity |
| WordPress integration | `phpunit` + WP test suite (workflow) | Real WordPress: 15 tests for registration, shortcodes, activation defaults, capability checks, module isolation, vendor files, settings |

### Latest local execution (2026-11-24, this sandbox)

```
node tests/run-js-tests.js            -> 22 passed, 0 failed
node tests/run-regression-tests.js    -> 247 passed, 0 failed
node tests/verify-pdf-text.js         -> text preserved: true
node --check (5 tool modules + 3 shared) -> 8/8 OK
```

`tests/verify-pdf-text.js` output:

```
SOURCE text:     "Hello XPATSOFT selectable text"
OPTIMISED text:  "Hello XPATSOFT selectable text"
pages: 1
VERDICT text preserved: true
```

This is the evidence behind the claim that **Optimise mode preserves text**. The claim is limited to
what the test covers (text operators and page geometry survive a pdf-lib copy/rewrite). It is not a claim
that every PDF shrinks, that fonts embed identically, or that any given file will preserve a specific
accessibility tag tree.

### Not executed here

- **PHP runtime is absent in this sandbox** (`php: command not found`; package installation blocked).
  `tests/run-tests.php` and `php -l` therefore run **only in GitHub Actions**. A Python structural scan
  (balanced braces/parens, open tags, 23 files) was used locally as a weak substitute and is *not*
  equivalent to a parse check.
- **WordPress integration tests** run only in Actions (they need MySQL + WP core test suite).
- **Manual browser QA** (real Chrome/Safari/Firefox, real devices) was not performed in this environment.
  Browser-level behaviour is therefore verified by static/logic tests only.

## 2. What CI runs

`.github/workflows/ci.yml`, triggered on every push and on PRs to `main`:

1. **php** — matrix PHP 8.1 / 8.2 / 8.3 → `php -l` on every PHP file, then `php tests/run-tests.php`.
2. **js** — Node 20 → `node --check` on all non-minified JS, `run-js-tests.js`, `run-regression-tests.js`,
   then installs `pdf-lib@1.17.1` + `pdfjs-dist@3.11.174` and runs `verify-pdf-text.js`.
3. **wordpress** — MySQL 8 service, `bin/install-wp-tests.sh`, `phpunit` against `tests/wp/`.

The WordPress job is `continue-on-error: true` while the environment is being proven, so a red
integration job cannot block a security fix from merging — but its result is always visible and is reported
honestly in the PR. Passing PHP syntax checks alone is **not** evidence of WordPress compatibility; only
the `wordpress` job provides that evidence.

## 3. Security test coverage

| Concern | Test |
|---|---|
| Hostile filenames (`../`, backslash, `<>`, NUL, bidi overrides, `CON`, 500-char names) | regression §1 |
| Unsafe HTML sinks (`innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`, `eval`, `new Function`, `javascript:`) | regression §2 |
| PHP output escaping (`echo $var`) and tool views using `esc_*` | regression §3 |
| Nonce + capability gating of admin actions | regression §3, WP §capability |
| Invoice markup/quote escaping and line-break handling | regression §4 |
| QR invalid URLs, payload control-character/newline injection, SVG via `DOMParser` | regression §5 |
| Empty/malformed/encrypted/oversized PDFs, page limits, object-URL revocation | regression §6 |
| Image MIME allowlist, batch limit, pixel budget, canvas release | regression §7 |
| Module isolation, IIFE scoping, missing-vendor guards, registry error catching | regression §8 |
| Vendor pinned versions, licence presence, no CDN references | regression §9 |

## 4. Manual test checklist (for the owner, not yet performed)

1. Activate the plugin on a clean WordPress 6.x install; confirm all five tools appear in the directory.
2. Deactivate one tool in the dashboard; confirm its shortcode renders nothing and the other four still work.
3. QR: generate each of the seven types; scan with two different phone scanners; download PNG and SVG;
   upload a logo; enter a bad URL and confirm the error text renders as text (no markup execution).
4. Invoice: 3 × ₦0.10 line item must total ₦0.30; verify VAT at 7.5 %; download PDF; print; share.
5. PDF: compress a **text** PDF in Optimise mode, then select text in the output to confirm it is still
   selectable; compress the same file in Rebuild mode and confirm the trade-off warning appears.
6. Image: a 20-file batch on desktop, a 10-file batch on a phone; confirm no freeze, correct before/after
   figures, working ZIP download.
7. Word counter: paste mixed English/Arabic/CJK text; confirm counts and top words update live.
8. DevTools → Network: confirm **zero** requests to third-party hosts while using any tool.
