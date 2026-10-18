# Governance execution checkpoint

Updated 19 October 2026 (Australia/Melbourne).

## Repository state

- Governance branch: `codex/civicmaps-governance-workstream`, head `65cc13b47c93fb60f0332f894a6a03e26d554c02` (matches PR #25 remote head).
- Integrated main: `92b3eea8b8ecfd0505afb6d62d60a001903db161`; fetched `origin/main` currently matches.
- PR #24: open, draft, no submitted reviews; exact-head CI passed.
- PR #25: open, draft, no submitted reviews; exact-head CI passed.
- Worktree was absent from the resumed environment and has been attached at `/workspace/civicmaps-governance-workstream`. It is clean before this checkpoint edit. No other worktree was changed.

## Active slice: G04 / GOV-10 / F-029

**Outcome:** reject malformed audit `reason` values before a dispatch mutation and render legacy audit values defensively without rewriting stored history.

**Work contract:**

- Likely files: `services/api/app.mjs`, `apps/commandmaps/src/main.tsx`, `tests/foundation.test.mjs`, and a focused browser regression if available.
- Preserve: F08 entitlements, council/context scope, D03 action permissions, CSRF, idempotency, optimistic version checks, transaction ordering, and append-only historical audit.
- Semantics: `close` continues to require a non-empty string of at most 1000 characters. Other actions accept an omitted/null reason or a string of at most 1000 characters; reject all other JSON types before mutation. Historical non-string values are omitted from display, never modified in storage.
- Acceptance: disposable API regressions prove malformed values return 400 without changing request version/status or appending audit; valid omitted/null/string cases remain correct; defensive rendering handles legacy malformed values; council scope and retained audit are unchanged.
- Out of scope: broader authority, identity, database isolation, retention/destruction, F09 suspension policy, live exploit tests, production policy or architecture decisions.

**Dependencies and next action:** no policy decision blocks this correction. Inspect existing browser-test capability and establish the disposable test environment, then implement and verify the API/UI boundary. Advanced-model Checkpoint A remains pending until the current-state authority/data-flow matrix and first bounded corrective package are both review-ready.

**Implementation status:** the API rejects non-null reasons unless they are strings of at most 1000 characters, before entering the mutation transaction. Existing closure validation still requires non-empty text. CommandMAPS renders only string-valued historical reasons. Added a disposable API regression for malformed type/length rejection, unchanged status/version/audit, and accepted null/string values; added a browser response fixture that injects a legacy object value and checks it is not rendered.

**Local validation:** npm lockfile install passed. Lint, format check, both app typechecks, both production builds, browser-test syntax check and `git diff --check` passed. Database integration/browser tests have not run locally: PostgreSQL client/server tools are absent (`initdb` ENOENT; no local PostgreSQL listener). Hosted PR CI is the next validation step; do not mark F-029 acceptance complete until that result is inspected.

## Completed acceptance

- Reconciled local main `92b3eea…`, fetched `origin/main`, PR #24, PR #25, CI and review status; no newer main integration was needed.
- Refreshed owner requirements, governance assessment, F09 preparation and F08 completion memories before resuming.
- Confirmed F08 release remains closed; no deployment, migration replay or production change is planned.
