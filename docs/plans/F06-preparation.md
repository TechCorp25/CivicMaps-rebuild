# F06 — Municipality service routing: preparation scope

Prepared 16 October 2026 from reviewed main `4bedee8d9770c922775128a89f3b8cb4fee5461d`. GitHub confirms owner merge of [PR #12](https://github.com/TechCorp25/CivicMaps-rebuild/pull/12), including F05 head `9a813526111f5e5b234066d121afcd6e8ad86a79`. This is planning only; F06 acceptance remains unexecuted.

## Outcome

A registered development municipality has verified HTTPS service destinations that resolve to its authorised operating context and F05 resources. Alpha and Beta must remain isolated through ingress, authentication, context selection and resource access. Route readiness is separate from municipality Active status and first-admin activation.

The [feature card](civicmaps-platform-assessment-and-autonomous-plan.md#f06--municipality-service-routing) governs this scope. Reuse F03 context authorisation, F04 durable recovery and [F05 resource ownership](../development/data-resources.md).

## Recorded D01 selections and remaining provider verification

The approved [naming decision](../civicmaps-naming-pack/CIVIC-MAPS-PLATFORM-NAMING-DECISION.md), [Expo/EAS standard](../civicmaps-naming-pack/EXPO-EAS-IDENTITY-STANDARD.md) and [identity manifest](../civicmaps-naming-pack/civic-maps-identity.manifest.json) already establish product identity. Use `commandmaps` and `enforcementmaps` as the recommended URL-safe product tokens; `emaps` remains the officer Expo slug/deep-link scheme. Do not reopen these names or use the rejected `cmaps` shorthand.

The owner controls `civicmaps.com.au`, with parent DNS at VentraIP. Development DNS is delegated to Route 53 zone `Z01841903TEW783OZ3RC` for `dev.civicmaps.com.au`; public NS/SOA verification passed on 16 October 2026. The concrete hostname contract is in the [development naming standard](../civicmaps-naming-pack/DEVELOPMENT-HOSTNAMING-STANDARD.md). Platform: `platform.dev.civicmaps.com.au`; acceptance councils: `alpha-commandmaps.dev.civicmaps.com.au` and `beta-commandmaps.dev.civicmaps.com.au`. Legacy `.gov.au` references are wireframe placeholders for this build.

The F06 build will use a separate Sydney EC2 development runtime, loopback-only API/control database and Caddy HTTPS ingress with automatic ACME certificates. One explicit hostname allowlist serves the implemented Platform and CommandMAPS builds. The API accepts only the loopback ingress with a private deployment token, validates the original authority and binds sessions to the exact route/version. Cost and actual provider support must be verified before provisioning. This single-instance development target has no production availability claim.

AWS project 597663815195, profile CivicMAPS and Sydney ap-southeast-2 remain the selected resource target. The existing US$50/month budget covers total development spend, not a fresh allowance for F06. Price incremental runtime, ingress, certificates, DNS and logs against retained F05 costs before provisioning. The US$15 initial F05 acceptance allocation is not automatically renewed. Preserve populated resources; the 21 October review date is not automatic deletion authority. The DNS hosted zone is already created and delegated; service deployment remains F06 build work.

## Included deliverables

1. Apply the development naming standard's municipality-token mapping: direct slugs up to 47 characters excluding the reserved `id-` prefix; otherwise the full immutable UUID-derived token. Preserve existing registry identities and reject conflicting ownership. Versioned, explicitly owned route manifest: canonical hostname, service kind, municipality, immutable authorised context version, resource/job references, deployment target, desired/observed state and sanitised probe result. Unique host ownership and stale-write protection; migrations preserve existing resources, grants and jobs. A route cannot create grants or silently rebind a context.
2. Trusted request resolution before login and operational access. Exact canonical host allowlist; reject malformed, ambiguous, unknown and mismatched authority. Define handling of ports, case and trailing dots. Accept forwarded authority only from the configured ingress after it strips client-supplied forwarding headers. No blanket Express trust-proxy setting. Direct-origin bypass must be denied.
3. Municipality-bound authentication and sessions: host selection must agree with the authenticated permitted context. Reject copied Alpha credentials/session tokens on Beta before operational access. Use secure host-only cookies in HTTPS deployment, scoped origins/CSRF and safe redirects. Keep platform identity separate; never put credentials in URLs, route manifests or health output. Explicit local test configuration must not weaken deployed defaults.
4. One selected TLS/ingress adapter and minimum runnable service deployment needed to prove routing. Reconcile existing owned routes/certificates on retry; persist failure and recovery. Reuse durable worker fencing where external effects are performed. Do not deploy scaffold apps as functioning services or migrate historical operational data as part of routing.
5. Readiness gate: verify current resource binding, successful F05 provisioning, enabled resource access, valid TLS, matching service/context and successful end-to-end probe. Define bounded probe timeout/freshness during implementation; fail closed on stale, failed or mismatched results. Show distinct pending, ready and failed routing status with safe operator recovery. Successful routing does not activate an administrator or council.
6. Withdrawal and rollback: disable ingress and backend route resolution, reject old route-bound sessions, preserve databases, objects, jobs and audit. Restore only after matching ownership, binding and readiness checks.

## Acceptance matrix

| Scenario | Required proof |
| --- | --- |
| Alpha/Beta success | Each approved HTTPS hostname reaches its expected service and authorised resource; distinct synthetic records remain distinct. |
| Hostname boundaries | Slug lengths 47/48/51/52/63 fit all product labels; same-prefix long slugs and reserved-prefix slugs cannot collide; mapping is repeatable; invalid identity and conflicting ownership fail closed; existing registry records remain unchanged. |
| Authority spoofing | Unknown/malformed/duplicate Host, conflicting forwarded values, untrusted proxy and direct-origin access fail closed before authentication or data access. |
| Credential isolation | Alpha login on Beta, copied session cookie, forged context and cross-origin request fail; browser cookies never use a shared parent-domain scope. |
| Readiness | Queued/failed F05 job, missing/disabled binding, unhealthy service, expired/stale probe and invalid TLS never expose a ready route. |
| Recovery | Duplicate apply, crash after external effect, stale worker and partial DNS/TLS failure reconcile the same owned mapping without claiming success. |
| Changes and rollback | Conflicting host ownership and stale manifest update fail; withdrawal blocks existing sessions; re-enable rechecks readiness and preserves records. |
| Regression | Historical migration/replay, existing platform registration/provisioning, context isolation and both application browser suites continue to pass. |

Local HTTP header tests and simulated ingress exercise contracts only. F06 live acceptance requires actual approved HTTPS endpoints, external DNS/TLS checks and browser/request probes through the selected ingress. Record planned, simulated and live evidence separately. Test issued-cookie flags and server-side rejection of manually copied cookies independently.

## Sequential build and publication

1. Use the recorded domain, municipality-token mapping and EC2/Caddy runtime selections; verify incremental cost fit and actual provider support before provisioning; retrieve relevant AWS toolkit skills and verify identity, selected Region, plan state and live MCP before provider changes. Carry forward the existing Medium guidance preference.
2. Develop manifest migration and failing host/session isolation scenarios; implement request resolution and the selected adapter only for F06.
3. Integrate existing worker, resource resolver and operator routing status; build both implemented web apps.
4. Run focused tests, `npm run check`, both disposable browser suites sequentially, then live Alpha/Beta ingress and rollback acceptance. Inspect screenshots for visual changes and final CI.
5. Record exact source SHA, commands, host/resource inventory without secrets, results, limitations and rollback in `docs/plans/evidence/F06.md`. Commit, push and verify remote SHA; update Empirical and maintain a focused draft PR. Mark review_ready only after acceptance, publication and memory recording; owner decides merge.

## Explicit boundaries and handoff

F07 owns first-admin activation/recovery; F08 owns pack enforcement; F09 owns general municipality suspension; later features own operational rollout, public reporting and payments. F06 does not broaden F05's privileged broker into a claimed production isolation boundary. The current API's local health response and global development origin list are not deployed municipality readiness evidence.

At interruption record branch/HEAD, manifest ownership, exact provider effects, completed matrix rows and next action. Keep one implementation feature in progress. Preparation alone leaves F06 planned. Next action: verify cost fit and provider support for the recorded hostname/ingress selections, then execute this single-feature develop → build → integrate → test → push workflow. The separate F06 build must adopt this revised naming contract and prove its boundary cases before acceptance.
