# Dispatch release closure — merged PRs #26 and #27

**Release:** deployed and verified on 20 October 2026, 21:20 AEDT (Australia/Melbourne).
**Source:** `313d9a3fc5b2f66819bfaa52019600c3e167eda7`, owner-merged PR #27, including PR #26. Closure documentation publication is a separate draft PR; no merge or auto-merge was performed.

## Source and artifact

Exact source main CI runs [39209764387](https://github.com/TechCorp25/CivicMaps-rebuild/actions/runs/39209764387) and [39406259477](https://github.com/TechCorp25/CivicMaps-rebuild/actions/runs/39406259477) passed. Local exact-lock dependency installation, both application type checks and production builds passed with Node 24.19.0 / npm 11.9.0. Artifact contains the Git source archive plus both built applications and the deployed revision marker.

- Archive SHA256: `f65bd29dc274aebe409eaea29df57721a471a5fe06ac1a5bd252ba9c7a39d529`; 13672279 bytes.
- Existing bucket: `civicmaps-f05-development-storage-iq7jtwcoip2y`.
- Key: `f06/releases/313d9a3fc5b2f66819bfaa52019600c3e167eda7.tar.gz`.
- Object version: `sXqISOCRpmcjl.bFcVhXTFPI7EjquyJv`; SSE-S3 encryption; conditional upload prevented replacement.
- Retained instance: `i-0bbfbcd2d870cce97`, project `597663815195`, selected Region `ap-southeast-2`.

## Deployment and preservation

Successful SSM commands:

- Deployment: `30aeabb0-8557-4f04-b00d-bbc7431e71e1`.
- Installed files and staff API acceptance: `aeb48e3f-b9cd-4112-a7d1-7e8563774a64`.
- Final administrator, routes, migration and TLS check: `258ff405-8beb-4c43-8717-b7ca75abfba3`.

Previous deployed source was `b21e764ad1151aa3e4dce6f91f29f24f69b31916` (F08). API, migration, infrastructure and dependency sources were verified identical before mutation. The existing release procedure was adapted for this UI-only update to assert migration 013 rather than invoke migrations. No migration, seed, bootstrap, password reset, grant expansion or provisioning replay ran; no infrastructure or DNS was created.

Routing, ingress and API stopped before the private preservation baseline. A private database/roles backup was taken and successfully restored into a unique disposable database, then that database was dropped. Across the application switch, all 31 public table projections, six sequences and four private configuration files matched exactly. This comparison occurred while services were stopped; normal sessions and routing leases subsequently resume changing. All 59 installed source/build hashes matched the release manifest.

Private checkpoint: `/var/lib/pgsql/f06q-backups/20261020T102043Z-313d9a3fc5b2`.
Previous compatible application: `/opt/civicmaps-releases/previous-20261020T102043Z-313d9a3fc5b2`.

The release procedure retained automatic application recovery to F08 on failure; it was not invoked because deployment succeeded. Do not roll back to F07 after migration 013. Retain private checkpoints/resources through the existing owner-approved retention period; this release does not extend that decision.

## Live acceptance

Authenticated private ingress recovered before routing resumed. PostgreSQL, API, ingress and routing were active. Public TLS health passed for Platform, Alpha and Beta. All routes remained ready. Migration 013 exists exactly once; no `f06q_restore_*` database remained. Alpha administrator is Activated/active; Beta is Disabled/inactive with zero sessions.

Existing Alpha dispatcher, officer and supervisor logins passed HTTPS API session/context/entitlement/request-read checks, with Alpha-only context. Completed verification sessions were signed out. Live Chromium with TLS verification enabled confirmed loaded operational UI, department/role header identity, dispatcher composer review/edit preservation, narrow officer layout and supervisor absence of request creation. No requests were created or changed during this release smoke test.

Live screenshots: [dispatcher review](dispatch-release/live-dispatch-review.png), [narrow officer](dispatch-release/live-officer.png), [supervisor](dispatch-release/live-supervisor.png). [Browser receipt](dispatch-release/browser-results.json).

## Limits and test corrections

The live checks are a bounded release smoke test. They do not repeat the entire local F11E failure/concurrency suite or claim owner manual acceptance. Existing source CI and feature evidence cover those scenarios. EnforcementMAPS remains a scaffold; dispatch is accessed through CommandMAPS. Latest-100 queue limits and existing server permissions remain unchanged. Governance work continues separately.

The browser harness needed an absolute URL correction and then browser-origin logout fetches because its standalone HTTP client could not reach the public endpoint. Corrected runs passed. Two aborted dispatcher test sessions were not logged out by those failed harness runs. The exact session exposed in a failed harness diagnostic was subsequently revoked through a narrowly scoped cleanup; the other remains subject to normal expiry. No owner sessions were revoked. The first final receipt used an incorrect restore database prefix; the final command listed above checked the actual `f06q_restore_*` namespace. No application fix or redeployment was needed.
