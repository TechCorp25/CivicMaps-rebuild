# P0 independent planning reassessment — v1.1.1

Verdict: **CHANGES_REQUIRED**. G1 artifact portability is repaired, and the M1/G1 acceptance states are reconciled. One medium-severity publication-metadata inconsistency remains in the current feature ledger. This verdict covers the planning product only, not M1 implementation acceptance, G1 policy acceptance, merge, or deployment.

Assessed 23 October 2026 UTC in a fresh isolated agent context using the frozen assignment, product documents, prior independent P0 report/requirements/checks/sanitized snapshots, and read-only GitHub responses. No builder conversation or self-review conclusions were used as evidence. A parent message identified an additional ledger field location during review; its contents were independently read and verified below. Product files were not edited.

## Exact identity

- Repository: https://github.com/TechCorp25/CivicMaps-rebuild
- PR #41 candidate: `3a8a58ee371e43ef9e41bfd5b6d3a316394341be`.
- Candidate tree: `9cd6c008bc967a1743c51638bee9618d5058660c`.
- Local same-tree HEAD: `7b6cc5bb860d5c6fbcf1637b399a671cb67ea516`.
- Base main: `d4921eb1c37550d9ca1b53a5615242922abfa4ad`.
- Plan version: `1.1.1`; SHA-256: `d3fc4acb06f94cef2b23ce0a2aecc34669db3a0e79b97f22ed4f11bcc73dd180`.
- Published plan: https://github.com/TechCorp25/CivicMaps-rebuild/blob/e4f42dd0f3dcb07565d49bf97e0a3f151d715247/docs/plans/dispatch-build/next-build-phase.md
- Manifest SHA-256: `1df6fd101d50c8472b002570e42222e04848ffa714439b222902393aaf291376`.

GitHub independently confirmed the candidate tree and PR base/head. The PR is open, draft, unmerged and mergeable. Local tree identity, clean status and base ancestry passed. The immutable plan response equals the local plan byte-for-byte; its SHA-256 agrees with the hash file and manifest.

## Finding P0-02R — Medium: current ledger still contains conflicting publication identities

File: `docs/plans/civicmaps-feature-ledger.json`, lines 690–691 and 737–739.

The current `/dispatchBuildProgramme/p0PlanVersion` says `1.1.1`, but `/dispatchBuildProgramme/p0PlanSha256` is still the v1.1.0 hash `44e6bb15b003c668cd5a8d71c618b4071694a2121f5eb12f8c98161b46ed4f29`, and `/dispatchBuildProgramme/p0ContentCommit` still references `52b6af2bf8779e7760c651b5adf8274b5939a818`. These fields are not marked historical.

Separately, `/nextBuildPhase/p0ContentCommit`, `/nextBuildPhase/p0ContentTree`, and `/nextBuildPhase/p0GitPermalink` identify local commit `be3ce8607221b98ecdfe480dfcd0fc81ba1d9723`, tree `ae65a91f982113c20c65ece91d37113b684f20a3`. Fetching that exact permalink from GitHub returns HTTP 404, “No commit found for the ref”. Other current fields in the same object and the canonical manifest identify published commit `e4f42dd0f3dcb07565d49bf97e0a3f151d715247`, tree `16aaae2219bad85b79cabf556326f323802999c4`.

A resumed worker cannot safely use all current fields interchangeably: one path yields the previous plan hash/version pairing, another yields an unavailable plan. This leaves prior criterion 3 (consistent current status/publication metadata) incompletely repaired and weakens the portable handoff.

Required correction: reconcile all five named fields to the current verified plan hash and published commit/tree/permalink, or explicitly move superseded receipts to a historical object. Freeze and reassess the corrected candidate. The plan text need not change merely to correct this ledger metadata.

## Checks and resolution of prior findings

1. **P0-01 resolved.** The exact G1 v1.3 contract and owner-decision receipt now exist in the candidate tree, with usable paths in the F11 checkpoint and links from the contract/test inventory. GitHub commit `97776474e97d286b07a8b9f0baadb4d86ac54c2e` resolves to tree `55c3ffbf3bc69d5ef8f6a21a996eb7b7d4f31a90`; its remote tree blob IDs equal the blobs calculated from the included files. Contract SHA-256 is `949f029a331b3b37a5dc0f47b9424189e8439f13a00d6005c3dcd08f146c2c28`; receipt SHA-256 is `749b4c210d9e238c6e4bd91f695c3d1bb2ae2dd7d588ac61855e6d27b5a9a303`. They also match the prior audit's authoritative snapshots.
2. **P0-02 partly resolved.** The current execution checkpoint no longer falsely says remote publication/hash are pending. M1 independent audit is pass and M1 is accepted at `d905b85ca7f0c2a20eaa956b0448ed7f5581f47b`; G1 correction is published and G1 remains blocked. F11 current checkpoint and plan agree on v1.1.1 and pending P0 reassessment/Empirical readback. Remaining publication conflicts are the finding above.
3. **Scope/dependencies and handoff pass within planning scope.** The plan defines M1 search/count/paging/detail acceptance, G1 actor/action/API/migration requirements, verification commands and evidence, exact candidates and branches, independent fresh-context review, owner-merge prerequisites, and next actions. M0 architecture acceptance is distinct from functional acceptance. G2 implementation, M2–M7, merge and deployment remain excluded. README and checkpoint distinguish earlier PR37/S0 records from current status.
4. **G1 representation passes as a blocked proposal.** The receipt records exact-scope one-level delegation, separate configurable verifier, 24-hour one-use hashed invitations and central-security SUPERVISOR grants with independent approval. The contract preserves separate staff/operational authority and non-authorizing recovery intake. Initial commissioning expressly lacks an authenticated first authority; D02 cannot supply it. Owner resolution, subsequent contract freeze/reassessment and owner merge remain prerequisites. No missing authority was selected by this review. `tests/f11/README.md` clearly labels the inventory planned, not executed.
5. **M1 acceptance provenance is preserved, not re-audited.** The independent M1 report's hash matches `d23a1a9cca4149c322e2790804c1bedc37c57be7237cf9bd2bdf90c3dc9d2123`. Its exact accepted candidate, local database failure, hosted evidence and owner-merge limit are represented accurately by current P0 status. No implementation tests or new source audit were performed.
6. **Prior evidence integrity passes for retained snapshots.** All 28 entries in the sanitized P0 v1.1.0 input manifest match, with zero missing files or mismatches. Prior report hash matches `587f4dba0884172ac82b2735368304be1c26defc40bbe4f7d526b70bc7c7bd7f`. The prior report and checks were read as prior independent evidence, not as automatic proof that this revision passed.

## Evidence and limitations

`checks.json` preserves local commands/results, plan byte comparison, G1 remote/local blob comparisons and key hashes. `remote-candidate.json`, `remote-pr.json`, `remote-plan.json`, `remote-stale.json`, `remote-g1.json` and `remote-g1commit.json` preserve read-only connector responses; `prior-manifest-check.json` records all retained-snapshot verification results.

No Empirical v1.1.1 full-plan readback was supplied or inspected. That separate completion condition remains pending as the product states. This review did not rerun M1 tests, verify every M1 raw log/screenshot, authenticate the signed owner's legal authority, or conduct the separate G1 policy acceptance review. No external writes, migrations, merge or deployment were performed. The local checkout uses a different commit identity with the verified exact candidate tree; remote identity was checked through GitHub rather than downloading its Git objects.
