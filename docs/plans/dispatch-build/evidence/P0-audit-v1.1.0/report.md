# P0 independent portable-plan assessment — v1.1.0

Verdict: **CHANGES_REQUIRED**. Two blocking documentation findings remain: the corrected G1 contract/decision receipt cannot be recovered from the published product, and current status fields contradict each other. This is an assessment of the planning product, not a new functional assessment or a merge/deployment recommendation.

Assessment date: 23 October 2026 UTC. Auditor: GPT-6 Astra, low effort, fresh independent agent context (`fork_turns=none`). Inputs were the frozen assignment, specified product documents, authoritative G1 receipt, committed M1 report/raw evidence and read-only GitHub identity responses. No builder conversation, broad Empirical notes, prior P0 conclusions or implementation narratives outside this product were used. The M1 report was inspected because it is an expressly required evidence deliverable. No product files were edited. Git object reads and separate byte snapshots froze the inputs without depending on a mutable checkout.

## Identity and hashes

- Repository: https://github.com/TechCorp25/CivicMaps-rebuild
- Branch: `codex/civicmaps-phase-status`; draft PR #41 is the packet's publication reference.
- Verified remote branch candidate: `3736b6c08b189a0567ebb7cf35ad81c88ee0bf5a`.
- Verified candidate tree: `12738412b57590ae20c1596e6e73719b7a5ec58f`.
- Local same-tree commit: `dfde2e461c530c25d1beff1902c9c7ece057e022`.
- Verified current main/base: `d4921eb1c37550d9ca1b53a5615242922abfa4ad`; tree `0b5f55e855a59574e1063d20f7f85f102559a99d`.
- Plan content commit/permalink: https://github.com/TechCorp25/CivicMaps-rebuild/blob/52b6af2bf8779e7760c651b5adf8274b5939a818/docs/plans/dispatch-build/next-build-phase.md
- Exact plan SHA-256: `44e6bb15b003c668cd5a8d71c618b4071694a2121f5eb12f8c98161b46ed4f29`.
- Plan manifest SHA-256: `28d5d81f3626233f86c3961a3290d74dbf717aff0aa9f2e216567b6cbe50b0fd`.
- Assignment SHA-256: `972e26da97fdf8c32be021eebe92c8c0446e9c1d2317adfcf2948686dd71a254`.
- Input inventory SHA-256: `7c5cebc437535e31aa40fc16e5ec2615d228fcdacfd55fdceb443c2fe3913c89` (`input-manifest.sha256`, all product byte hashes).
- M1 report SHA-256: `d23a1a9cca4149c322e2790804c1bedc37c57be7237cf9bd2bdf90c3dc9d2123`.
- Inspected local G1 v1.3 SHA-256: `949f029a331b3b37a5dc0f47b9424189e8439f13a00d6005c3dcd08f146c2c28`; owner receipt SHA-256: `749b4c210d9e238c6e4bd91f695c3d1bb2ae2dd7d588ac61855e6d27b5a9a303`.

GitHub directly confirmed main, candidate tree and branch head. The immutable permalink returned exactly the local plan bytes. `sha256sum -c` passed; the manifest agrees. Local base ancestry passed and tracked status was clean. Remote Git objects were not downloaded via Git: shell network access failed at the proxy; connector responses supplied independent remote verification.

## Findings

### P0-01 — High: G1 handoff depends on unpublished local objects

Locations: `docs/plans/dispatch-build/next-build-phase.md:24` and `:95`; `docs/plans/civicmaps-feature-ledger.json:707`; `docs/plans/dispatch-build/plan-manifest.json` G1 dependency.

The published plan identifies corrected G1 v1.3 solely as local commit `ee4ea9d5f2155c69e74e5894a3202f7c9eeefc87`, tree `55c3ffbf3bc69d5ef8f6a21a996eb7b7d4f31a90`. Neither `docs/plans/F11-G1-council-staff-authority-contract.md` nor its source receipt `docs/plans/evidence/F11-G1-owner-decisions-2026-10-22.md` exists in the frozen P0 tree. GitHub GET of that exact G1 commit returned 404. The ledger's branch/path mention does not provide a retrievable exact corrected artifact. A collaborator with only the published planning product cannot recover the corrected contract and verbatim resolved decisions; this fails acceptance criterion 6 even though this auditor could inspect the local Git object.

Reproduction: `portability-checks.json` records both exact `git cat-file -e <candidate>:<path>` failures (exit 128). `remote-g1.json` contains the exact request and 404 response. `g1-inputs/` preserves the locally inspected authoritative bytes and hashes, without implying they were published.

Required correction: publish the exact proposed contract and decision receipt in a reachable immutable repository artifact (or include their exact copies in the portable product), link it with exact commit/tree/hash and retain the commissioning blocker. Publication must not be represented as G1 acceptance.

### P0-02 — Medium: current status sources disagree

