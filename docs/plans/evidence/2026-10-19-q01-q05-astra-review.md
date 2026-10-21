# Independent Checkpoint B review — Q01–Q05 council authority contract

19 October 2026. Reviewed draft: `work/q01-q05-council-authority-design-contract.md`, SHA-256 `1830e9fcfeb948db76bf1333245bce81985cb4ddbfc6bba2f986cdfd855af333`. This is a reassessment of this design document, not owner/customer approval, legal review, implementation approval, production acceptance or certification. No repository files were edited and no tests were run. This report and a PDF text extraction are the only local review outputs.

## Disposition

**The signed directions are represented substantially faithfully, but this draft is not yet a sufficient implementation contract for new council administration, enrollment, recovery or structural execution.** It is sufficient to select a first bounded slice and make its remaining engineering decisions concrete. The material corrections below attach to the affected behavior; they do not create a blanket governance or development hold, or require the owner to repeat Q01–Q12.

The most consequential omission is an actual migration conflict: current synthetic behavior intentionally lets one principal operate in Alpha and a Beta council context. Q02 now prohibits that. The draft cannot simultaneously preserve all existing context behavior and introduce strict council principals. It must preserve original records and attribution while explicitly retiring that shared-principal authority. Global email lookup and a user-level operational role are additional current-to-target gaps requiring explicit treatment.

## Evidence and source pins

- Independently hashed and extracted the supplied executed PDF at its recorded attachment path. Hash matches `63e61d2a0f800b4fa713ed5b5f8041c8e5c43bf10930b95e18d0c412f8f4af30`; the fresh extraction exactly matches `work/advanced-review-signed.txt`. Reviewed the controlling schedule, especially Q01–Q09. This does not authenticate execution or signer identity.
- Read `work/signed-decision-advanced-review.md`, repository signed-owner assessment/review, D02, D03, and the authority/data-flow matrix. Queried project-scoped Empirical context; it reinforces continuing bounded development and the preserved Alpha/Beta state.
- Local governance HEAD is `a88d8c5eb227fb2b285b24cd27aaae08c72fb00d`; local `origin/main` is `1bbfa7bb68190278d6adb64bba39527b7a3e7e36`. The difference from requested application pin `b7d7ec53d2b14259162965ea24861a565a590b95` to HEAD consists of four governance documentation files. Thus application sources inspected at HEAD are those of `b7d7ec53`. No remote ref freshness claim is made.
- Inspected current principal/session/context code, foundation/context/bootstrap migrations, runtime-role setup, routing, the shared-service fixture and relevant test source. Compared application changes between `1bbfa7bb` and `b7d7ec53`; resource admission, request listing and related fixes do not replace the identity/role/grant model identified below. Reading test source is not executing it.
- Supplied evidence says CI run `39162739171` passed at `b7d7ec53`. I neither ran nor independently queried that CI. It is existing implementation evidence, not evidence that this proposed authority model works.

## Owner fidelity and boundaries that are sound

Q01 correctly retains central security as primary and qualified documented delegation for routine branch work. Q02 preserves independently administered council principals, sessions, status, grants and work, and correctly rejects shared upstream identity as a shared authorization principal. Q03 preserves suitable SSO preference and separately governed MFA fallback without selecting a vendor. Q04 correctly overrides option C's one-admin wording with two named active MFA administrators plus a separate recovery custodian. Prompt disablement is correctly allowed below the two-admin target. Q05 correctly combines independent council authorization, exact bounded operator execution during rollout and preserved version/history.

The Q07 interface correctly distinguishes council authorization from independent second-operator approval, rejects two credentials belonging to the same person, and does not impose operator approval on routine Q06 activation. Q09 correctly avoids an invented dual-approval requirement for every export. D02 bootstrap is not promoted into new administrative/recovery authority; ADMIN retains its operational exclusion. The explicit BYPASSRLS limitation is accurate and necessary.

No invented legislation, universal retention period, notification deadline or production approval was found. Some additional engineering restrictions are sensible proposals, but must be settled as proposals rather than presented as extra owner decisions.

