# Code21 department intake implementation status

Candidate work on `codex/dispatch-b0-revision-20261028`, based on the authoritative Revision 2 handoff at `651dae2b664533b48f2d73c3f7f62566a16b4b79`.

## Implemented in this candidate

- CommandMAPS reads receiving branches from `GET /api/intake-destinations`. The server filters to the actor's active, explicitly granted contexts within the same council and requires the receiving context's current `requests.create` capability.
- The composer renders distinct Parking, Animal Management, Local Laws Noise/Permits/Building, and Waste/Cleaning details. It preserves confirmed location and shared notes when the receiving branch changes, warns before clearing entered branch details, and clears fields from a Local Laws form when its request type changes.
- The API validates a versioned, closed department payload, rejects unsupported fields and schema versions, and enforces the owner-specified Parking and Animal Management minimums. Local Laws uses only the stated Noise, Permits and Building categories. Waste examples remain optional and non-exhaustive.
- Additive migration `016-department-aware-intake.sql` captures receiving and source context, package identity/version/details, and assignment outcome. Request creation and destination audit commit together under destination RLS. Existing untyped rows remain nullable and readable.
- Dispatchers can only route to same-council contexts for which they hold a current grant. Creation across council boundaries is rejected. The source branch cannot list or read a request captured in another branch; source and destination context IDs are recorded in the destination's creation audit event.
- The existing manual assignment endpoint now records reassignment from/to officer IDs and requires a reason when replacing an assignee. Department-aware requests do not expose or accept manual assignment until the server can validate actual service-area and signed-on duty eligibility.

## Explicitly blocked operational behavior

No authoritative service-area geometry/resolver, Code2 sign-on registry, duty freshness, service-type eligibility, or deterministic multiple-officer policy exists in this checkout. Therefore the candidate retains new requests as `RECEIVED` and `unassigned` with a visible exception. It does not auto-assign an officer, allow an unverified manual selection, or imply that a person is on duty because they have an account. Implementing the assignment path requires the owner-approved D-DUTY/D-ROUTING choices and their authoritative server feeds; it is not safe to infer these from the current roster.

Other open catalogue work includes council-owned Parking offence/vehicle reference data, Animal Management reason/type catalogues, further Local Laws categories, and the Waste/Cleaning service catalogue. Public/community intake remains out of scope and has no endpoint in this change. Handover after acknowledgement/attendance remains governed by the existing lifecycle boundary.

## Validation status

The pure intake schema tests are in `tests/requests/intake.test.mjs`; API tests were added for context isolation, capture provenance, unassigned behavior, and reassignment audit history. The browser suite was extended for the revised composer while historical lifecycle scenarios continue to use untyped synthetic rows.

On the final candidate, lint, Prettier verification, both app typechecks, both production builds, and `node --test tests/requests/intake.test.mjs` pass. `npm run check` cannot complete its PostgreSQL integration phase in this executor: PostgreSQL 15 binaries (`initdb`, `postgres`, `psql`) are absent, the default database connection returns `EPERM`, and Docker daemon access is denied. `npm run test:browser` is blocked when Chromium exits at launch with `Operation not permitted`, even after installing the Playwright browser under `/tmp`. Integration and browser results must be recorded on a runner with the repository's dedicated synthetic PostgreSQL setup and an executable browser.

This is a partial implementation candidate. It is not proof of automatic allocation, a completed Code21 workflow, production operation, or release acceptance.
