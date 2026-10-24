# PR #41 reconciliation with main — 24 October 2026

Scope: resolve the existing PR branch `codex/civicmaps-phase-status` at `bcc8e9526eeb87a2fc186c1a60502e092383aef9` against fetched `main@c92667e8bd9b12055f2714bac16e6d97008c0d70`. The owner requested conflict resolution and fixes for any completed Codex review findings. Guidance: Medium.

The GitHub Codex review summary completed on `bcc8e95` with no findings or unresolved findings. The review-thread query returned no threads. This is the review of the prior head, not a claim of a new review of this merge result.

Main includes merged PR #39 and M1 PR #40. The PR40 merged head is `144b2894f6cf81e79e544ce1db1a7d1678fc9109`; its later review fixes and tests are retained byte-for-byte from main. See [the PR40 review follow-up](M1-pr40-review-follow-up.md). M1's independent Astra acceptance remains scoped to `d905b85ca7f0c2a20eaa956b0448ed7f5581f47b`; it does not extend automatically to subsequent changes.

Six conflicts affected the F11 checkpoint, feature ledger, programme README, execution checkpoint, canonical plan and plan digest. Resolution preserves:

- The byte-identical audited v1.1.1 plan, digest, manifest, G1 v1.3 contract, owner-decision receipt and all existing P0/M1 evidence from PR #41.
- Main's detailed v1.0.0 plan in [a retained copy](../next-build-phase-v1.0.0.md), with its original SHA-256 `71670ccb2a90d9557f00bb32da57fa00ee2002ae6a7abe8b5efef99efe083b50`. Its detailed verification, signed-source provenance, audit isolation and portable publication requirements remain applicable alongside v1.1.1; its dated preparation/status/next-action statements are historical.
- Main's checkpoint publication provenance under explicit historical fields. The [current checkpoint](../next-build-phase-checkpoint.json), F11 current phase and ledger retain P0 acceptance and G1's unresolved commissioning decision while recording M1's owner merge.

No application source, API, migration, dependency, CI or executable test differs from main. The planned G2 test inventory remains documentation only. No new functional acceptance or independent Astra assessment is claimed. G1 and dependent G2 remain blocked; PR #41 remains open for review, and no PR merge or deployment is performed.

Validation passed: all PR JSON files parse; edited document links resolve; both plan hashes and audit-report hashes match; 75 frozen P0/M1 evidence files are byte-identical to the previous PR head; application code and executable tests equal main; conflict-marker and Git whitespace checks pass. `npm run lint` and `npm run format:check` also passed. Runtime/browser suites are not repeated for this documentation reconciliation; hosted checks on the new head are tracked separately.