## Required corrections, ordered by effect

### 1. Make the current-to-target identity migration explicit

Draft lines 17, 82–84 and preservation item 2 omit these concrete source facts:

- `services/api/migrations/001-foundation.sql:2` defines globally unique `users.email`; `services/api/app.mjs:247` looks up an active user globally by email before route validation. Bootstrap migration 012 also checks email collisions globally. Council-specific authentication cannot be implemented by changing only a session field.
- `users.role` is stored once per user. Migration 004 grants bind user to context without a role; `operating-context.mjs` retains the user role when resolving a selected context. The proposed context-specific role/capability set is new functionality, not an existing invariant.
- `data/fixtures/operating-contexts.json` assigns its third, shared context to Beta municipality while retaining `organisation-alpha`. `tests/operating-context.test.mjs:90` explicitly expects `shared@alpha.example` to use both Alpha and this Beta context, and later grants an Alpha officer the Beta shared context. This is operational cross-council principal reuse, not merely two branches in one council.

This shared-service finding concerns repository synthetic fixtures and test expectations. It does not establish that a live shared principal exists, and it is distinct from the accepted retained Alpha first-admin and permanently disabled Beta first-admin state. No live database was inspected in this review.

**Change required:** add a compatibility manifest covering identities, credentials, grants, sessions, historical actor references and bootstrap records. Every future principal has one immutable council owner; current multiple-council grants are identified explicitly, and conflicting authority is retired without rewriting historical origins. Do not infer council ownership solely from email, current selected context, or the legacy home tenant/organisation fields. Do not automatically split a person into active accounts, copy credentials or mint replacement grants. State exactly which existing synthetic assertions are superseded by Q02 and which remain mandatory. Preserving records/history does not mean preserving cross-council access.

Council-qualified credential lookup, duplicate email handling, bootstrap issuance/redemption collision checks and audit/error visibility must be treated together. Per-context roles can be a later slice, provided the first slice neither claims to implement them nor grants differing roles using the existing global role field.

### 2. Resolve the administration scope and approval vocabulary

Line 36 requires every access grant to have one branch and context version, while central security, council approvers, recovery custodians and feature administrators act at council scope. The contract does not explain how those permissions exist without manufacturing an operational context or a wildcard that bypasses branch grants. Define separate council administration permissions and operational context grants, or an equally precise typed scope model. Council administrative authority must not depend on an operational pack being enabled, or grant operational/historical access.

Lines 60–78 do not enumerate routine actions or say which need independent approval. Line 52 prohibits approving one's own proposed change, while line 78 leaves combined routine approval/execution open; distinguish proposing, approving and executing. A delegated branch administrator must explicitly be allowed the routine branch-scoped approvals selected by Q01, within its approved action list. State whether second-level delegation is forbidden, whether delegates can change other administrators, and how central security resumes branch responsibility when delegation expires. Do not implement a generic “manage staff” permission before these answers exist.

Correct two actor-table ambiguities: line 62 must say exceptional recovery approval is available only to the independently appointed recovery custodian; a generic council approver cannot substitute. Line 67's “no authority to add/revive grants” should distinguish executing an exact approved *new* grant from deciding to add one or reviving a revoked grant. Otherwise it contradicts Q05 access replacement. Independent approval rules for the subject of an elevation must hold even when someone else proposed it.

### 3. Convert lifecycle descriptions into transitions

The state tables describe outcomes but do not specify who may cause each transition or the prerequisite evidence. A pending principal is said to have “no grants,” yet a proposed grant could reasonably exist before enrollment; use “no effective grants” if that is intended. Choose whether rehire uses a new principal or an explicit new lifecycle episode on the retained council principal, and preserve attribution without reusing revoked authority. Define activation separately from grant activation and credential/MFA recovery.

