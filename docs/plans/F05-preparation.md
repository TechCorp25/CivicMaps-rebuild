# F05 — Isolated municipality data resources: implementation brief

Prepared on 14 October 2026 from main `04eab124f71af302ceefcc9359faa277d6fd693e`, the verified merge of [PR #10](https://github.com/TechCorp25/CivicMaps-rebuild/pull/10), including assessed UI corrections `c944b4366b6866fa24fdaf25399c2596f9da8b18`. F04 acceptance is in [its evidence](evidence/F04.md). This is preparation, not implementation or provisioning evidence.

## Single-feature goal

Provision and recover two disposable municipality data sandboxes through the existing durable job adapter. Each has a versioned database schema, least-privilege runtime credentials and an evidence-storage namespace whose access boundary is independently tested. See the [feature card](civicmaps-platform-assessment-and-autonomous-plan.md#f05--provision-isolated-municipality-data-resources) and [ledger](civicmaps-feature-ledger.json).

F05 supplies data resources for later CommandMAPS, EnforcementMAPS and public portal services. Service deployment/routing is F06; admin activation is F07. Resource completion must not mark a municipality Active or claim those services are usable.

## D01 inputs before resource implementation

No selected provider or approved isolation profile was found in the repository or retrieved project memory. Record the owner's selected values here before provider-dependent implementation. Adapter contracts and local synthetic proofs may proceed while these inputs are pending, as allowed by the established plan.

| Input | Concrete proposal for review | Current status |
| --- | --- | --- |
| Data isolation | One PostgreSQL database and unique runtime login per sandbox, separate from the control-plane database; independently authorised object namespace per sandbox | Proposed, not selected; a shared cluster is not dedicated-compute isolation |
| Execution target | Choose explicitly between a session-local disposable development profile and a named cloud sandbox account/project with authorised provisioning access | Unresolved; installed connectors do not select a provider |
| Residency | For cloud: exact allowed region and data-residency requirements. For local: synthetic fixtures only and no production claim | Unresolved |
| Budget and capacity | Two acceptance sandboxes; record resource sizes, maximum spend and expiry before creating cloud resources | Unresolved; no paid resources authorised by this brief |
| Retention and cleanup | Preserve populated resources; explicitly inventory and clean only owned, tagged, empty disposable test resources; choose retention/expiry for the selected target | Cleanup boundary defined; target retention unresolved |
| Credential storage | Use the selected environment's secret facility; registry holds references, never plaintext credentials | Facility follows target decision; do not send secrets through chat |
| Hostnames | Remain deferred to F06; no DNS/public ingress in F05 | Not a blocker for this feature |

A local development profile, if selected, must use real isolated database credentials and real enforced storage access for its proof. A simulator alone cannot close F05's isolation acceptance. A cloud implementation requires proof against the selected provider; local proof cannot be relabelled as cloud evidence.

## Targeted build checkpoints

1. **Resolve the resource contract.** Record D01 values, resource ownership labels and runtime/provisioner roles. Inspect affected module READMEs and the installed PostgreSQL/provider versions through Context7. Define a small adapter contract for inspect/reconcile/apply with stable municipality/job/step keys and safe resource identifiers. Reuse F04's queue, retry budget and lease fencing; do not add a workflow framework.
2. **Develop persistence and migrations.** Add the next ordered migration (007 if still next on main); do not rewrite applied 006. Persist adapter/profile identity, resource inventory, schema version and secret references. Existing jobs are constrained to the synthetic adapter, two named steps and synthetic resource IDs: explicitly evolve those constraints and worker validation without reinterpreting completed synthetic jobs or automatically creating resources for historical councils. Preserve F03 context/RLS and immutable operational provenance; a municipality does not permanently imply a one-to-one tenant/organisation mapping.
3. **Build resource creation and recovery.** Create the selected data boundary, runtime login and storage namespace using scoped provisioner credentials. Runtime credentials cannot create databases/roles, assume privileged roles, read control-plane data or access another sandbox. PostgreSQL database creation is outside a transaction: reconcile durable ownership and existence after each partial effect. Use stable IDs and narrowly scoped grants; revoke inappropriate default/public access. Apply data-plane migrations through a versioned entrypoint without copying control-plane tables or bootstrap owner grants into council runtimes. Persist secret references safely and recover credential issuance failures without printing credentials.
4. **Integrate with provisioning.** Bind resource inventory to municipality, job, selected profile and existing permitted data-plane context. Validate identifiers before opening a resource connection; do not accept browser-supplied DSNs, credentials or storage endpoints. Exercise the same backend resource resolver/access path that subsequent services will consume, rather than a test-only bypass. Preserve synthetic mode and existing fixtures. Show safe resource/schema readiness and recoverable errors in job detail if needed; no secret values or invented live-service health. Handle long provider calls within an explicit timeout/lease strategy; stale workers cannot publish success and repeated calls cannot duplicate resources.
5. **Test the feature against its boundary.** Execute the acceptance matrix below using distinct Alpha/Beta credentials, real selected-target resources and disposable fixtures. Test crashes before and after external effects, failed migrations and connection reuse. Run focused checks, then full lint/format/typecheck/build/integration and Platform/CommandMAPS browser regression. Add repeatable CI coverage with honest separation between simulator/local tests and provider acceptance evidence. No production or citizen data.
6. **Publish and hand off.** Write `docs/plans/evidence/F05.md` with exact source SHA, target/profile, resource inventory, commands/results, limitations, upgrade and rollback results. Update ledger, commit, push this feature branch and verify remote SHA; retain one focused draft PR for owner review. Record completion and separate gotchas in Empirical with agent authorship. Mark review_ready only after actual F05 acceptance, publication and memory update; owner merge alone establishes merged. F06 remains next, not concurrent work.

## Acceptance matrix

| Scenario | Required outcome |
| --- | --- |
| Alpha/Beta creation and duplicate requests | Exactly the intended owned resources; stable inventory and no duplicate credentials/namespaces on retry |
| Runtime database isolation | Authenticate with each real runtime login: own data works; other sandbox/control-plane connections, reads/writes, role escalation and schema creation outside permitted scope fail |
| Backend access isolation | Forged municipality/resource/context and swapped Alpha/Beta credentials fail through the actual resource access integration; pooled connection reuse does not retain another scope |
| Object isolation | Own namespace operations work; other namespace list/read/write/delete and forged keys fail under the storage service's authorisation, not just a UI filter |
| Partial create and credential failure | Durable recoverable job; no leaked credentials, false success or unowned duplicate resource; reconcile finds only verified owned resources |
| Crash after effect before checkpoint | Restart recovers the same resource IDs; old lease completion is rejected; attempt budget remains bounded |
| Migration replay and upgrade | Repeated provisioning/migration retains inserted sample data and grants; failure leaves a diagnosable version and safe retry path |
| Existing synthetic history | Migration/seed preserve jobs, audit, passwords, captures and bindings; no automatic promotion or provision of historical rows |
| UI and audit | Resource/job identifiers traceable without secrets; navigation, same-state poll recovery and retry/reconcile regressions remain passing |
| Cleanup and rollback | Exact owned resource inventory; populated/foreign/untagged resources retained; access can be disabled without deleting data |

Test database authentication from independent connections using actual restricted credentials. Existing local owner connections with `SET ROLE`, API-only tests and synthetic effect rows do not establish F05's resource boundary. For storage, a namespace prefix alone is not access control. Document provider-administrator powers separately from the runtime threat boundary.

## Validation, interruption and rollback

After dependencies are installed, use `npm run check`, `npm run test:platform:browser` and the CommandMAPS disposable browser harness. Add a focused resource test command appropriate to the chosen adapter. Record target-specific migration/authentication/storage checks and resource cleanup. Keep tokens unchanged and use language-appropriate why-comments for non-obvious ownership, transaction and retry rules.

At interruption record feature/branch/HEAD, dirty paths, selected D01 values, owned resource IDs (no secrets), completed matrix rows, failing command and exact next action. Resume on this branch. Unresolved D01 means F05 remains planned with an explicit implementation prerequisite, not review_ready; contract preparation is still useful work.

Rollback pauses new provisioning and recovery mutations, retains job/checkpoint history and populated resources, and revokes runtime access where required. Revert compatible application code only after checking schema compatibility. Do not drop databases, storage or secrets by inferred name/prefix or rewrite applied migrations; prove ownership and emptiness before test cleanup.

## Carry-forward gotchas

- F04's lease fence protects checkpoints, not external effects: reconcile each attempt with stable resource ownership/idempotency keys, including creation before checkpoint.
- F03's SQL boundary needs complete matching context, binding and effective grant. Keep direct SQL negative tests independent of HTTP tests.
- Import worker/database modules after disposable environment setup; the module caches its pool. Use one environment per process and `CIVICMAPS_DATABASE_URL`, not generic `DATABASE_URL`.
- Run fixed-port browser harnesses sequentially; Platform Vite may take port 5173 even when configured with port 0. Await reconcile's queued response before synchronous worker subprocesses.
- Keep F04's late-response navigation and failed-poll/same-state recovery regressions. One effect owns detail reads; route/session changes invalidate old completions.
