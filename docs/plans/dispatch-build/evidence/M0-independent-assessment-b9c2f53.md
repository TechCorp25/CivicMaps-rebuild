# Independent M0 architecture/backlog assessment — b9c2f53

Task ID/version: DISPATCH-M0, architecture/backlog acceptance supplied 21 October 2026 and candidate milestone M0 contract. Assessment timestamp: 2026-10-21T21:16:10Z (UTC).

**Verdict: changes_required.** The full architecture and executable milestone backlog are suitable at M0 scope, subject to their explicit owner-policy and later wire-contract gates. Two P2 documentation defects prevent unconditional packet acceptance. No functional implementation, G1 authority-contract acceptance, deployment, runtime qualification or production approval is granted.

## Identity and independence

- Baseline: `65757b67669e7f9e79fcd160d5e5de23d9d7d42f`.
- Assessed published candidate: `b9c2f5326ae646b83ca1b510277b3721274a25d9`.
- Candidate tree: `dfe9267e6f1ecf270acebef3dc9567928be16d46`.
- Remote: `https://github.com/TechCorp25/CivicMaps-rebuild.git`, branch `codex/civicmaps-f11-m0-architecture`.
- Preview behavioural reference: `CivicMAPS/CivicMaps-preview` at `e53ec8caa902ced7b38f688a2b249320276545b4`.
- Auditor: GPT-6 Astra, Low effort; newly spawned context with `fork_turns=none`, model/effort explicitly confirmed by coordinator. No inherited builder conversation. Task, acceptance requirements and resulting product/source were the assessment inputs. No Empirical builder notes, `evidence/M0.md` narrative or historical `M0-independent-assessment-5a38fff.md` verdict were consumed. The execution checkpoint was examined only as a consistency target, not correctness evidence. The signed-owner decision assessment was used for its attributable requirements, not its favourable disposition or linked prior review conclusion.

## Actual checks and results

1. Initial sandbox `git ls-remote` failed because the configured proxy was unreachable. An authorised escalated fresh clone succeeded independently into `/tmp/civicmaps-m0-audit-b9c2f53`. `git rev-parse HEAD HEAD^{tree}` returned the exact candidate/tree above. Detached checkout of that commit succeeded. This closes the reproducibility problem for this assessment; no unavailable historical tree is required.
2. A separate fresh preview clone into `/tmp/civicmaps-preview-m0-audit` successfully checked out the exact reference SHA. Independently inspected the create form, detail symbols, Code21 route/contracts, officer Code2 route/contracts and SOS fan-out source.
3. Read all fourteen programme/milestone Markdown targets. Checked ownership, dependency ordering, decision stop conditions, M3 data/migration proposal, authority preservation, negative scenarios and release gates against inspected source and approved owner constraints.
4. On the detached candidate clone, checked 29 relative Markdown links: zero missing file targets. Checked the embedded M3 JSON example and `docs/plans/F11-execution-checkpoint.json`: valid JSON. Link check establishes local target existence; it does not validate external URLs or every heading fragment.
5. `git diff --check <baseline> <candidate>` passed. Baseline is an ancestor of the candidate. Diff is documentation-only. No runtime, database, cloud, browser or deployment tests were run or represented as run; those are outside this M0 assessment.
6. SHA-256 manifest below is calculated from immutable Git blobs using `git show <pinned-sha>:<path>`, not a concurrently editable worktree. Whole manifest hash, including final newline: `dabc68b41103fd2479be97af5c268aa071085089ce55126ab9380a10a93e5f40`.

Reproduction: clone the named branch, detach at the candidate, run `git rev-parse HEAD HEAD^{tree}`, `git diff --check 65757b67669e7f9e79fcd160d5e5de23d9d7d42f HEAD`, inspect the listed targets and parse JSON. Clone preview separately and detach at its pin. Manifest prefixes `rebuild/` and `preview/` identify the corresponding repository; hash each listed pinned blob with SHA-256.

## Source trace and architecture assessment