Line 90's exclusion of recovery reactivating a disabled identity is a defensible bounded design choice, not an express blanket prohibition in the signed record. Retain it as the proposed first recovery boundary, identify what recovery actually does (for example, replacing an authenticator for an otherwise eligible active principal), and route disabled/departed access through the separately approved replacement path. A restoration path cannot remain only a name if recovery is being implemented.

Make disable/departure invalidate all council sessions, pending authentication/enrollment artifacts, effective grants and unfinished approvals that require that actor's continuing authority. Define the transaction ordering against already authorized work. Current D02 disable sets the user inactive and removes sessions/tokens but does not mark context grants revoked; account for that in migration rather than claiming current grant tombstones already exist.

### 4. Bind approval and execution with enforceable semantics

The draft lists correct hazards but leaves critical choices optional. For the first workflow that executes approved authority changes, settle:

- Exact action type, council, subject, before/after version, scope, payload digest, required council/operator approvers and validity interval; changing any material field creates a new approval request.
- Approval actor still active, appropriately scoped and independent at execution; unresolved independence fails closed. Do not weaken this to N3's “if identity is established.” Use council-local verification evidence for council actors and operator evidence for operators; do not build cross-council person discovery to enforce independence.
- Revocation and permission/delegation loss between approval and execution invalidate the request. Adopt the proposed safe default explicitly for the chosen slice. Revalidate under a defined locking/serialization boundary, rather than check then act in separate unprotected steps.
- Concurrent execution has one effective commit; duplicate execution cannot apply twice. A read-only receipt for an already committed result may be permitted if authorized and secret-free; distinguish that from reusing approval for a new effect.
- For database authority changes, commit authorization state and attributable evidence atomically. For external effects, stage them without granting access, then activate only after required effects are confirmed. The current “or recovery plan ... contains partial state” wording must not become an exception permitting partial unapproved authority. Describe failed/uncertain reconciliation and preserve revocations.

These are engineering decisions. Product/customer input is needed for policy classification, authorized people and evidence standards, not to choose every transaction mechanism. Exact initial action classification is needed only before that action becomes executable.

### 5. Keep the broker boundary concrete

`infrastructure/f06/configure-control-login.py` confirms BYPASSRLS, table reads, session writes, both application-role memberships and privileged helper execution. Stating that RLS negatives do not constrain this broker is correct. The next slice must also name which components are trusted to assert council/principal context, which database roles/functions may write authority, and which paths can impersonate an approved actor. Arbitrary caller-supplied actor IDs or transaction settings cannot constitute council approval evidence.

Add Q08's dedicated council runtime/data/credential separation as an explicit future design constraint; the current draft mainly references it as a dependency. No present design can claim compromised-runtime council isolation until that boundary is separately implemented and evidenced. A bounded synthetic application-level slice can proceed with this residual trust stated. No production isolation, provider non-access or Q12 assessor equivalence follows.

### 6. Preserve the D03 read/write distinction in the Q06 interface

Line 108's general “effective capability ... only when ... current/true” needs an explicit exception for D03 retained request/audit review by already authorized operational actors. Otherwise a literal implementation could disable retained review when commercial or activation state is false. Separate operational writes/active lookups from retained review permissions. Define the state transition that prevents an old council activation from silently taking effect when the ceiling is restored; a boolean AND expression alone cannot provide that behavior. This is a prerequisite to Q06 implementation, not to the narrower principal-ownership slice.

## Negative-case sufficiency

N1–N15 are a useful review envelope, but are not a complete acceptance contract. Add these concrete cases to the relevant slices:

