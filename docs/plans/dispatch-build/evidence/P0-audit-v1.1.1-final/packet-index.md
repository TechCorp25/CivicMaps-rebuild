# P0 v1.1.1 final evidence packet

The adjacent `report.md` is the exact independent-assessment report, SHA-256 `c8f195ca49d4b8d6a10f09aa2dff46d9edf121482d971ecd103f6e47be8b64b7`. The auditor's transient paths are mapped into this portable packet as follows:

- `/workspace/audit-evidence/p0-v1.1.1-final-acceptance/remote-verification.json` → [`remote-verification.json`](remote-verification.json). This is the sanitized supplied GitHub connector evidence cited by the auditor; it is not represented as a query performed by the auditor.
- `/workspace/audit-evidence/p0-v1.1.1-evidence-review/empirical-plan.json` → [`empirical-plan.json`](empirical-plan.json), the sanitized Empirical `get_memory` readback used for the byte comparison.
- The auditor's `checkout/` was a detached, clean checkout used for same-tree local inspection. Its checkout path is transient and is not a product artifact.

The assessment is for plan candidate `5b1333c9c607a651b2c0af05ab793edd09888c58`, tree `e85db4a5fc7bebce2f35ee379a1148fe394462d3`. The later PR head contains only evidence and checkpoint documentation and is recorded separately in the current programme checkpoint.
