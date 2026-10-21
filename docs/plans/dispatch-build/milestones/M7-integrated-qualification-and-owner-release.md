# M7 — Integrated qualification and owner release

Status: planned; not implemented.

## Goal and work

Run realistic parking journeys, contrasting-package contract checks, second-council denial and inspected design comparisons. Publish draft PR/evidence, verify CI/reviews, wait owner merge then prepare pinned authorised release.

## Dependencies and stop conditions

Earlier milestone acceptance, independent review gates, applicable deployment authorisation, and accepted F11 G1–G4 authority products under the [programme mapping](../README.md#required-council-authority-work). Missing G2 staff-provisioning server behaviour or G3 council-administration UI blocks qualification even if M1–M6 dispatch tests pass.

Read current decisions/dependencies before starting. Ask only for unresolved policy affecting this contract. Continue a ready independent milestone when blocked, recording the reason. Do not expand scope to hide an unresolved dependency.

## Acceptance

Owner can test substantial dispatch using supplied instructions; remaining integrations labelled; no production/SOS/evidence-completion claim.

Required targeted scenarios: full required checks, browser role journey, backup/restore and migration compatibility, live smoke, owner test script.

## Execution sequence

1. Verify all required milestone merges and approved release scope. Require pinned G1 authority-contract acceptance, G2 server/schema/API-denial evidence, G3 council-administration UI evidence, and G4 new-council lifecycle evidence, plus the required G1, G2 and G3/G4 independent reports. Stop M7 if any is absent.
2. Run integrated role/package/council scenarios and required project checks, including two newly provisioned councils whose admins provision dispatcher/officer access before create → assign → acknowledge → attend → close, plus council/context denials, revocation and retained-review recovery. Seeded-staff scenarios alone do not satisfy G4.
3. Route regressions through narrowly scoped reviewed fixes; do not invent a new vertical slice or API expansion during qualification.
4. Publish release preparation and review evidence, verify remote SHA/CI, obtain the required G5 final-candidate independent assessment, and wait for owner merge.
5. Under applicable deployment authorisation, deploy a pinned artifact with migration compatibility, backup/restore and recovery evidence, then run live smoke and provide the owner test script.

## Review packet

Goal/result, exact diff/SHA, source trace, shared-service reuse proof, tests/screenshots, migrations/recovery, policy dependencies, residual gaps. Stronger-model approval must be explicit, never inferred from a running review or Luna's self-assessment.