| Contract area | Independently inspected evidence | Assessment |
|---|---|---|
| Shared services and package ownership | Domain responsibility READMEs; programme shared-service table, dependency graph and M1–M7 contracts | Common request, duty, spatial, delivery and audit responsibilities are separated from Parking payload/catalogue. No microservice deployment or arbitrary plugin engine is implied. Contrasting non-vehicle package tests are explicit future acceptance, not falsely claimed implementation. |
| Authority and council context | `services/api/app.mjs` authenticated/scoped/mutation paths around lines 90–180; migration013 entitlement function around lines 74–96; signed owner Q1/Q2/Q5/Q6/Q9 constraints | M3 uses server-derived context/pack and preserves ADMIN exclusion, permissions, CSRF and idempotency. Shared code does not imply shared council/branch access. G1–G4 remain separately required before M7; this packet does not claim those products exist. |
| Discovery baseline | API lines 428–476; `main.tsx` lines 181–193; `RequestQueue.tsx` lines 48–85; foundation test starting line 138 | Matrix accurately distinguishes server status/count/keyset interface from current client all-page loading/local filtering. M1 retains meaningful remaining work without duplicating governance ownership. Test source exists; its runtime results were not assumed. |
| Intake and retained data | API POST allowlist at line 479 onward; M3 proposed closed package envelope, captured identity/version, nullable migration and compatibility-window stop condition | Proposal is additive and compatible with historical unknown package data. Server validator registry and payload fingerprint requirements avoid client authority and parking-only common fields. Exact parking validators/catalogue remain D-INTAKE, correctly blocking affected implementation. |
| Code2 and availability | Preview `officer.routes.ts` lines 741–825 and `shared/contracts/officer-status.ts`; S1 1h/S8 8a.2 | Code2 requires active assignment and changes presence in preview. Rebuild plan correctly separates duty from login and leaves state/sign-off/session policy to D-DUTY. |
| Routing and spatial context | S6 6b/6d; preview create-form manualOfficer handling and GET zone-resolve route | Manual selection persistence, server-authoritative eligibility and commit-time checks are appropriate. Provider/licence/disclosure and expanded routing authority remain explicit gates. Annotation/source conflict must be recorded (finding 2). |
| Lifecycle and safety | `domains/service-requests-dispatch/lifecycle.mjs`; preview Code21 schema; Code1 `broadcastCode1` lines 37–60 | Five-state rebuild is correctly preserved rather than copying eleven preview states. Broad preview online-user fan-out is correctly rejected as authority for scoped SOS; operational safety controls remain deferred behind D-SAFETY. |
| Approved design constraints | S6/S7 annotations, S1 1h, S8 8a.2; DR-28 register entry | Useful behavioural references are identified without adopting preview role assumptions, catalogue or hardcoded FOOT travel mode. Failure-flow disagreement needs explicit traceability correction. |

Milestones specify goals, dependencies, stop conditions, targeted negative scenarios, branch/review/merge boundaries and migration/recovery obligations. Policies are not silently selected. D-DUTY, D-INTAKE, D-ROUTING, D-GIS, D-SAFETY and D-LIFECYCLE gate affected work only. The council-authority track has explicit G2/G3 products and new-council G4 journeys, with M7 stopping if they or their reviews are absent. These are adequate architecture/backlog boundaries; later wire contracts and executable evidence are still required.

## Findings

### 1. P2 — Publication receipt contradicts pending assessment status

Location: `docs/plans/dispatch-build/execution-checkpoint.md:33` at the assessed candidate.

The receipt says “This checkpoint records architecture/backlog acceptance” and “Owner review remains the next action”. Lines 8 and 29 correctly say fresh M0 assessment is pending. The closing receipt can therefore direct a resumed builder to treat acceptance as already established, violating the protocol requirement that publication/ledger status not claim an audit before its report exists. Its “published in draft” wording also describes an initial state rather than the current ready-for-review state stated elsewhere.

Reproduction: read candidate lines 8, 29 and 33 together. Required correction: make the receipt distinguish initial publication from current published candidate, and state both current independent-assessment outcome and outstanding owner gate without asserting acceptance prematurely. Do not repeat already completed publication/review steps.

### 2. P2 — Known annotation/reference disagreements are not recorded

Location: `docs/plans/dispatch-build/reference-and-gap-matrix.md`, Intake and Location/zone reference rows and preview-inspection guidance; README requires recording source conflicts.

At the pinned preview, `civicmaps/commandmaps/src/features/code21/Code21CreateForm.tsx:382` calls zone resolution with a query-string GET, and `civicmaps/server/src/modules/code21/code21.routes.ts:297` declares `router.get`. S6 marker 6b.4 instead says POST. More materially, the pinned form's `handleDispatch` catch at lines 568–570 sets `showReview` false, whereas S6 markers 6e.5 and 6f describe failure reopening/remaining in review. The matrix cites these references without recording the disagreement, leaving a future builder to treat incompatible behaviours as a single inspected baseline.

Required correction: record exact pinned source symbols/lines and annotation markers in the matrix. Keep the M3 requirement to retain input and provide safe edit/retry as an intended rebuild acceptance target; do not describe review-on-error as verified preview behaviour. No owner-policy reopening or preview code modification is needed.

## Disposition and limits

