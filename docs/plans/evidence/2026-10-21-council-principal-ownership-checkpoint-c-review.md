# Checkpoint C review packet — synthetic council-principal ownership

Prepared 21 October 2026 (Australia/Melbourne). This packet is an evidence index for an independent implementation audit. It is not an approval, security certification, production-readiness finding, customer acceptance, or authorization to deploy migrations 014/015.

## Frozen source and scope

- Governance PR: [#25](https://github.com/TechCorp25/CivicMaps-rebuild/pull/25), open and draft at packet preparation.
- Exact published governance review head: `2e72476fe78b5ac070da0da6f4e111d504869e6d`.
- Integrated owner-merged main: `1e658fd8b7f725148640d6ed68e81e3f9b2eaed3`, an ancestor of the review head. Main includes PR #30.
- Review tree: `9abecd45fff97c01f34d8b351b1a1eb466f3ec75`.
- Relevant executable code, migrations and tests match the implementation-tested source `22356fbde0a3073f8767fb4acc3b9c6c3f4d0696`; subsequent changes to the reviewed implementation are documentation/inventory only. The later sync merged reviewed main normally and did not change the ownership implementation. Verify changed-file ancestry and exact refs at review time.
- Goal: assess the bounded synthetic council-principal owner/session/context/grant slice against the committed scope, signed directions, binding prior design-review corrections, source and recorded evidence.
- No staff self-administration, general delegation, duplicate-email sign-in, SSO/MFA provider, recovery workflow, customer identity migration, production isolation, or production acceptance is claimed.

## Approved design directions applied and limits

The controlling signed owner decision assessment is [here](2026-10-19-signed-owner-decisions-assessment.md), with the executed runsheet in `owner-review/`. Relevant selections include Q1 B+C, Q2 C+A, Q3 A, Q4 C+A, Q5 C+A and Q7 A+C. Q2 requires council-independent identities/sessions and explicit per-context grants; Q3 prefers council SSO with governed MFA fallback; Q4/Q5/Q7 describe future administration and privileged-operation boundaries, not powers delivered by this slice. See the complete assessment for all twelve directions and conditions. Design direction does not approve production, customer acceptance, procurement/spend, live privileged access, statutory disposal or F09 suspension.

The first-slice contract is `2026-10-19-council-principal-ownership-first-slice.md`. It limits ownership derivation to explicit synthetic fixtures and the existing verified D02 first-admin binding. It retains Alpha's usable administrator and Beta's disabled/inactive administrator with no sessions/tokens; the disabled admin's grant row may remain unrevoked but is ineffective. Existing operational `ADMIN` remains excluded from request, officer and resource operations.

## Binding corrections from prior Astra design reviews

- Full records: `2026-10-19-q01-q05-astra-review.md`, `2026-10-19-q01-q05-astra-review-assessment.md`, `2026-10-19-q01-q05-astra-second-review.md`, and `2026-10-19-q01-q05-astra-second-review-assessment.md`.
- Preflight and conversion must be transactional; do not infer customer ownership from email/home/context. Close API admission before migration because the advisory migration lock alone does not stop application writes.
- Keep 014 staged and 015 enforcing; explicitly verify all principals, grants, sessions, D02 rows and known legacy mismatch before commit. Unknown or contradictory state aborts the entire migration.
- Retire only the reviewed Alpha principal's canonical Beta grant/session mismatch, retaining grant history. Preserve the D02 transition and assign the exact principal owner within the same transaction.
- Keep `(user_id,binding_id)` grant identity and append-only context-change history. App/runtime grant writes stay denied. An explicit revocation does not rewrite the grant pair.
- Preserve inactive Beta admin and retained grant row; do not label it revoked or reactivate it. Re-seed must not recreate revoked grants or alter activated/disabled state.
- Session owner is immutable; only explicitly mapped valid sessions can be retained. Wrong-route, mismatched, disabled or unbound sessions deny. Reused cookie jars must not revoke unrelated principals.
- Current email uniqueness is case-sensitive in storage while login normalizes input. This slice retains unique synthetic emails and does not implement duplicate identifiers or council-audience lookup.
- Disclose database owner, DDL/migration, host and `BYPASSRLS` runtime trust. The synthetic slice is not production isolation.

## Changed implementation and interfaces

The exact PR file list is available through PR #25. Ownership-relevant files include:

- `data/fixtures/council-principal-ownership.json`, `data/fixtures/operating-contexts.json` — explicit fixture owners and removal of the Alpha principal's Beta membership.
- `services/api/migrations/014-council-principal-ownership.sql`, `015-enforce-principal-ownership.sql`, and `services/api/migrate.mjs` — staged schema, single-transaction manifest validation/backfill, exact known mismatch retirement, fail-closed enforcement, immutable owner/session rules and D02 activation wrapper.
- `services/api/seed.mjs` — owners precede grants; explicit conflict checks; no grant resurrection.
- `services/api/app.mjs`, `operating-context.mjs`, `routing.mjs`, `database.mjs` — owner-bound sessions, authenticated owner equality, council-limited context resolution and route enforcement, with transaction-local application roles.
- `tests/council-principal-ownership-migration.test.mjs`, `context-migration.test.mjs`, `context-rls.test.mjs`, `operating-context.test.mjs`, `admin-activation.test.mjs`, `admin-activation-upgrade.test.mjs`, `service-routing.test.mjs`, `service-routing-upgrade.test.mjs`, `foundation.test.mjs` — migration, denial, preservation, activation, DB-role and compatibility coverage.

Migration 014 is registered after 013. The runner applies it, validates the explicit synthetic profile and owner mappings, records the known grant/session correction and session owner backfill, then applies 015 in one transaction. No migration has been deployed to the retained live environment.

## Evidence map

Recorded exact implementation CI on `22356fbde0a3073f8767fb4acc3b9c6c3f4d0696`:

- Push workflow [39356835955](https://github.com/TechCorp25/CivicMaps-rebuild/actions/runs/39356835955).
- PR workflow [39356839347](https://github.com/TechCorp25/CivicMaps-rebuild/actions/runs/39356839347).
- Both records report `npm run check`, token verification, Caddy ingress/client isolation, Platform browser, CommandMAPS browser and first-admin activation passing. These are synthetic checks, not live deployment evidence.
- Follow-up documentation checkpoint at `ac4bb265ad978641d0308ec284aaf3f3b4415678` passed push run [39357306534](https://github.com/TechCorp25/CivicMaps-rebuild/actions/runs/39357306534) and PR run [39357311798](https://github.com/TechCorp25/CivicMaps-rebuild/actions/runs/39357311798).
- Governance/main-sync evidence at `2026-10-21-governance-main-sync.md` states latest sync checks were pending at publication. Check exact-head status separately; previous green runs are not new-head CI.

Coverage visible in committed tests includes: canonical legacy grant/session upgrade and preservation of `operating_context_changes`; rollback of migration marker/schema/grant on missing profile or fixture collision; atomic abort on unmapped principal; re-run migration/seed without reviving revocations; Alpha-only context success and Beta denial; Gamma synthetic owner/context positive; owner-mismatched grant denial; future/expired/revoked grant and binding denial; route mismatch denial; D02 activation owner equals exact municipality and is usable; disabled Beta admin remains inactive with no usable session/token and unchanged unrevoked grant; ADMIN operational and app-role restrictions; stored request/capture provenance remains unchanged through revocation/replacement.

The migration test's SQL-administrator setup and application-role tests are separate evidence. Review whether those roles model the intended runtime and state exactly what `BYPASSRLS` still permits. Test names/assertions should be inspected; this inventory is not a claim that every possible race, recovery path, role configuration, or production threat is covered.

## Failed checks and resolution history

The initial exact-head fresh-seed run failed because upgrade-test-only principal `...0099` was absent by design. Seed now tolerates absence only for explicitly declared `testPrincipals`; ordinary missing fixture owners still fail closed. Follow-up hosted runs exposed and corrected session-status handling, same-principal/council replacement behavior, context-owner validation, missing owner fields in resource fixtures, RLS transaction recovery after denied statements, and a browser fixture that reused one owner-bound session across parallel principals. These are recorded in `governance-workstream.md` and the checkpoint evidence. Review the changes against the tests and ensure the later `22356fb` runs actually cover them.

## Required independent audit questions

1. Can one principal acquire or use another council's session, selected context or active grant?
2. Are principal-owner writes restricted and immutable under intended app/database roles?
3. Does first-admin activation atomically create the exact authorized owner and grant, with failure rollback?
4. Does migration fail closed before partial unsafe conversion for unknown, contradictory or customer identities?
5. Can unknown/customer identities enter the synthetic fixture conversion path, or be guessed from email/home fields?
6. Are historical actor, request, grant, session and audit records preserved with accurate attribution?
7. Which revocation/recovery guarantees are directly supported by tests, and which are not implemented?
8. Does session replacement affect only the intended principal/council, including cookie-jar reuse and concurrent requests?
9. Are application authorization and database/role protections tested separately?
10. Are residual privileged runtime, database owner, DDL, migration, host and restore capabilities accurately disclosed?

Also verify that queue completeness remains distinct from scalable server-backed search/filter/page interaction, and that F-009 is per-process admission rather than global tenant fairness/capacity control.

## Provenance, limitations and pending work

Historical implementation records cite a pre-code contract hash `092c571acb6be63cc2d9f340180fca951b8bdb88964d4bfe077f60e8b9e03716`; a later scratch copy had a different hash, and the original bytes were unavailable at the recorded checkpoint. The committed review records also contain their own historical contract pins. This packet does not claim the replacement scratch file was reviewed. Base the new audit on committed requirements, signed directions and conditions, binding prior review corrections, actual source and reproducible evidence.

Not assessed or complete here: general council staff administration/delegation, branch role design, SSO/MFA/recovery implementation, customer identity migration, customer-specific legal applicability, retained-record export/holds/disposal operations, runtime/storage/key/support/deployment isolation, production acceptance and statutory compliance. CI is not production readiness or legal certification. Functional development proceeds separately; F-11 remains the active functional feature.

## Audit disposition record

Pending GPT-6 Astra Low's read-only review of the frozen implementation and evidence. Record outcome, exact source, severity and line evidence, affected acceptance criterion, required verification, limitations, and recommendation here after the initial report. Luna validates each finding before any code change. Material fixes require fresh applicable checks and follow-up Astra review. No production migration, deployment, PR merge or auto-merge is authorized by this packet.
