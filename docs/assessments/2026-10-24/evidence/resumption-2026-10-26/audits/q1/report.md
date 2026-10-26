# Independent Q1 audit

Task: Q1 — Remove the known vulnerable parser and add advisory visibility, contract v1.0.0.

Base: `ea76b23f15b0d13feada592a88b14b587f8b12de`.
Candidate: `1cb963d8eee9e12e62de39fa106d439d0af61ea0`, independently confirmed with `git rev-parse HEAD` in the detached `published` checkout.

Auditor metadata: coordinator-provided accepted spawn configuration was `gpt-6-astra`, reasoning effort `low`, `fork_turns: none`. Serving identity is not independently introspectable. Fresh context consisted of the assigned task, contract and targeted product/raw evidence reads; no execution handoff, ledger, builder diaries, prior audit report, conversation history, broad agent notes or assessment narrative was read. Product documentation was examined as product, not proof.

## Inputs and integrity

All 13 entries of committed `docs/assessments/2026-10-24/evidence/q1-SHA256SUMS.txt` independently passed `sha256sum -c`. Its own SHA256 is `361c2546a7a95fa26f2980454f0e5f53d913acb445e951b996e0d65bb88ff2c7`. The persisted q1 lockfile diff exactly matches independently computed base-to-candidate diff, SHA256 `54494a96c4a8ff0a7c6a4e95cc4a7cad96fa7f318a36236838381bcf9c4935c9`.

The contract/product/input inventory follows (also saved as `input-hashes.txt`; that inventory SHA256 is `bee639b4635b5723791a3412efadb15141ba88cf2d81b578366223082f0fcbae`). Relative paths are within the pinned checkout.

```text
0a25465e5661a28df661c42674e2e8fb9fd892e948fc834f059e92c809b2227b  /workspace/work/quality-audits/q1/task.md
341e515132e096d3967fa8c9a4245cd3e711365bd622088854f033c423f2ca44  package.json
eec0b6034157c291d60ef55566a173f27ef0692a8f944c98030f1b65b9701f11  package-lock.json
3aa16cbc84fa7bc56c118d28e929d6578084b1203ad3e55fad3799adc7b96848  scripts/dependency-audit.mjs
1dc2b6e960c59fa41bfcdcc0758d86d9ffea96ab3e8171ea54be7cb36e3a7047  tests/body-parser.test.mjs
d86cc8d24d2aa9b28a36239392faf4fe517a6315078d828f8b7b2a4e672f1986  .github/workflows/dependency-advisories.yml
c8d49c1bdc86f5c0782836dfb2b1d49d9bb0aa62e36487fd082a61a658d13404  docs/security/dependency-audits.md
869c8736884cfeb29b0b3545bfbf8bb262774eca70078b16d3517a60c9b2dacb  docs/development/local-build.md
15fdb571bfa5de7565f2436854f0986dbea2811fb44db6c7ca4fdb8da499b041  services/api/app.mjs
361c2546a7a95fa26f2980454f0e5f53d913acb445e951b996e0d65bb88ff2c7  docs/assessments/2026-10-24/evidence/q1-SHA256SUMS.txt
88fd926520a2ed3bb716b1fb682afb085c0972f4228c07b18a4579f023b9a0fa  docs/assessments/2026-10-24/evidence/body-parser-advisory.json
66c692674533daeda37d91f8eeca0442c1cb8c47628685d7edc09d46e1f83075  tests/helpers/environment.mjs
c77982d481a9fe5b13c0fdd68515a5931729961e7135124f70236d5a30bdd701  node_modules/body-parser/lib/read.js
2980b885bad92f757a2d44674e905cf875867d5685111d8ab8f285635b11367d  node_modules/express/package.json
72156f9307466e1303a4ee379af7964a202166716959a1b2cb4934153f7f323e  .github/workflows/ci.yml
59218411dd3dea79f9be236c14aa93e680b2b5115a9b925acc7182add572db5e  tests/ingress-contract.mjs
9458b8e76730023fe3632867441bed94cc496db4fbe6a6286507ee35f7229828  tests/ingress-login.mjs
78f2610ed2de40c8e76f4b3c031d9cd697aa7a3d1d441ed24720dfd33569bf76  tests/browser-platform.mjs
98f7b72acd19549f218dbe4a08399e212c9997f889f6e7ae7ba1d4bf937f603d  tests/browser-commandmaps.mjs
a37a9b74717a17a0bdf830bd05c78bf1a5f2550f466d49a7bcfd5f916373bf44  tests/browser-activation.mjs
7e8a2fa94951112b894a3dbe3d05efef5e9263741fa49125f0a70f40fedab4cc  .node-version
f9f7d0d836198adf895ea96082dec2de89c0abc74b7675472bf993839fc5a6b6  docs/assessments/2026-10-24/evidence/npm-audit.json
e1bbae93f1a84c0a63ae4b53318f056cc051c55e07871248fae2224dec064875  /workspace/work/quality-bootstrap/session-env.sh
```

## Independent assessment

Only two lockfile package entries changed: body-parser 2.3.0 → 2.4.0 and its required qs 6.16.0 → 6.16.1. Installed `npm ls express body-parser qs --json` confirms Express 5.2.1 actually uses body-parser 2.4.0 and qs 6.16.1 without an override. Express permits the installed parser version. Application `services/api/app.mjs` is unchanged from the base, preserving its JSON configuration and authority paths. The installed parser read path now unpipes/destroys the decompression stream and installs an error listener after successful parsing.

