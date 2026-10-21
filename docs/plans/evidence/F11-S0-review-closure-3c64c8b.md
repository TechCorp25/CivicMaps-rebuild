# PR34 independent targeted reference-closure assessment

Timestamp: 2026-10-21T20:32:36Z

Task/version: PR34 review-reference correction, 21 October 2026. Determine whether current documentation withdraws unsupported exact-candidate acceptance, whether this assessment and evidence bind reproducibly to a reachable committed snapshot, and whether historical runtime evidence is distinguished from fresh validation without claiming functional F11 acceptance.

Baseline: `f3c5db10fb4f8b3cc98d9201180495d6efad3791`.
Candidate: `3c64c8bc0f7c8e25a3dfa373bf6f4ec49403615e`.
Candidate tree: `38d37d1995612e9ba4d9777126742f8c456ee3d6`.

Auditor: GPT-6 Astra, low reasoning effort. This assessment used a fresh agent context supplied with a neutral task and pinned identities, without inherited builder conversation. The operational build plan, builder handoff narrative and broad Empirical notes were not consulted. The checkpoint was inspected as a product deliverable; the original S0 audit was inspected solely as the defective reference artefact, not relied upon as a prior verdict.

## Frozen input manifest

Each hash below is SHA-256 of the exact bytes returned by `git show 3c64c8bc0f7c8e25a3dfa373bf6f4ec49403615e:<path>` in an independently created fresh remote clone. The manifest SHA-256 is `42c114b3da11c7ec10472926109c9b4fcee9a98618597e211868449b60c4a6d8`, computed over the six lines inside this block in the displayed order, with two spaces between hash and path and an LF after every line, including the last.

```text
02ced655e48f0b183dfecd1ff97283682943dca3e0b1855ea12d1578807e3106  docs/plans/independent-product-audit-protocol.md
2475ea277afad953063a8f185ba1c3dd0a20c6717068c7635430d42e2910967c  docs/plans/F11-execution-checkpoint.json
16ebde502898f5d34989cf072a1f6430205519a1a958a2a8aacba0f0c347391b  docs/plans/evidence/F11-S0-audit-reference-correction.md
c5e63a49cbd70f43b91194e3687669c2d3c75d01d19f0c91fead25ab6b14a828  tests/f11/README.md
6a7b199b7ba770967a7f36c119b15a16ed6ae51b59867df929ee76d751d0d1ee  docs/plans/evidence/F11-S0-baseline-2026-10-21.md
b4c0c4e859e4be2a55c6a6023cca3aca07cc4cf34e8d1fd4395b11a9770e7c1e  docs/plans/evidence/F11-S0-independent-audit-6a590e4.md
```

Additional inspected inputs: baseline checkpoint bytes, baseline-to-candidate Git diff, Git object/ref metadata and the candidate `tests/f11` file inventory. No runtime logs were used as fresh execution evidence.

## Checks actually executed

- Independently queried `git ls-remote origin refs/heads/codex/civicmaps-f11-autonomous-build`; the published branch resolved to the candidate SHA. The initial sandbox network request failed to connect to the proxy; the subsequent approved network execution succeeded.
- Created `/tmp/f11-independent-3c64c8b` with `git clone --single-branch --branch codex/civicmaps-f11-autonomous-build --no-checkout https://github.com/TechCorp25/CivicMaps-rebuild.git`. Fresh-clone HEAD and `git rev-parse <candidate>^{tree}` matched the identities above. `git merge-base --is-ancestor <baseline> <candidate>` exited 0.
- Read every manifest file directly from that candidate, recomputed its hash and the manifest hash, and parsed the checkpoint with Python `json.loads`: passed. The checkpoint's historical `reportSha256` matches the committed report bytes.
- Reproduced the original defect: `git cat-file -e 6a590e4321b37eb609fbb17b22cdcca36b1b9380` in the fresh clone exited 1. The baseline checkpoint hash is `4fcae9673a5e25c3dcdc524f58b3d7b727e0556e0afd355bf5a502bce073c839`, differing from the historical audit's `6dbcf892a2bfe8b635e82bb3d8ae04c07847389ec8a5665a9d87cd27a7f94688`. This assessment does not reconstruct or validate that historical staged snapshot.
- Inspected the complete baseline-to-candidate diff: only `docs/plans/F11-execution-checkpoint.json` and `docs/plans/evidence/F11-S0-audit-reference-correction.md` changed. `git diff --check <baseline> <candidate>` exited 0. No application or executable test code changed.
- Inspected current checkpoint audit status, limitations, review reference and next action. They explicitly classify the old pass as historical and unbound, withhold current-candidate acceptance, and require a fresh committed-candidate assessment. G0 remains locally validated, with no attached audit; release assessment remains incomplete.
- Inspected README and baseline evidence. Their hashes match the preserved historical manifest entries. `git ls-tree -r --name-only <candidate> tests/f11` returns only `tests/f11/README.md`; it explicitly labels coverage as planned. The baseline document dates its runtime/check observations to verified main and expressly denies acceptance of new work.

## Findings, scope and limits

No blocking findings for the targeted reference correction. The unsupported exact-candidate acceptance is withdrawn rather than retrospectively asserted. The historical report is preserved and accurately marked unusable as acceptance of the current branch. This report binds its own narrow assessment to the reachable published commit, tree and exact documentation bytes above.

The historical 92-test result, database readiness, hosted CI outcome and ownership inventory were not independently revalidated here. No application tests, database checks, browser suites, CI jobs or deployment checks were executed. Their retained statements are historical baseline evidence, not fresh validation of this candidate. This report is a targeted closure assessment, not a full S0 reassessment, functional F11 acceptance, release approval or deployment verification. It does not satisfy the checkpoint's separate next action to obtain a full committed-candidate S0 assessment. Any later changes require reassessment of affected claims; this report itself is an output outside the assessed candidate.

Verdict: **pass**, limited to PR34's audit-reference correction at the exact candidate above.
