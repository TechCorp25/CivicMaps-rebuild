# Q3 follow-up 4 checkpoint

Pinned base: published product `44895f86f6d6683d4f0b8e2013848dcec98a6c38`; local branch `codex/civicmaps-quality-q3-fix4`. This is a local candidate for root publication and fresh review. No acceptance, merge or deployment is claimed.

The immutable review report is preserved at `../q3-independent-original-fix3/report.md`, SHA-256 `0fea607c463cad57705a43e3258c0fae6003c79bcddd6619f6da152d61ca0881`. The full auditor evidence directory and output manifest are retained beside it. Q3-A1 identified a Platform detail GET that returned HTML 403 after previously succeeding. The UI displayed a safe generic error but retained the old detail object, leaving all nine pack switches enabled 16 seconds later. This was stale UI action state, not a server authorization bypass.

The detail poll now invalidates cached detail and closes any pending pack confirmation on explicit 401, 403, or 404 outcomes. A 401 also clears the session; 403/404 do not automatically retry, so stale action controls cannot silently reappear from a later poll. Cancellation and stale-scope checks remain in force. A new authorized read after changing route scope can restore the detail and controls.

The Platform browser regression starts with enabled pack controls and an open disable confirmation, returns HTML 403 from the selected municipality-detail endpoint, advances the browser clock through 32 seconds, and asserts the confirmation closes, the error body remains hidden, all nine switches are disabled, and no automatic detail retry occurs. It then changes route scope and confirms controls return after a fresh successful detail response. Raw trace in `browser-platform.log` records `status:403`, one denied read, nine disabled switches, zero automatic retries, and successful recovery.

## Verification

- `npm ci --ignore-scripts --bin-links=false --no-audit --no-fund`: 238 lockfile-pinned packages; output `setup.log`.
- `source /workspace/work/quality-bootstrap/session-env.sh && npm run check`: lint, format, both typechecks/builds, and 106 tests passed (0 failed, 0 skipped). Output `npm-check.log`.
- Platform, CommandMAPS, and Activation browser suites passed sequentially. The Platform output contains both the prior uncertain-session cancellation trace and the new denied-detail trace. The Activation runner used its existing port-5173 fallback.
- Both actual Caddy loopback ingress contract and login checks passed.
- The original Q3 M1 intermediate harness logs are retained. The no-fixture attempt failed before the controlled race; the fixture-adjusted attempt passed two iterations then missed a `refresh-complete` observation in iteration three. The final settled harness added a network-idle barrier and passed three controlled runs. Available logs do not establish the cause of the intermediate missing event. These passes are recorded as execution results, not as causal proof or a new product defect.

Plan SHA-256 remains `1ce4e1a3000c5148eb98d161d2d941f2e85009249cb6ddc9dd6c61dd36578cea`. No live data regeneration, cloud mutation, push, merge, or deployment was performed. Q3 remains pending fresh independent review.
