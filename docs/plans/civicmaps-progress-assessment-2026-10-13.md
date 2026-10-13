# CivicMAPS progress and code quality assessment

Author: Codex (agent). Assessed 13 October 2026 at main `7bbee4347d1c5f3dabc39956475e50cbe182a215`, which has the identical tree to F02 commit `0a0df917f6368533b8880fa74b36497849fcf467`.

## Outcome

The implemented local foundation has reproducible builds and meaningful platform acceptance coverage. It is not yet an enforced code-quality baseline or a deployable municipality-service ecosystem. Complete the new **F02Q quality gate** before **F03 operating-context binding**. This checkpoint changes documentation and planning only; findings below are not claimed as fixed.

## Verified progress

- PR #4 is merged into main, merge commit `c688991a1088262b77c1246aa06b4b71760081e2`.
- PR #6 is merged into main at `7bbee4347d1c5f3dabc39956475e50cbe182a215`, bringing F02 head `0a0df91`. Main and that F02 head share tree `52f1e0d4fecf6ef557214fa29c657261559a99d6`, so reviewed source matches the merged build. The owner corrected the earlier PR #5 reference; PR #6 is the canonical F02 integration record. An older connector PR #5 record is not used as integration evidence.
- [Hosted F02 CI run 38401301114](https://github.com/TechCorp25/CivicMaps-rebuild/actions/runs/38401301114) completed successfully. Its workflow runs both app typechecks/builds, API integration tests, generated-token checks and Chromium platform acceptance. Earlier local evidence records 18 passing integration cases and the browser flow: [F01](evidence/F01.md), [F02](evidence/F02.md).
- This assessment inspected source and freshly retrieved hosted results; it did not rerun the runtime suite. Shell Git fetch failed because the sandbox could not reach its configured proxy; the GitHub connector supplied remote PR/CI evidence. Local `origin/main` is stale and is not used to establish merge status.
- Municipality registration, pack configuration and illustrative health exist. Actual municipality/context binding, provisioning, service routing, EnforcementMAPS delivery, citizen reporting and payments remain planned. Existing database-role separation is not proof of production sandbox isolation.

## Findings and bounded corrections

| Priority | Evidence | Assessment and completion target |
| --- | --- | --- |
| High | Root `package.json`, `.github/workflows/ci.yml` | No runnable root lint or formatter gate. Typechecking/building does not replace linting. F02Q adds pinned tools, explicit file coverage and CI checks; no blanket ignores for implemented source. |
| Medium | `apps/civicmaps-platform/src/main.tsx`, `services/api/platform.mjs` | Dense single-line JSX and multi-statement lines obscure branching and transaction review. Apply a separate formatter mechanically, then extract only cohesive views/helpers. Keep simple direct SQL and the existing stack. |
| Medium | Platform `main.tsx` effects | Fetch effects correctly abort on cleanup, but call component-local `fail` without declaring it as a dependency. Establish stable handler dependencies and React Hooks linting; do not blindly add unstable callbacks or disable exhaustive-deps. Preserve `route.page`, whose omission previously disabled same-ID pack navigation. |
| Medium | `tests/foundation.test.mjs`, `tests/platform.test.mjs`, `tests/browser-platform.mjs` | Disposable database/migration/server lifecycle repeats across harnesses. A small shared lifecycle helper can prevent cleanup drift. Preserve distinct auth scenarios, unique database ownership and cleanup after partial setup failure. Avoid a generic test framework. |
| Low | `tests/browser-platform.mjs` | Narrow screenshot is captured twice to the same file. Remove the redundant capture in F02Q. Existing role/label locators and retrying assertions are useful and should remain. |
| Medium | Plan/ledger | F02 remained marked in progress after publication; original plan still said start F01. This checkpoint reconciles state and inserts F02Q with explicit exit criteria. |
| Low | Comments at important invariants | Secret omission already has a useful comment. Add similarly short rationale at transaction-local roles, the route-page dependency and positioned table container. Use language-appropriate comments and relative evidence links; avoid comments that merely repeat statements. |

Shared password and transaction helpers, extracted Onboarding/UI components, parameterised SQL, idempotency receipts and explicit migrations are sound foundations. Do not merge council and platform authorisation just to reduce textual duplication: their separate identities and database roles are intentional. There is insufficient evidence to label the entire repository “best in class”; the specific gaps above are measurable work.

## Context7 reference review

Context7 resolved React's official documentation (`/reactjs/react.dev`) and TypeScript ESLint (`/typescript-eslint/typescript-eslint`). Retrieved guidance was applied to the findings and next-phase acceptance criteria, not treated as evidence that tools already pass.

- [React useEffect](https://react.dev/reference/react/useEffect): include reactive dependencies and clean up fetch work so stale responses cannot overwrite current state. Existing AbortController usage follows the cleanup principle; handler dependency hygiene needs checking.
- [Lifecycle of reactive effects](https://react.dev/learn/lifecycle-of-reactive-effects): dependencies follow the values read by the effect. Stabilise or restructure handlers rather than suppressing dependency warnings.
- [typescript-eslint formatting guidance](https://typescript-eslint.io/users/what-about-formatting/): keep formatting separate from semantic lint rules; use Prettier and disable conflicting stylistic rules where necessary.
- [typescript-eslint getting started](https://typescript-eslint.io/getting-started/): use recommended flat configuration for TypeScript alongside ESLint's JavaScript rules. Select compatible pinned versions during F02Q; documentation examples alone do not establish compatibility with the repository toolchain.

## Next autonomous build phase

Execute [F02Q](civicmaps-platform-assessment-and-autonomous-plan.md#f02q--enforced-code-quality-baseline) on one fresh feature branch, then F03. F02Q finishes only with lint/format enforcement, preserved behaviour, exact validation evidence, remote publication and Empirical update. Formatting and behaviour changes should be separate commits for review. Do not change schemas or introduce provisioning/payment dependencies in this phase.

F03 remains the next functional feature: explicit versioned municipality-to-tenant/organisation/jurisdiction/data-plane bindings; Alpha/Beta and shared-service fixtures; forged, unset and expired contexts denied; repeatable migration and immutable operational origin. Cloud/provider, identity and payment decisions remain at their existing D01–D06 boundaries.

Gotchas must be recorded in Empirical as symptom → cause → fix → prevention, with project/feature tags. Known examples are same-ID route transitions, screen-reader label overflow, writable npm cache, Vite shared-font access, stale remote refs and dependency symlinks. On resumption, read these records before repeating failed operations.
