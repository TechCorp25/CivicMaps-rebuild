# Remediation evidence index

This index points to immutable goal evidence. Paths are relative to `docs/assessments/2026-10-30/`. R4's report records the exact product source SHA, hosted workflow conclusions, manifest identity and limitations. Hashes in each goal's checksum file should be verified from the intended directory before using evidence.

| Goal | Product source SHA | Report / verdict | Evidence and integrity |
| --- | --- | --- | --- |
| R0 | `9174ac53a5def003b85f508714e458767927531a` | [R0 review](../R0/9174ac53a5def003b85f508714e458767927531a/review.md) — pass | [Environment](../R0/environment.md), [packet](../R0/acceptance-packet.md), [candidate checksums](../R0/9174ac53a5def003b85f508714e458767927531a/SHA256SUMS). |
| R1 | `92a2296ca126c9cfb20f0f1dcf1636cdf764e28e` | [R1 review](../R1/92a2296ca126c9cfb20f0f1dcf1636cdf764e28e/review/review.md) — pass | [Corrective report](../R1/corrective-report-92a2296ca126c9cfb20f0f1dcf1636cdf764e28e.md), [acceptance packet](../R1/acceptance-packet.md), [validation checksums](../R1/corrective-validation-92a2296ca126c9cfb20f0f1dcf1636cdf764e28e/SHA256SUMS), [R1 checksums](../R1/SHA256SUMS). AUD-001 disposition is in [R2 register](../R2/findings-register.md). |
| R2 | `92a2296ca126c9cfb20f0f1dcf1636cdf764e28e` | [R2 review](../R2/bfdf6f3fcd7e7d36fd28bde35d2df31986517846/review.md) — accepted | [R2 report](../R2/report.md), [coverage matrix](../R2/coverage-matrix.md), [findings register](../R2/findings-register.md), [Context7 guidance](../R2/context7-guidance-review.md), [R2 checksums](../R2/SHA256SUMS). |
| R3.n | `d02cbe02f13ea3476d805dc27cfc72185eb9119f` integrated product | No instantiated R3 review; not applicable under accepted R2 and R4 review | [R2 findings register](../R2/findings-register.md); [R4 report](../R4/d02cbe02f13ea3476d805dc27cfc72185eb9119f/review.md). |
| R4 | `d02cbe02f13ea3476d805dc27cfc72185eb9119f` | [R4 review](../R4/d02cbe02f13ea3476d805dc27cfc72185eb9119f/review.md) — accepted | [Packet](../R4/acceptance-packet.md), [review checksums](../R4/d02cbe02f13ea3476d805dc27cfc72185eb9119f/review.SHA256SUMS), [evidence checksums](../R4/evidence-SHA256SUMS.txt), [product manifest](../R4/product-tree-manifest.sha256), [tree comparison log](../R4/product-tree-comparison.log), [execution directory](../R4/execution/). Manifest SHA-256 `de7adfb6af773d9c1059e99e6da30875a2db6eae2e522b7a65f3ca666a27036e`, 573 tracked product files. |
| R5 | Product source under review: `d02cbe02f13ea3476d805dc27cfc72185eb9119f` | No report yet; pending a fresh independent assessment | [Neutral acceptance packet](acceptance-packet.md); its checksum list is generated after the packet is frozen. |

## Hosted verification at the exact R4 product

The R4 independent report states the GitHub Actions merge commit was `c49ff8bc5a689c24b31f9f5d77788fdbd6e7d1da`, with parents `b168dc0ce2b3d28011588b497e8e6fc459c2aa6a` and the exact candidate `d02cbe02f13ea3476d805dc27cfc72185eb9119f`; its tree `1d0f8e323088b0ff71db5259e688baf7415cba0b` equalled the candidate tree. Both runs succeeded:

- [Implemented application checks run 41052458962](https://github.com/TechCorp25/CivicMaps-rebuild/actions/runs/41052458962)
- [Dependency advisory review run 41052458823](https://github.com/TechCorp25/CivicMaps-rebuild/actions/runs/41052458823)

The R4 report identifies successful hosted jobs `124051621318` and `124051621650`. These URLs establish where the recorded hosted runs can be inspected; the report remains the evidence for exact-candidate/tree matching.
