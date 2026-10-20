# Reference and gap matrix

Rebuild base: `313d9a3fc5b2f66819bfaa52019600c3e167eda7`. Preview inspected locally: `e53ec8caa902ced7b38f688a2b249320276545b4`, CivicMAPS/CivicMaps-preview. This is a pinned reference, not a claim it is current preview main. Revalidate remote before expanding reference scope.

| Capability | Rebuild evidence / gap | Authoritative design/reference | Milestone |
|---|---|---|---|
| Queue | API app.mjs `/api/requests` orders then LIMIT100; client filters loaded records | DispatchDashboard; S7 annotation 7a | M1 / F-002 |
| Detail/recovery | F11E selection/history/version/uncertain-write protections implemented | dispatch/Detail; S7 7b/7c/7g | Preserve M1/M6 |
| Intake | POST accepts address, latitude, longitude, notes only | S6 6a–6f; preview Code21CreateForm.tsx | M3 |
| Vehicle/catalogue | No package-aware intake contract in existing create API | S6 6c; preview catalogue is not national authority | M3 decision gate |
| Officer list | `/api/officers` uses active account and OFFICER role, not operational duty | S5/S8; inspect preview duty contract before mapping | M2/M4 |
| Assignment | Existing assign action/version/audit; no qualified duty/zone recommendation | S6 6d, S7; preview Code21Page.tsx | M4 |
| Location/zone | Coordinates stored; no implemented address-provider/zone workflow in current form | S4; S6 6b; gis-operations | M5 |
| Lifecycle | Five-state server domain, not eleven-state kit demo | lifecycle.mjs; canonical LifecycleStatusPill | M6 |
| Shared Code2 | Operational service contract not established by login or active user flag | officer-management, S8 and EnforcementMAPS kit | M2 |
| Shared SOS/comms | Not established by dispatch-kit demo banner/WS indicator | emergency-response, notification-delivery, recipient-groups | Future shared gates |
| Department identity | Role/department header already required | DR-28 and owner instruction | All UI |

Design entrypoints are `_ds/SKILL.md`, README, decision register, colours/tokens, accessibility specification; use the canonical `_ds/wireframes` screens AND matching annotations. Examples can contain simulated transitions. Existing request audit access is preserved even where kit prose says no global Audit navigation.

Preview inspection starts with `civicmaps/commandmaps/src/features/code21/Code21CreateForm.tsx`, `Code21Page.tsx`, and shell; inspect corresponding backend and shared contracts before treating a UI interaction as functional reference. A checked-out filename is not implementation evidence. For every new behaviour, add exact source symbols/annotation markers, test and evidence link to this matrix.

Preview backend follow-up: `server/src/modules/officer-status/officer.routes.ts` Code2 route and `server/src/modules/code1/code1.routes.ts` SOS route family inspected. Code2 needs active zone assignment and updates presence; SOS broadcasts broadly to online officers. Preserve intended sign-on feedback, but require approved duty semantics and scoped recipients in the rebuild. Preview work reports are historical, not acceptance evidence for this project.
