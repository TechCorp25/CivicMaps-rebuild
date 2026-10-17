# F06Q merged-source release closure — 17 October 2026

Agent: Codex. Planning PR #17, merged implementation PR #16. Execution uses the existing approved Sydney development runtime and private bucket; no new AWS resource or reseed.

## Source and preflight

- Deployed source: `3dfb0316fbe7885c55adbb1861ff58d199ca5810` (main merge of PR #16, includes both review corrections).
- Local clean-source `npm run check`: 67/67 tests; lint/format, typechecks and both builds pass. Both browser suites and actual Caddy ingress/client-isolation checks pass. Node24.19.0/npm11.9.0; dedicated PostgreSQL17 on loopback55432, disposable test databases only. Hosted source CI [39024650225](https://github.com/TechCorp25/CivicMaps-rebuild/actions/runs/39024650225) passed on PostgreSQL15.
- AWS identity project597663815195, selected Region `ap-southeast-2`; active Free plan, US$116.10 remaining credit. Cost Explorer estimated month-to-date net approximately US$0 after credits (not an assertion about gross or future usage).
- Runtime `i-0bbfbcd2d870cce97` running at13.239.75.155; privileged F05 runner remains stopped. Initial source8e91622, migrations001–011, three ready routes, zero restore leftovers,14GiB free. Private env files root-owned0600.

## Artifact and checkpoint

- Private object `f06/releases/3dfb0316fbe7885c55adbb1861ff58d199ca5810.tar.gz` in existing bucket `civicmaps-f05-development-storage-iq7jtwcoip2y`.
- SHA256 `61c37edbd79e8dc3e315b7e25e7fa9c9897b543b8c4868879d768aba322b98c4`;12,622,305bytes; S3 version `JKVtqsqVviCZSZPzVvsbVYB2SnzNvLOk`.
- `release-runtime.sh` staged/validated the artifact, restored the control dump through the merged `verify-backup.sh`, removed its owned disposable database, applied/replayed migrations without seeding, switched code and warmed authenticated ingress before starting routing.
- Private checkpoint `/var/lib/pgsql/f06q-backups/20261017T114841Z-3dfb0316fbe7`; prior code `/opt/civicmaps-releases/previous-20261017T114841Z-3dfb0316fbe7`.
- Exact pre/post release fingerprints match across11 control/session tables and all route identities/versions. Users6, council sessions8, Platform sessions2, municipalities9, bindings3, grants7, resources2 and jobs2 preserved. Private configuration checksums unchanged.

## Live checks

Authenticated SSM commands target only the retained development runtime:

| Command | Result |
| --- | --- |
| `208f1784-2da6-4788-91be-8a2a810065eb` | Read-only preflight passed |
| `1f3a77f5-acd2-4f50-9c80-f1fd35d35e93` | Controlled release succeeded; only npm notices/Caddy configuration warnings on stderr |
| `40727898-bb4c-4d2c-bcc6-0aed9ed88bcd` | Exact populated control/session/route preservation passed |
| `f75ada4a-ca41-4f42-9221-4cf06c4fedce` | Trusted public TLS on Alpha/Beta/Platform, real resources, cookie/context/origin denial, authority/SNI/backend denial, resource-disable/withdrawal and real worker-crash reconciliation passed |
| `64435f29-1a85-48b2-9b55-b620791e86a7` | Transient fail-closed recovery, finite three-claim exhaustion and audited authenticated Platform recovery passed |
| `99faf682-225a-4eb9-b36e-d3e150fdd90d` | All5,099 historical route events match the restored checkpoint; other historical audit tables unchanged |

Legacy counter cases0/1/3 and restore/assertion/interruption/creation-failure cleanup are proven by the existing local regressions; those failures were not injected into the live database. Browser flows ran locally against disposable data; the public live checks above used trusted TLS from the AWS runtime.

Retain existing resources, prior archives and private checkpoints for21October review under the saved US$50/month allocation. Single runtime and process-local throttling remain development limitations. F07 is separate; [D02 choices](../F07-D02-decisions.md) are approved.

Rollback/return command `7e97f126-566a-44af-b577-c29e9eafb041` succeeded with empty stderr: prior8e91622 served all three hosts; returned3dfb031 with migrations unchanged,11 table fingerprints, sessions, all route identities/versions and private configuration preserved. All four services active.

Final source/build verification `fae28e7e-b298-4238-a28c-09fe135a4ee2` matches the pinned source and built assets; archive checksum matches; all services active. This closes current-source F06Q release acceptance.
