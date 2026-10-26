# Q3 follow-up 3 checkpoint

Pinned base: published product `6fab138ffe0290ab66358d272518b0630d0fae76`; local worktree `codex/civicmaps-quality-q3-fix3`. This is a local candidate only. Root is the sole publisher. No acceptance, merge, or deployment is claimed.

The immutable fresh-review report for the base is retained at `../q3-independent-original-fix2/report.md` (SHA-256 `be85f7bca2613998bf54e5316d59cd08d375d80f7c970bb31b05e8c839bd6c0e`). The raw stale-session script, log, and auditor evidence manifest are copied byte-for-byte into that directory. The auditor reproduced one P2: after a pack write returned HTML 503, an unscoped reconciliation GET `/auth/session` was held, the operator navigated to Network health, and the late HTML 401 replaced the authenticated page with sign-in even though an independent server session request returned 200. The held request had not been cancelled. This is an obsolete UI outcome; no server logout or duplicate write is claimed.

`perform` now captures the operation's route/session generation and abort signal once. Its session revalidation and directory refresh both use that original signal. Each continuation and rejection checks the captured generation and signal before changing actor, CSRF, directory, detail refresh, session, notice, or error state. The 409 directory-refresh path uses the same captured scope and only reports errors while current. Stale operations cannot clear a later page's busy state; route changes and explicit session clearing reset busy state directly.

The Platform browser regression starts from an authenticated synthetic operator, sends a pack mutation that receives HTML 503, holds the follow-on session read, navigates to Network health, and then releases an HTML 401. It asserts the held read was cancelled, the obsolete response handler was released, the Network health page remains visible, and the real session still returns HTTP 200. The raw trace is in `browser-platform.log`.

## Verification

- `npm ci --ignore-scripts --bin-links=false --no-audit --no-fund`: lockfile install of 238 packages; manifests and lockfile unchanged.
- `source /workspace/work/quality-bootstrap/session-env.sh && npm run check`: lint, format, both typechecks, both builds, and 106 integration tests passed (0 failed, 0 skipped). Raw output: `npm-check.log`.
- `node tests/browser-platform.mjs`: PASS, including the stale reconciliation session cancellation regression. Raw output: `browser-platform.log`.
- `node tests/browser-commandmaps.mjs`: PASS serially, including the held A→B→A history 401 regression and committed malformed-success writes. Raw output: `browser-commandmaps.log`.
- `node tests/browser-activation.mjs`: PASS serially; the existing runner logged a port-5173 fallback. Raw output: `browser-activation.log`.
- Actual Caddy ingress contract and login tests passed on loopback HTTP. Raw outputs: `caddy-contract.log` and `caddy-login.log`.

No merge, push, deployment, cloud mutation, or live dataset operation was performed. The product awaits root publication and a fresh independent review of the exact candidate.