The previously unavailable historical tree does not block this report: this assessment binds a freshly cloned published commit and exact tree. The M3 status now correctly recognises PR31 owner merge and waits for fresh M0 assessment/applicable policies; its stale pending-publication issue is resolved. The remaining receipt inconsistency and source conflicts above require correction and targeted reassessment of a newly published commit. Architectural scope itself has no additional blocking finding from this full review.

Not verified: G1 actor/action/API design, functional implementations of future services, live provider behaviour, application/integration/browser test execution, hosted CI/PR state, deployment identity, customer acceptance, legal schedules or production controls. Later material architecture changes require affected reassessment. This report is not an approval to bypass owner merge or any scoped policy gate.

## Exact input manifest

Files below were product targets, requirement/source dependencies, or parsed metadata; reading was scoped to relevant sections/symbols. Hashing a whole file is integrity binding, not a claim of exhaustive review of every line.

```text
1d5b803d0340b04c40f7804520cba98bd0517215583671a66b7332434c8939b8  rebuild/AGENTS.md
87082871b87e2561a5b1773167c6e4a45c177349699a11529f5c0f779be03480  rebuild/_ds/DESIGN_SYSTEM_DECISION_REGISTER.md
6e3c4033a17533a3cfdf49097856e22ffc9300b89ad445299520a8738599d1a5  rebuild/_ds/SKILL.md
54c197b39e58cc3ac5e86832baa30c992bc6c46944b23cb070a4dd7353bce416  rebuild/_ds/wireframes/annotations/WF-S1 - Entry and Authentication - Annotations.md
06ecdec6ada760efac91a043d827a88174f7150425da8ae70058054573878332  rebuild/_ds/wireframes/annotations/WF-S3 - Dashboard - Annotations.md
568cf40cf60107a3c5a4821aef3fa49455b62ec13dd57ca921dcce17fd386403  rebuild/_ds/wireframes/annotations/WF-S4 - Live Map - Annotations.md
29a5c7456915981afe2520e0b71dc0bb8e11ac8931ccd9be82c0c2bc77c15214  rebuild/_ds/wireframes/annotations/WF-S5 - Directory Assignments and Look Up - Annotations.md
778e6e981582012146f5e0e5ac844d8f43402c97f8330f37f6a3746e6911576a  rebuild/_ds/wireframes/annotations/WF-S6 - Code21 Create and Dispatch - Annotations.md
1c395da02ad44f6fccddfd5e7d25a64b169698443d9119b147b01d37d4a7b6b6  rebuild/_ds/wireframes/annotations/WF-S7 - Code21 Detail and Lifecycle - Annotations.md
417a1802e200fa5c3d8e34316a3c49b0d06418016ebad8d4715879f672a89307  rebuild/_ds/wireframes/annotations/WF-S8 - Officer Dispatch Workflow - Annotations.md
66d24b46acb00e82fdfa0657ca90196e7eb333e442163b4a48ff04060b0e0510  rebuild/apps/commandmaps/src/RequestQueue.tsx
95e9b1986b0c5c4c5853731f6d9cd91f44a481f52abae9b39e696b699ad1d34a  rebuild/apps/commandmaps/src/main.tsx
6abee0b85019ff1fccbc5429193799ee7a8b323c5995c686d70dba0856a4b2e8  rebuild/docs/plans/F11-execution-checkpoint.json
93db372ae9912c51fb956ca30fc9b21e062d826a2ce3e67487206bc05ce8f93c  rebuild/docs/plans/dispatch-build/README.md
2700dd1ce7ad227b8c67aa68cd44e9c9fb6f44b560525e1c6a5249365ead027a  rebuild/docs/plans/dispatch-build/decisions-and-dependencies.md
b3a6df272a2a34919f01f72c033f64c74cf18b4682c23cf39ed52b502522a5df  rebuild/docs/plans/dispatch-build/execution-checkpoint.md
6aae9b6a1455f3712182e110df8114c37defc965d79779dcf2a284d428315a73  rebuild/docs/plans/dispatch-build/milestones/M0-architecture-and-executable-backlog.md
90e7fcce715de321c090c9b977bedc8d95d67621fdfc4d53ade72fad552b294a  rebuild/docs/plans/dispatch-build/milestones/M1-complete-shared-discovery.md
455e30d2cbdb325dbe577f29b5c30924d480611f4008c6a1a53fd2c3fbcea9ee  rebuild/docs/plans/dispatch-build/milestones/M2-shared-code2-and-availability.md
6c9826fdcf346176550cb552d52531e45f80c204503fb9182be1c64563631067  rebuild/docs/plans/dispatch-build/milestones/M3-package-aware-parking-intake.md
3a1ce4521b438f51194a453f1313c617791f51ebc2706fab6f8c4a7c19ba90d6  rebuild/docs/plans/dispatch-build/milestones/M4-shared-assignment-and-dispatch-routing.md
52a25395e4f822cf788e1d82e8edb74e2b9a16c6005dcd75cd1019c02f2ca9aa  rebuild/docs/plans/dispatch-build/milestones/M5-shared-spatial-and-travel-routing-context.md
232c251b5ff35646265482d5e476319f9b3a2ddb7b29be06316704b77fed4f1d  rebuild/docs/plans/dispatch-build/milestones/M6-shared-tracking-and-lifecycle-recovery.md
c5cc73faf5f1e26c72eb7ccdd6ad15f2adf39d6d865fe4b7c00e8b0ed49f852b  rebuild/docs/plans/dispatch-build/milestones/M7-integrated-qualification-and-owner-release.md
3a7445403d81884e2cd274c9d9c107c4959bb328ff29dc3a10f0e974db41d618  rebuild/docs/plans/dispatch-build/milestones/README.md
216cae9dcceb832da845f6311c7eaf86dc45f45f430594a029388ace0c72175f  rebuild/docs/plans/dispatch-build/reference-and-gap-matrix.md
2b0cab7d1d5770c2ff675dd7682a245a432b3525821b0029d0e86e34b5ef3849  rebuild/docs/plans/dispatch-build/shared-service-contracts.md
144d367f10b59dbe3f9b36f9661ed77105098429b3ffbedc1149d03d2a5f312b  rebuild/docs/plans/evidence/2026-10-19-signed-owner-decisions-assessment.md
02ced655e48f0b183dfecd1ff97283682943dca3e0b1855ea12d1578807e3106  rebuild/docs/plans/independent-product-audit-protocol.md
e07eec875efa1f2e6b6a544606a405919069056aa91aea491be67c09fc0c3a21  rebuild/domains/emergency-response/README.md
afc08e63715d292b6bd84438372a888f2ab265e4894a3c2fc2610550e06636e6  rebuild/domains/gis-operations/README.md
7dc593087d326e60b2d729f59a2d30a6d4fd777800cfbfed648704916eec1024  rebuild/domains/notification-delivery/README.md
3edcbaf15e86e12a81691001d87444dd0283425a23b0ec35c14f95e62247da50  rebuild/domains/officer-management/README.md
3a31164231fd712e5aff99a07a342fe924c7ea4ce0d759280a13f8e67beea460  rebuild/domains/recipient-groups/README.md
f7b7e9ed9d924ed8e6c715807dc1c53046a4d8a69b42e114a67c7fb5e6158c07  rebuild/domains/service-requests-dispatch/README.md
37c5e1f91f53ac73d36725bb99fb9d3e9d97d928553ed076bcfb98f02620e651  rebuild/domains/service-requests-dispatch/lifecycle.mjs
c3fd79874fabb8ff8459a6d02ecc35da67226c68be132d6cbb660b90ecb87bba  rebuild/package.json
4107ba632976a16f7658a48aec9979b2d34d48c9008af428fe7d45cd29011ed5  rebuild/services/api/app.mjs
2c06463d901e30e7d0e07347ae4e747d4e4314c0a13b5e54e8fa8fb44742deb7  rebuild/services/api/migrations/013-pack-entitlements.sql
a318e3267de46ce281da16c106297c7a7a81324bb5f2810e143a0abbbad42320  rebuild/tests/foundation.test.mjs
fd01a829364a0e695e49130e141152400c10216b95cca73291fa518ac9be3cc2  preview/civicmaps/commandmaps/src/features/code21/Code21CreateForm.tsx
a14592a317005a753d4a245970335017d38f3f3662fac37cc480c9e07e7f72c9  preview/civicmaps/commandmaps/src/features/code21/Code21Page.tsx
05013ee8c4d1a839153ede8455fbccde95db20322f22e5e89ff25ff7fad881c7  preview/civicmaps/server/src/modules/code21/code21.routes.ts
e92e3acb34b699eb67c0d71a8e37fab6b7ced3e7b89d3e5fadfc0dccc0a05c32  preview/civicmaps/server/src/modules/officer-status/officer.routes.ts
72bdae91c7c37382098b134a58f7097fd8d928c339eec9a914a326d4ae862a4f  preview/civicmaps/server/src/modules/code1/code1.routes.ts
a54937a865fede4b7ea566a0814e1ba952757829ed2e51e9a6497d33a3de8b7c  preview/civicmaps/shared/contracts/code21.ts
c56d34b2924b4459e7775d218f41c9f1be9befe0707ad885704e552324421cc4  preview/civicmaps/shared/contracts/officer-status.ts
```