1. Same email/upstream subject in two councils, different credentials/MFA/status; wrong council audience, cookie, session, callback or fallback path; A disable leaves B's independent access unchanged; no cross-council account-existence disclosure.
2. Existing shared-service principal with Alpha and Beta grants; ownership migration cannot preserve both authorizations or silently clone credentials/grants. Old Beta records remain attributable and do not become visible to the retained Alpha identity.
3. Same council, dispatcher in context X and supervisor/officer in Y; no user-level role bleed. An admin permission cannot unlock retained records or be disabled merely by an operational pack change.
4. Approver/subject or custodian/admin represented by different credentials for one person, missing independence evidence, delegation expiry/revocation, and actor permission loss between approval and execution. Include an elevation subject approving a request proposed by another person.
5. Concurrent disable, grant revocation, login, approval, execution and repeated execution; authoritative state and audit remain consistent. Include current D02 disabled users whose legacy grant rows are still present.
6. Lost/compromised custodian and both admins unavailable; no bootstrap/operator bypass. Positive cases must also show valid central/delegated routine work and correctly approved execution; universal denial is not successful implementation.
7. Restore a checkpoint predating revocation; service admission remains blocked until a trustworthy later revocation record is reconciled. An application assertion alone cannot discover revocations deleted by whole-database restore. Define the recovery evidence source or accept fail-closed recovery.

Existing N11 app-role SQL checks must retain their stated limited claim. Add explicit review/evidence for runtime, security-definer functions, deployment and database-owner paths; do not turn them into an unsupported guarantee against a compromised host.

## Recommended first bounded slice

**Select council-principal ownership and enforcement for existing synthetic identities, before adding council administration powers.** This is an implementable engineering slice once its short compatibility addendum is accepted. It does not require actual council contacts, an IdP purchase, delegation qualification, recovery exceptions or the entire high-impact catalogue.

Its contract should provide an explicit synthetic ownership manifest; make council ownership immutable; reject new cross-council grants and mismatched session/context resolution; retire the documented shared-principal fixture access under Q02 while preserving history; and ensure all existing entry points, including D02, honor that ownership. It must name the treatment of old sessions and ambiguous/multiple-council principals. Fail closed on unclassified principals rather than silently choosing an owner. It can preserve existing unique synthetic emails for this slice while clearly deferring council-qualified duplicate-email enrollment; it must not claim full Q02/Q03 sign-in completion until that later work exists.

For the known test fixture, a concrete proposed manifest entry is to retain `00000000-0000-4000-8000-000000000006` (`shared@alpha.example`) as one Alpha principal, retain its Alpha authorization, and retire its Beta binding authority. This is an explicit synthetic migration decision, not a general ownership algorithm based on email/home fields. Preserve any Beta records' original actor attribution without granting that retained Alpha principal access to them. In the revised test, adding the Alpha officer's Beta grant must be rejected. No replacement Beta identity or grant is required for this first slice; a later positively tested two-council scenario must use two independently enrolled principals. Existing shared-principal test success expectations are superseded by signed Q02.

Acceptance checks for that slice, to be run only during an authorized implementation phase:

- Alpha's retained first-admin remains usable for its approved profile/context; Beta's disabled admin remains inactive with no sessions/tokens or restored grants. D02 token lifetime, one-use, reissue, exact binding and no plaintext receipt replay stay intact.
- Every accepted principal/session/grant resolves to exactly its manifest council. Attempts to introduce a different-council grant or use another council's context/session fail at the new authoritative boundary, including direct restricted-role/helper paths.
- Shared-service authority no longer crosses councils through one principal; historical records, actor IDs, binding IDs and audit remain unchanged. No new identity, credential copy, operational grant or admin permission appears automatically.
- Existing same-council context behavior and D03 retained review, assignment limits, write/disable ordering and ADMIN exclusion remain intact. Context-specific role sets remain explicitly deferred.
- Migration and rerun are deterministic, record incompatibilities and do not widen authority. Old code cannot resume with a pre-migration permissive model; rollback is a compatible forward repair or admission stays closed. Recovery cannot restore superseded cross-council grants or revoked sessions.

If preserving a working shared-service scenario is required, the separate Beta principal, enrollment and explicit grants require a further bounded contract; do not smuggle them into the ownership migration. The signed Q02 choice already resolves whether one principal may span councils, so that direction does not need to be reopened.

**Recommended status:** owner directions preserved; targeted contract revisions required; first principal-ownership slice selected for a concrete migration/acceptance addendum; new council authority implementation not yet approved by this review; unrelated bounded development continues.