Locations: `docs/plans/dispatch-build/execution-checkpoint.md:5`; `docs/plans/civicmaps-feature-ledger.json:707`, `:709`, `:712`; `docs/plans/F11-execution-checkpoint.json` `/phaseM1G1Status/p0`.

The execution checkpoint's expressly current paragraph says “P0 plan remote publication/hash ... remain pending”, while the manifest, F11 current checkpoint and feature ledger report published draft PR #41 with a concrete immutable content commit and matching hash. The ledger's current `/nextBuildPhase/m1IndependentAudit` remains `pending_fresh_context`, alongside `/nextBuildPhase/m1Audit: pass` and `m1: accepted`; its G1 contract path still says “v1.3 correction in progress” while the current plan identifies the correction as committed. These fields are not labelled historical. They can direct a resumed worker to repeat completed work or misclassify acceptance. Criterion 3 requires consistent current statuses.

Required correction: reconcile the current publication/hash, M1 audit and G1 correction fields, or explicitly move superseded statements into a dated historical object. Preserve independent-audit and Empirical-readback pending states where genuinely pending. The historical F11 snapshot and historical PR37 text are already explicitly marked superseded and are not findings.

## Acceptance results and evidence

1. Identity/hash/permalink: PASS for the verified identities and exact bytes above. See `checks.json`, `remote-main.json`, `remote-candidate.json`, `remote-ref.json`, `remote-content.json`.
2. Plan completeness/boundary: PASS. The plan contains M1 search/pagination/detail requirements, G1 action/API/migration design requirements, acceptance, verification, concurrent independent-audit gates, handoff rules and dependencies. G2 implementation, M2–M7, merge and deployment are explicitly excluded.
3. Entrypoints/status/history: CHANGES_REQUIRED (P0-02). Programme README links v1.1.0 and distinguishes historical PR37/6761 provenance; the F11 legacy-snapshot note explicitly designates the current phase object. Root README is licence-only; the programme README serves as the requested programme entrypoint.
4. M1 acceptance provenance: PASS within the report's stated limits. Exact accepted implementation is `d905b85ca7f0c2a20eaa956b0448ed7f5581f47b`, tree `9f2950e421c230c03b05efbdcc76a8b4e4fda1da`. The report hash matches. All 19 entries in the raw-evidence manifest match, decompressing gzip logs before hashing. Final hosted log binds checkout to that head/base (line 231), reports 93 tests/93 passes/zero failures, cancellations or skips (477–484), and all three browser PASS lines (773, 786, 798). Local browser logs contain EPERM database setup failures, consistent with the explicit limitation, not a local pass. Owner merge remains required. This P0 review does not rerun or independently recertify M1 source behavior or screenshot provenance.
5. G1 status/decision representation: PASS for the inspected local authoritative contract/receipt and the plan's substantive account. v1.3 retains separate staff/operational authority, non-authorizing recovery intake, exact-scope one-level delegation, independent configurable verifier, 24-hour hashed one-use invitation and central-security SUPERVISOR grants with independent approval. The commissioning path is expressly unresolved; D02 grants no bootstrap staff authority; G1 acceptance/G2 remain blocked. No missing authority is invented. Portability remains deficient under P0-01.
6. Portable handoffs: CHANGES_REQUIRED (P0-01). M1 repository/branch/base/accepted candidate, commands, report/raw packet, limitation, owner-merge dependency and next action are recoverable. The corresponding exact G1 corrected artifact/receipt are local-only.

## Checks, raw evidence and limits

`snapshot-commands.json` records exact Git show commands for the frozen input files. `input-manifest.sha256` binds copies under `inputs/` and `g1-inputs/`. `checks.json` records identity/ancestry/status/hash commands and outputs. `portability-checks.json` records missing-tree-path commands and outputs. `remote-*.json` preserve exact connector responses and request URLs where applicable. `m1-raw-checks.json` records each raw-evidence hash comparison and relevant log lines; full unmodified committed logs/metadata are in the input snapshot. SHA-256 checking uses original bytes, or `gzip -dc` bytes for compressed log entries, against `evidence-sha256.txt`.

An initial encoded branch URL was rejected by the connector (`remote-branch.json`); the supported Git ref URL succeeded (`remote-ref.json`). The initial shell `git ls-remote https://github.com/TechCorp25/CivicMaps-rebuild.git refs/heads/main refs/heads/codex/civicmaps-phase-status refs/heads/codex/civicmaps-dispatch-g1` failed with exit 128, “Failed to connect to proxy port 8080”; that failure was not treated as remote absence. The G1 finding instead rests on the independent GitHub 404 and frozen-tree checks.

No application tests, deployments, migrations or external writes were performed. No Empirical plan readback was supplied or inspected; this report does not establish that separate publication-completion condition. No G1 functional acceptance or legal authority certification is made. Correct the two product findings and assess a newly frozen candidate; the owner commissioning decision remains a separate genuine G1 blocker.
