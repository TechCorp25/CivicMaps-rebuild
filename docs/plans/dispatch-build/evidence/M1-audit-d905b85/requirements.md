# M1 independent product audit packet

Assignment: independently assess shared request discovery for acceptance. No implementation status or previous review outcome is supplied. Review only M1.

## Exact identity

- Repository: `https://github.com/TechCorp25/CivicMaps-rebuild`
- Base: `d4921eb1c37550d9ca1b53a5615242922abfa4ad`
- Candidate: `d905b85ca7f0c2a20eaa956b0448ed7f5581f47b`
- Candidate tree: `9f2950e421c230c03b05efbdcc76a8b4e4fda1da`
- A local same-tree mirror exists at `/workspace/work/civicmaps-m1`, commit `581a064f7e9b129f744f00a8c4e8897b8a86ae8c`.

The local Git graph verifies the base is an ancestor of the candidate; `git merge-tree --write-tree d4921eb1c37550d9ca1b53a5615242922abfa4ad 581a064f7e9b129f744f00a8c4e8897b8a86ae8c` yields candidate tree `9f2950e421c230c03b05efbdcc76a8b4e4fda1da`. CI runs are PR merge runs for this base/head. Use workflow run and job metadata/logs to verify head SHA and result. Do not use a commit-diff fetch endpoint for the synthetic merge commit, since it may return a broad diff outside the allowed product inputs.

## Acceptance contract

M1 delivers server-backed request search, filters, counts, pagination and independent detail retrieval. Accept only if older active requests beyond the first 100 records are discoverable; counts reflect the currently authorised scope; paging, selection and audit history remain correct through refresh and failures.

Implementation expectations:

- Consume the existing F-002 status/count/keyset-pagination API and preserve its governance-owned authorisation. Do not duplicate its implementation.
- Initially load one page and offer explicit “Load more”. Reset pagination when search, filter or operating context changes. Reject stale responses and deduplicate requests by ID.
- Add optional server-side `q` matching request number and address. Trim it, match case-insensitively as a literal, cap input at 250 characters, and parameterise SQL. Empty search preserves existing behaviour.
- Preserve `status`, `before`, `requests`, `nextCursor`, and first-page counts. Counts are over the authorised search result before status filtering/pagination; later pages omit counts.
- Fetch selected request detail independently from loaded queue pages. Key detail and audit to request and operating context. Inaccessible detail clears actionable content and gives truthful recovery feedback.
- Preserve lifecycle and retained-review rules, operational ADMIN exclusion, officer assignment scope, and F11E uncertain-response recovery. No schema migration is planned.

Required executable coverage includes more than 100 requests and older active work; concurrent inserts; literal, empty and over-limit search; search/filter/count agreement; paging retry; stale responses; inaccessible selected detail; refresh and audit history. Preserve checks for council/context isolation, officer restrictions, ADMIN exclusion, disabled-pack review, session loss and uncertain-response recovery.

Required verification commands:

```bash
npm run check
npm run test:commandmaps:browser
npm run test:platform:browser
npm run test:activation:browser
```

Suites may be sequenced where ports collide. Inspect desktop and narrow screenshots against current design annotations and verify keyboard operation. Setup failure or skipped coverage is not a pass. Distinguish hosted and local runtime evidence.

## Authoritative constraints and product inputs to inspect

- Existing merged F-002 and current repository source at the exact candidate.
- `docs/wireframes/annotations/WF-S3 - Dashboard - Annotations.md` and `docs/wireframes/annotations/WF-S7 - Code21 Detail and Lifecycle - Annotations.md`.
- Current product implementation and executable tests: `services/api/app.mjs`, `services/api/entitlements.mjs`, `apps/commandmaps/src/main.tsx`, `apps/commandmaps/src/RequestQueue.tsx`, `tests/foundation.test.mjs`, `tests/browser.mjs`, `tests/browser-commandmaps.mjs`, `tests/browser/m1-discovery.mjs`, `.github/workflows/ci.yml`, and `docs/development/local-build.md`.
- Relevant current F-002, F11E, D03 and ADMIN-exclusion contracts may be inspected for authority; do not inspect audit reports, work checkpoints, implementation status, feature ledgers, or builder narrative.

## Raw hosted evidence

- Run `39895161432`, job `120223781860`: https://github.com/TechCorp25/CivicMaps-rebuild/actions/runs/39895161432/job/120223781860
- Screenshot artifact `platform-browser-evidence`, ID `12475868920`, GitHub digest `sha256:2e3252d9ab2983d9cbc8e99fa72e1ed80404256ab95d3dc98b480fa1ee21743c`: https://api.github.com/repos/TechCorp25/CivicMaps-rebuild/actions/artifacts/12475868920
- Docs-only candidate rerun `39895991685`, job `120226461231`: https://github.com/TechCorp25/CivicMaps-rebuild/actions/runs/39895991685/job/120226461231
- Screenshot files are available at `/tmp/m1-evidence-398951/m1-discovery-desktop.png` and `/tmp/m1-evidence-398951/m1-discovery-narrow.png`.

## Required report

Use a genuinely isolated checkout. `fork_turns=none`, model `gpt-6-astra`, reasoning effort `low`. Do not read this chat, prior audit reports, candidate handoff/status reports, checkpoint/ledger files, or self-review conclusions. Report only evidence-backed findings, exact commands and counts, candidate/base/tree, checks actually run, scope/limitations and verdict (`pass`, `changes_required`, or `blocked`). Do not edit implementation.
