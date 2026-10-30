# R1 evidence manifest notes

`SHA256SUMS` inventories the R1 evidence tree, including the candidate-specific original Astra report and its reviewer-provided nested checksum manifest. It excludes itself and `checksum-verification.log`; the latter is derived output of `sha256sum -c SHA256SUMS` and is retained to show the verification results. The corrective-validation subdirectory has its own `SHA256SUMS`, which excludes only itself.

The original Astra report remains byte-for-byte identical at `122e56de88923a2eabc075ed677a15299049436c/review.md` (SHA-256 `d0321a14f2853da94de07aa551fcc482866c2ab7a361410e5f629b5bdc0e74a6`). The separate `review/122e.../review.md` copy is also retained unchanged; the candidate-keyed path is canonical.

`candidate-source.sha256` uses repository-root-relative paths and should be checked from the repository root with `sha256sum -c docs/assessments/2026-10-30/evidence/remediation/R1/candidate-source.sha256`.
