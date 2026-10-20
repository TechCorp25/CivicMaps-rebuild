# Development continuation — 20 October 2026

Preparation only; owner will switch model before starting the run. Use the [F11 plan](../plans/F11-next-phase-build-plan.md), [execution state](../plans/F11-execution-checkpoint.json) and [independent audit protocol](../plans/independent-product-audit-protocol.md).

GitHub comparison verified local baseline/main `313d9a3fc5b2f66819bfaa52019600c3e167eda7`; PR27 is merged. PR25 is a separate draft at observed head `254423e103f86b30c94bd45cd518f1563d388d82`. Recheck both on resumption. Source unchanged by assessment; this preparation changes documentation/records only. Ledger F11E merge and F09 misattribution corrected. Two all-NUL README files replaced with source-based guidance.

Bootstrap is partial: Node24.19/npm11.9 work, existing dependencies are present, lint/format/typecheck/both builds pass. Full integration check failed at setup; foundation diagnostic reports EPERM at loopback PostgreSQL55432, PostgreSQL15 binaries are absent, configured HTTP proxy fails. Package download could not locate PostgreSQL15. Do not claim runtime/browser acceptance. Use workspace-local data/cache paths when completing setup. Assessment log: `/workspace/work/civicmaps-check.log` (ephemeral, not acceptance of F11).

Do not restart F08 deployment or replay retained migrations. F11 begins with G0 environment and G1 explicit staff-authority contract; G1 is independently audited before authority implementation. F12 follows completed F11, and F09 suspension choices remain separate. New approved governance decisions must be reconciled precisely, never silently broadened from old wireframes.

This checkpoint is builder handoff material and must not be included in the independent auditor's input packet. Publication identity is recorded in the GitHub draft PR and Empirical receipt after creation, avoiding a self-referential commit hash in this file.
