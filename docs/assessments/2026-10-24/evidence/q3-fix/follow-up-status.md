# Q3 follow-up checkpoint evidence

Pinned base: `5e3e7b90196599815deb39d3007430ef5f09b6da` (published Q3 product,
original Q3 review verdict `changes_required`). The new fix candidate is local and
awaits root publication and fresh independent Astra Low review. It does not change
or overwrite the detached original audit worktree/report.

The original report and controlled reproductions are retained byte-for-byte in
`../q3-independent-original/`. The report SHA-256 is
`df234cdaa464375989bb9b96cd7691f6a2ea8e3dc72022139705a56d8dfea088`.

## Verification performed

- `npm ci --ignore-scripts --bin-links=false --no-audit --no-fund`: 238 packages,
  committed lockfile unchanged.
- `source /workspace/work/quality-bootstrap/session-env.sh && npm run check`:
  lint, format, both typechecks and builds pass; 106 integration tests pass, 0 fail,
  0 skipped. Raw output: `npm-check.log`.
- `source /workspace/work/quality-bootstrap/session-env.sh && node tests/browser-platform.mjs`:
  PASS, including a held pack-write cancellation on route change, request-failure
  assertion, and late HTML 401 session-safety assertion. Raw output:
  `platform-browser.log`.
- `source /workspace/work/quality-bootstrap/session-env.sh && node tests/browser-commandmaps.mjs`:
  PASS serially. `commandmaps-browser.log` includes a generated exact request ID,
  selected-history operation, one held read, completed response, and resolved UI
  state after search hides the queue row.
- `source /workspace/work/quality-bootstrap/session-env.sh && node tests/browser-activation.mjs`:
  PASS serially, including a held AdminActivation disable write cancelled on
  navigation and a stale HTML 401 that does not log out the operator. The runner
  reports its known port-5173 fallback and then passes.
- `source /workspace/work/quality-bootstrap/session-env.sh && CIVICMAPS_CADDY_BINARY=/workspace/work/quality-bootstrap/caddy node tests/ingress-contract.mjs`:
  PASS (loopback HTTP only).
- Same command with `tests/ingress-login.mjs`: PASS (local HTTP only).
- Final `npm run lint` and `npm run format:check` pass after formatting the exact-ID
  browser trace.

No live dataset regeneration, AWS mutation, merge, push or deployment was performed.
No remote CI result is claimed.

## Reproduction commands

Run from the repository root with the documented prepared PG15 loopback environment:

```sh
source /workspace/work/quality-bootstrap/session-env.sh
node tests/browser-platform.mjs
node tests/browser-commandmaps.mjs
node tests/browser-activation.mjs
CIVICMAPS_CADDY_BINARY=/workspace/work/quality-bootstrap/caddy node tests/ingress-contract.mjs
CIVICMAPS_CADDY_BINARY=/workspace/work/quality-bootstrap/caddy node tests/ingress-login.mjs
```

The browser suites must run sequentially. `npm run check` is separately captured in
`npm-check.log`.
