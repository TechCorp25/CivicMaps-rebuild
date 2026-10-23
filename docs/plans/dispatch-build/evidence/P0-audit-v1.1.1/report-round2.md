# P0 v1.1.1 corrected-candidate independent reassessment

Verdict: **CHANGES_REQUIRED** on directly verified local product evidence. Remote identity verification is blocked by tool/network availability; this report does not infer a remote pass. Assessed 23 October 2026 UTC in a fresh independent context, without builder conversation, reasoning or self-review. A parent follow-up requested completion after the independently discovered status discrepancies were reported; the findings below derive from the product bytes.

## Exact identities

- Assigned PR #41 head: `80ad43d7b24df5072d08172c66b8a61e3f0ad01d` (not independently confirmed remotely in this run).
- Verified clean local HEAD: `045bc0dd97364265250e7278fcccc60b2bc39111`.
- Verified local tree: `e869b973afc1c5992cf66aebeaec54a39ab287a6`, exactly matching the assigned candidate tree.
- Assigned base main: `d4921eb1c37550d9ca1b53a5615242922abfa4ad` (current remote status not independently confirmed).
- Canonical plan version: `1.1.1`.
- Verified plan SHA-256: `d3fc4acb06f94cef2b23ce0a2aecc34669db3a0e79b97f22ed4f11bcc73dd180`.
- Manifest content commit: `e4f42dd0f3dcb07565d49bf97e0a3f151d715247`; content tree: `16aaae2219bad85b79cabf556326f323802999c4`.
- Recorded permalink: https://github.com/TechCorp25/CivicMaps-rebuild/blob/e4f42dd0f3dcb07565d49bf97e0a3f151d715247/docs/plans/dispatch-build/next-build-phase.md

The hash file passes and the manifest, both current ledger identity groups and authoritative F11 phase checkpoint agree on those five plan identity values. The five publication fields identified in the preceding v1.1.1 assessment are repaired. No old conflicting hash/commit/tree/permalink remains in those current P0 identity fields. The historical F11 snapshot is expressly superseded by phaseM1G1Status and is not treated as current.

## Finding P0-03 — Medium: current Empirical status still contradicts the verified receipt

1. `docs/plans/civicmaps-feature-ledger.json:682`, JSON pointer `/dispatchBuildProgramme/status`, remains `M1_accepted_G1_blocked_owner_choice_P0_reassessment_and_empirical_pending`.
2. `docs/plans/dispatch-build/README.md:26`, the current read-order entry, says “canonical v1.1.1; P0 independent audit and Empirical readback pending”.

Both conflict with `/dispatchBuildProgramme/p0Status`, `/nextBuildPhase/p0Status`, F11 `/phaseM1G1Status/p0/empirical`, and the current execution checkpoint, which record the full-plan byte-for-byte readback as verified. Neither location is labelled a historical publication snapshot. A resumed worker is still given contradictory completion states. Correct these current status entries to retain fresh assessment pending while recording Empirical readback verified. The frozen plan's publication-time pending statement points to the current checkpoint for receipts; it need not be rewritten merely for this receipt update.

Additionally, `docs/plans/civicmaps-feature-ledger.json:634` retains a current feature `nextAction` directing continuation under plan v1.1.0. Update that current action to v1.1.1 or explicitly mark it historical while reconciling the entrypoints.

## Checks completed

- Read canonical plan, manifest/hash, programme README and execution checkpoint, F11 checkpoint and feature ledger, G1 v1.3 contract and owner receipt, F11 planned test inventory, and prior P0 v1.1.0/v1.1.1 reports and receipt.
- G1 contract and receipt are present and match the retained authoritative hashes: contract `949f029a331b3b37a5dc0f47b9424189e8439f13a00d6005c3dcd08f146c2c28`; receipt `749b4c210d9e238c6e4bd91f695c3d1bb2ae2dd7d588ac61855e6d27b5a9a303`.
- G1 remains blocked by unresolved initial authority commissioning. D02 cannot create staff-management authority; no bootstrap permission is invented. Owner resolution, subsequent independent acceptance and owner merge remain required before G2. Inventory expressly says planned, not executed.
- M1 acceptance remains tied to `d905b85ca7f0c2a20eaa956b0448ed7f5581f47b`, with hosted success and local database limitations distinguished. M1 report hash matches `d23a1a9cca4149c322e2790804c1bedc37c57be7237cf9bd2bdf90c3dc9d2123`.
- Prior v1.1.0 report hash matches `587f4dba0884172ac82b2735368304be1c26defc40bbe4f7d526b70bc7c7bd7f`. All 28 retained input-manifest entries pass SHA-256 verification.
- Both entries in the v1.1.1 MANIFEST.sha256 pass. Report hash is `ab0b3ea5eb165e3a6556a3fec368355ad2b0df2e91e7f2f4c38be546af843480`; receipt hash is `2c1dd93ebd21a792dec8d7637d4d60d819c99fa14437c1f93e24613ff57ff672`.
- G2 implementation, M2–M7, merge and deployment remain excluded. The review changed no repository product files; local status was clean at the beginning and end.

## Limitations

GitHub get_pr_info and fetch were discoverable but returned `Unknown tool` after supplying the required link_id. Shell `gh api` failed with `proxyconnect tcp: dial tcp 172.31.2.13:8080: socket: operation not permitted`; curl also could not retrieve the response. The assigned remote candidate is absent from the local object database. Therefore live PR head/tree/base/draft status and immutable permalink bytes could not be independently reverified. Prior remote reports are historical evidence, not substitutes for those checks. Remote verification must be repeated on the next frozen candidate.

Empirical readback was not independently inspected, as allowed by the assignment; only the product's verified receipt and its internal consistency were assessed. No application tests, M1 source reassessment, G1 policy acceptance, legal-authority certification, external writes, merge or deployment were performed. This report identifies concrete local documentation defects; it does not grant planning acceptance despite the blocked remote checks.
