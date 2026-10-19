# F11E — Dispatch detail and action recovery

**Status:** Implementation complete; publication/review pending
**Base:** `main` at `1bbfa7bb68190278d6adb64bba39527b7a3e7e36` (owner-merged PR #26 / F11D). GitHub compare verified `main` identical to this SHA on 19 October 2026. A direct `git fetch origin main` was attempted but the workspace proxy refused the connection; the remote comparison was completed through the authenticated GitHub API.
**Branch:** `codex/civicmaps-f11e-dispatch-detail`
**Worktree:** `/workspace/CivicMaps-f11e-dispatch-detail`

## Goal and feature contract

Make the existing CommandMAPS request detail accurate during selection, refresh and action recovery. The operator must be able to identify the selected request, see its last server-confirmed status/version, know which existing actions remain available, distinguish action rejection from an uncertain network result, and recover without losing safe draft input or silently resubmitting against another version.

This changes only the existing request-detail presentation and its client-side read/action recovery. It adds no API permission, lifecycle state, schema, workflow or new role. Existing capability checks, context scope, server version checks, idempotency, audit, council isolation, ADMIN exclusion, disabled-pack review and latest-100 disclosure remain authoritative.

## Repository-confirmed gaps at base

- `apps/commandmaps/src/main.tsx` derives detail directly from the queue array. It has no per-request detail loading/unavailable state, no displayed confirmed version/time, and a selected ID that disappears from a refreshed queue silently becomes the generic empty selection state.
- The audit effect clears entries on selection/version changes and ignores a response after cleanup, but it has no loading, empty or retryable unavailable presentation. Failures become a page-level error without naming the request/history operation.
- `perform()` presents all write failures as one generic error. A transport failure leaves the mutation receipt key in `retry.current`, and the next matching call can resubmit without a user-visible reconciliation step. A 409 refreshes the queue, but no request-specific conflict state or deliberate recovery explanation is shown.
- Assignment and closure forms are uncontrolled. They retain ordinary failed-submit input while mounted, but a refreshed version can remount the assignment selector, and there is no explicit safe-draft preservation contract for a conflict or confirmed refresh.
- The detail panel has an accessible name but is not a labelled live selection region; selection dismissal does not restore focus to the selected queue row. Action feedback is global rather than associated with the selected request.
- Existing polling uses a generation guard for queue reads, and audit reads use effect cleanup. Those protections are useful but do not cover stale actor/context or session boundaries consistently across the pending detail/action path.

No current browser assertion covers delayed A/B history completion, dismiss-during-read, stale context/session response suppression, uncertain write outcome reconciliation, or retained closure reason across a stale-version refresh.

## Design trace

Apply current design sources as bounded guidance; examples do not define API behaviour:

| Source | Applicable guidance |
| --- | --- |
| `_ds/SKILL.md`, `_ds/README.md`, `_ds/colors_and_type.css`, `_ds/tokens/civicmaps.tokens.json` | Use canonical tokens, Lucide, DM Sans, mono SR/version values, visible gold focus ring, semantic status encoding; do not invent token values. |
| `_ds/DESIGN_SYSTEM_DECISION_REGISTER.md` DR-14, DR-16, DR-17, DR-26, DR-28, DR-31 | Keep dispatch structurally distinct without management authority; audit is read-only; preserve post-auth uppercase visual entry; department/role header identity only; map only the actual server states to truthful labels. |
| `_ds/ui_kits/dispatch/Detail.jsx` and `_ds/ui_kits/dispatch/README.md` | Use its right-side detail hierarchy as a layout reference. Do not copy demo transition controls, eleven-state advancement, fabricated location/priority/zone data, or its decorative left border; README documents these as demo behaviour and supplied instructions exclude those assumptions. |
| `_ds/wireframes/screens/Wireframes S7 - Code21 Detail and Lifecycle.dc.html` + `_ds/wireframes/annotations/WF-S7 - Code21 Detail and Lifecycle - Annotations.md` | 7a.1 search/status context, 7a.2 selectable request, 7b.1 request/status identity, 7b.2 read-only assignment, 7c/7g read-only audit presentation and truthful empty history. These annotations are low-fi examples from another application; unsupported fields/actions are excluded. |
| `_ds/components/LifecycleStatusPill.jsx` | Reuse the canonical status component and adapt only the five statuses currently served (`RECEIVED`, `DISPATCHED`, `ACKNOWLEDGED`, `ATTENDED`, `CLOSED`) through existing label mapping. No additional states are enabled. |
| `_ds/DESIGN_SYSTEM_ACCESSIBILITY_SPEC.md` | A3 visible control boundary/focus contrast; D1 DOM-order keyboard access and visible focus; the detail remains a non-modal inline panel, so drawer/modal focus trapping in D2 is not applicable. |
| `apps/commandmaps/README.md`, `domains/service-requests-dispatch/README.md` | Follow local app/domain contract and existing API/capability boundaries. |

## Bounded changes

1. Bind request and audit reads to the selected request plus an actor/context/session generation; invalidate pending results on selection change, dismissal, logout, expiry and context replacement. Never render prior selection data as the new selection.
2. Add explicit request loading, unavailable/not-in-current-queue and audit loading/empty/unavailable states, with targeted retry/refresh. Display confirmed server status, version and update time.
3. Keep existing capability-gated actions and duplicate-submit protection. Preserve safe form drafts through rejected writes and conflict refreshes. For transport-uncertain writes, stop automatic retry, ask for server reconciliation, then offer only deliberate recovery using existing request version/idempotency semantics. Never silently rebase a stale action.
4. Associate persistent action/error/success feedback with the selected request, improve keyboard selection/dismissal focus handling, and ensure the existing detail layout remains usable at narrow widths.
5. Add focused synthetic Chromium coverage for demonstrated gaps and update evidence, this plan and the feature ledger.

## Acceptance checklist

- [x] Rapid A → B selection with out-of-order detail/history responses never mixes records.
- [x] Dismiss during loading and logout/session/context replacement invalidate delayed reads and writes.
- [x] Detail and history each show truthful loading, unavailable and empty states; no old content is relabelled.
- [x] Successful action shows server-confirmed request state/version and corresponding audit history.
- [x] Rejected/temporary action failures persist useful feedback and preserve safe input.
- [x] Stale-version conflict shows latest server state and retained draft; no silent resubmission or rebasing.
- [x] Repeated clicks are disabled while pending; uncertain response requires refresh/reconciliation before deliberate retry/action.
- [x] Existing disabled-pack retained review, cross-council denial, ADMIN exclusion and current server enforcement still pass in existing integration/browser regression coverage.
- [x] Keyboard selection/action/dismissal and focus restoration work; desktop and narrow layout remain usable.
- [x] Required local project validation, synthetic screenshots, JSON and whitespace checks complete using disposable synthetic data only.

## Governance dependencies and exclusions

No blanket governance hold. G04 is owned by the separate governance workstream; this feature depends on no G04 correction and will not duplicate F-002 (queue completeness), F-009 (shared capacity), F-011 (pool recovery) or F-029 (audit validation/rendering). If a verified UI issue requires one, record the precise dependency and continue independent work. The disclosed latest-100 request queue remains until reviewed F-002 is available on main. No provisioning/SSO/MFA, suspension, new permissions/states/schema, communications, routing, evidence/infringement flows, infrastructure, migration, seed, deployment or production-acceptance work is included. F08 remains accepted; no deployment or migration replay.

## Rollback

Revert the focused F11E commit(s) or close the unmerged feature branch. No server/schema/data changes are introduced; existing request records and audit history remain untouched. If a presentation regression is found before merge, revert the UI commit and retain the evidence/plan history.

## Working checklist / checkpoint

- [x] Read applicable repository guidance, requested planning/evidence files, app/domain READMEs and `_ds` guidance.
- [x] Query Empirical scoped to CivicMaps-rebuild and F11D/F11E.
- [x] Verify clean baseline, worktrees, merged F11D and current remote `main` SHA; create separate worktree/branch.
- [x] Confirm source-level detail/history/action recovery gaps and existing endpoint contracts.
- [x] Implement selection/loading correctness and action reconciliation.
- [x] Add targeted tests; inspect synthetic desktop/narrow screenshots.
- [x] Run requested checks and documentation/JSON/whitespace checks.
- [x] Write F11E evidence and final review packet/checkpoint.
- [x] Commit, push branch, verify remote SHA, and open draft PR #27.
- [ ] Verify hosted CI and request established Codex review on the final published head.
- [ ] Update Empirical and mark review-ready only after all required acceptance/review/publication steps.

**Checkpoint:** Base `1bbfa7bb68190278d6adb64bba39527b7a3e7e36`; published review head `e6dd6cc4e2576e86b72f82929c8e8f81d444d418`; draft PR #27 remains open. Hosted CI run `39196618185` passed on that pre-fix head. Codex review found three actionable issues in assignment refresh semantics, per-request uncertain-write recovery and history reconciliation selection guards. All three were reproduced/validated; the local fixes and focused browser assertions pass, as do the full local check (75/75 integration tests), CommandMAPS browser suite and activation browser regression. Next: commit/publish the fixes, verify the new remote SHA, rerun hosted CI and request Codex review on the updated head. No product-policy blocker.
