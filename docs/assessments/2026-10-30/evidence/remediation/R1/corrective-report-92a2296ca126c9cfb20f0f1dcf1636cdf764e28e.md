# R1 corrective candidate report

Product candidate: `92a2296ca126c9cfb20f0f1dcf1636cdf764e28e`, based on the R0 accepted source. This supersedes the reviewed product source `122e56de88923a2eabc075ed677a15299049436c` for R1 recheck. The initial Astra report is preserved byte-for-byte at `122e56de88923a2eabc075ed677a15299049436c/review.md` with all supplied reviewer evidence checksummed. A separate errata note records the finding and the review-date/runner-client wording corrections.

## Correction

The initial R1 candidate updated the root manifest and lockfile to Vite 6.4.5 but left the standalone `apps/commandmaps/package.json` declaration at 6.4.4. This is the same finding AUD-001 (GHSA-8g5g-mxqh-grgj), not a distinct advisory. The nested manifest now pins Vite 6.4.5. `scripts/verify-vite-manifests.mjs` scans repository `package.json` files (excluding `.git` and `node_modules`) and fails if a direct Vite dependency declaration is not 6.4.5; `npm run check` invokes this guard.

## Validation

The candidate-specific `corrective-validation-92a2296ca126c9cfb20f0f1dcf1636cdf764e28e/` directory contains raw logs, audit JSON, hashes and command notes. It records:

- `npm run setup`: exit 0; 238 packages installed.
- `npm run verify:vite-manifests`: 27 manifests scanned; every direct Vite declaration is 6.4.5.
- `npm ls vite --all`: exactly one installed Vite, 6.4.5; lock and installed versions agree.
- `npm run check`: clean single run, actual shell exit 0; 114/114 tests passed, 0 failed, cancelled, skipped or todo.
- `npm run audit:dependencies`: production and full scans each report zero vulnerabilities, including no AUD-001 or high/critical findings.
- Map, Platform, CommandMAPS, and activation browser suites ran sequentially after the full check; all exited 0.
- Bounded Vite file-system smoke: ordinary page/module return 200; synthetic `.env`, `?import` and `?raw` attempts return 403 and reveal no marker. This is deny-path compatibility evidence and not exploit reproduction.

The `attempts.md` file preserves the earlier environment and overlapping-run attempts, which are not counted as acceptance evidence. The clean full-check log captures the actual zero exit. Browser binaries were reused read-only. Runtime database was a dedicated loopback-only synthetic PostgreSQL 15.18 instance at `127.0.0.1:55461`, with inspected transparent wrappers used for PostgreSQL utilities. There are no customer data or credentials in these checks.

## Review state

This is builder evidence only. AUD-001 remains open pending independent fresh review of this exact candidate. No R1 acceptance is claimed here. R2 and Context7 remain independently open.
