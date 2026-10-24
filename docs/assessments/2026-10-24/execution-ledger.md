# Code-quality remediation execution ledger

Plan: v1.0.0, SHA-256
`1ce4e1a3000c5148eb98d161d2d941f2e85009249cb6ddc9dd6c61dd36578cea`.
Assessment baseline: `346dfd2d74cdd52d88bf9e4b7bd046a500a4c390`.
Implementation package base: `ea76b23f15b0d13feada592a88b14b587f8b12de` on
`codex/civicmaps-quality-q1`, stacked on the published PR #43 assessment candidate.
No merge or deployment is in scope.

## Checkpoint state

| Goal | Status | Implementation | Independent acceptance |
| --- | --- | --- | --- |
| Q1 | Implemented and locally tested; publication and review pending | Candidate commit recorded after commit | Pending fresh GPT-6 Astra Low review |
| Q2 | Not started | — | Depends on Q1 acceptance |
| Q3 | Not started | — | Pending |
| Q4 | Not started | — | Pending |
| Q5 | Not started | — | Pending Python contract from Q4 |
| Q6 | Not started | — | Pending |
| Q7 | Not started | — | Depends on stable Q1–Q6 baseline |

Q1 covers QA01 and only the advisory portion of QA18. QA01 is implemented and
locally tested, pending publication and independent review. QA18's advisory portion
is implemented and tested; its Python and infrastructure checks remain open for Q5.
No issue is marked accepted or closed before independent review.

## QA01–QA18 dispositions

| Finding | Current disposition |
| --- | --- |
| QA01 | Implemented in Q1; local evidence recorded; independent review pending |
| QA02–QA17 | Open; assigned to their planned Q packages |
| QA18 advisory | Implemented in Q1; review pending |
| QA18 Python and infrastructure | Open; assigned to Q5 |

## Q1 implementation and evidence

The lockfile now resolves `body-parser@2.4.0` under Express 5.2.1, with only the
compatible parser's required lockfile transitive changes. The committed package
manifest does not add a duplicate direct dependency. The API continues to accept
compressed JSON. The executable test starts an isolated child API against a
synthetic disposable database and sends gzip, deflate and Brotli bodies, including
truncated JSON, invalid compressed streams and a valid compressed frame with
trailing bytes. It asserts each response, process survival and a subsequent healthy
request. Requests are bounded to three seconds; child startup to five seconds; the
test to 30 seconds, with child termination during cleanup.

A lockfile-matched audit script produces separate production-only and complete-tree
JSON reports. High and critical findings block; low and moderate findings are
reported for maintainer review. A weekly and on-demand workflow retains both
reports. The false-positive procedure requires evidence and review; no advisory
ignore list is provided. Context7 was not available in the current tool inventory;
the repository's retained GitHub advisory response and npm's lockfile-matched audit
are the version-relevant official sources used for this dependency change.

Evidence is in `evidence/q1-*.log`, `evidence/q1-advisory/`, and
`evidence/q1-lockfile.diff`. `evidence/q1-SHA256SUMS.txt` hashes these raw artifacts.
Validation on the candidate: clean `npm run setup`; `npm run check` passed 95 tests,
zero failed and zero skipped; the focused body-parser regression passed; production
and all-tree audits reported zero findings; both Caddy ingress checks passed; all
three browser suites passed. The activation suite reported port 5173 occupied and
selected another port; the suite completed successfully. Generated tracked F11E
screenshots were restored after the browser run. No node/Vite process remained after
the suites. Socket-listener inspection was unavailable because the executor denied
netlink access.

## Next action

Record the committed implementation SHA and exact candidate SHA, publish through the
single integration writer, then provide the pinned product, neutral Q1 task contract,
file inventory, reproduction commands and evidence hashes to a fresh GPT-6 Astra Low
audit context. Keep Q2 blocked until Q1 is accepted.