The preserved raw `body-parser-advisory.json` identifies GHSA-27r3-jxmh-p828 / CVE-2026-111181, affected 2.x versions below 2.4.0 and patched 2.4.0. The pre-change raw npm audit includes that advisory; both fresh candidate audit scopes report zero vulnerabilities.

`tests/body-parser.test.mjs` uses a child process of the real API and a disposable UUID-named database created by the existing harness. Requests target loopback only. It tests valid compressed JSON, trailing bytes, malformed JSON and malformed streams for gzip, deflate and Brotli, expected statuses, subsequent healthy requests and child survival. Request/startup/test/cleanup limits are present. Existing nested test discovery remains unchanged and actually executes the new regression during the full check.

The read-only advisory workflow runs for PRs/pushes, weekly and manually; it installs the committed lockfile and saves both production-omitted-dev and complete JSON reports. The script blocks high/critical vulnerabilities and audit execution errors, reports low/moderate findings for review, and does not run audit fix or mutate dependencies. The documented false-positive procedure requires evidence and independent maintainer review while retaining blocking status until upstream correction; no ignore list is introduced.

## Findings

No material correctness or constraint violation found in the reviewed change. No severity/location/reproduction finding to report.

## Limits

This is a local synthetic acceptance audit, not a live-service security assessment. No AWS changes, live dataset regeneration, merge, deploy or push occurred. Advisory results are point-in-time registry responses. Production dependency classification is useful scope separation, not proof that every production package is reachable along a particular application route. The original crash was not reproduced or claimed reproduced; the regression verifies the intended patched behavior. GitHub-hosted schedule execution and actual hosted runner behavior were reviewed statically, not triggered. Caddy checks use loopback HTTP and do not validate public TLS issuance. No broader security guarantee is implied.

## Checks actually executed

Environment: Node v24.19.0, npm 11.9.0; sourced `/workspace/work/quality-bootstrap/session-env.sh` for the synthetic PostgreSQL 15, Chromium and Caddy setup. Network/loopback-dependent commands ran with the required escalation. All checks ran inside the pinned checkout; browser suites were strictly sequential.

| Command | Independent result |
| --- | --- |
| `npm run setup` | Exit 0; clean npm ci installed 238 packages |
| `npm ls express body-parser qs --json` | Exit 0; Express 5.2.1 → body-parser 2.4.0; qs 6.16.1 |
| `npm run audit:dependencies` | Exit 0; production and all reports each have zero vulnerabilities |
| `node --test tests/body-parser.test.mjs` | Exit 0; 1 passed, 0 failed/skipped |
| `npm run check` | Exit 0; lint, format, typechecks, builds and all 95 tests passed, 0 failed/skipped |
| `npm run test:platform:browser` | Exit 0; PASS |
| `npm run test:commandmaps:browser` | Exit 0; PASS |
| `npm run test:activation:browser` | Exit 0; PASS |
| `node tests/ingress-contract.mjs` | Exit 0; PASS actual Caddy loopback routing contract |
| `node tests/ingress-login.mjs` | Exit 0; PASS actual Caddy + Express loopback isolation |
| `sha256sum -c q1-SHA256SUMS.txt` | All 13 committed raw evidence files match |
| Base/candidate lockfile structured comparison | Exactly body-parser and qs entries differ |
| Final `git status --short` | Empty after restoring only two screenshots regenerated by browser tests |

Activation Vite reported port 5173 occupied and selected another port. Inspection confirms the suite uses `command.httpServer.address().port` and the corresponding platform bound port, with its disposable API proxy; it passed on those actual ports. This did not redirect checks to an existing service.

Fresh execution logs are adjacent to this report. Their SHA256 manifest (`reproduction-SHA256SUMS.txt`) is:

```text
f67016e1ab5b35d3edeee5b7ea377de86b6728f20c42f727f5d04a1d2e816133  activation-repro.log
3a9045a0db4a68f398c88bfa1bb49774d038c9c0c90db72d5875f0ee3a401f7d  audit-repro.log
489f834e4262d33be5373f7521b08e653a0c7c0255d61ccc2e94d079b280b087  check-repro.log
a809408710e0c6ed5d464808542a6a8615800d04737912092935f4a6619db3cc  commandmaps-repro.log
bbf40f4d8c567ad0e2fde913bf011aeac82235d8c928453c69c09d51f42949b3  ingress-contract-repro.log
d46be2da3690293ff09aac585e4e12dd66c81bab9a4845b125b43c6b0c7692dc  ingress-login-repro.log
619a9a010689388bf1d01e7b376ff9782b12b235a556c5403a5ecbb900aebde9  parser-repro.log
a9937446018cc328827067df616271570fb24d5f3ccfcfc07c17ff3f086921d8  platform-repro.log
a7220fa038e556b02c68d41b98c9872f471e437a501f8c28ed3ab6aa275a7d28  setup-repro.log
```

Unverified acceptance requirements: none within the local Q1 task scope. Hosted CI execution and live TLS remain outside these local checks as noted above.

**Verdict: pass.** No code changes or pushes were performed by the auditor.

Completed UTC: 2026-10-24T22:45:28.301424+00:00.
