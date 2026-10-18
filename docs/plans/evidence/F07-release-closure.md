# F07 merged-source release closure — 18 October 2026

Codex (agent). **F07 is deployed and its scoped live-release gate passed** on the retained synthetic Sydney runtime. Owner-approved fixtures use the existing Alpha/Beta test-council subdomains; no new DNS, certificate, compute or council resource was created. The subsequent [D03 decision](../F08-D03-decisions.md) is owner approved; F08 implementation follows.

## Source, artifact and environment

- Merged source `2b73318a57c97baecb52711beca401ed3a162339`, owner-merged PR #19. [Merged-source CI](https://github.com/TechCorp25/CivicMaps-rebuild/actions/runs/39070898955) passed; local clean setup/build and all 69 integration checks plus lint/format/types/builds passed as recorded in [preparation evidence](F07-release-preparation.md).
- Archive SHA256 `e8ef4c6f63c4e7a46e5d0202983093f05c0a8517783b9c9d96dc797584b69df1`, 12,647,361 bytes. Private object `f06/releases/2b73318a57c97baecb52711beca401ed3a162339.tar.gz`, version `twNYYUdH_IkBlRvyd9877RPq6v7CwsAO`, in the retained encrypted development bucket.
- Expected project identity and selected Region `ap-southeast-2` verified after reauthentication. Existing instance `i-0bbfbcd2d870cce97`, t3.micro, healthy; 14 GiB free. Active Free plan with US$115.64 credits. Estimated month-to-date charges excluding credits/refunds were US$3.5164251931 through 17 October (billing data may lag), within the saved US$50/month allocation.
- Previous deployed source was F06Q `3dfb031`. Private checkpoint `/var/lib/pgsql/f06q-backups/20261018T020216Z-2b73318a57c9`; prior code retained at `/opt/civicmaps-releases/previous-20261018T020216Z-2b73318a57c9`. Retention review remains 21 October; no cleanup or replacement environment was performed.

## Executed checks

| Check | Result / durable command receipt |
| --- | --- |
| Read-only runtime, source, migrations, routes, identities, permissions and capacity | Success: SSM `7d22c58b-2728-4b4f-99dc-9a56724c8100`; both test councils initially had no first-admin designation |
| Controlled release with private restore verification and additive migration012 | Success: SSM `88270149-fd45-4bbe-abf8-14c772f6036b`; ingress readiness before routing, pre-existing row projections across 14 tables and route ownership/version preserved; both private configuration checksums unchanged |
| Live TLS activation and least privilege | Success: SSM `a9ba611a-af03-460b-aec4-346a64778fbd`; verified operator issue/reissue, secret-free receipt replay, superseded/used-link rejection, wrong-route rejection, concurrent single winner, chosen-password sign-in/profile reload, explicit context discovery and operational/personnel/Platform denials |
| Cross-council/context isolation and revocation | Same successful command: copied cookie and wrong context denied; Beta administrator disabled, prior session and login denied and zero remaining Beta-admin sessions; both council services stay healthy |
| Compatible current-F07 recovery | Success: SSM `4d1e21a7-d427-4a58-add7-1b6fe008ecd9`; controlled service stop/start with ingress warm-up. All 16 post-activation table projections, route ownership, private configuration/credentials and existing Alpha ADMIN plus Alpha/Beta staff sessions preserved; Beta administrator remained disabled |
| Final deployed files, schema, fixture state and cleanup | Success: SSM `e153e4a8-64e8-4692-9100-0472e0e84007`; 85 installed runtime/test/maintenance/build files match the pinned archive; migration012 present; all four services active; zero leftover restore databases |

Pre/post upgrade comparison projects the original columns, so migration012's new nullable designation-link fields do not conceal or misreport changes to existing data. Test identities are additive and attributable. The only designation/activation changes were for the two owner-selected synthetic councils, with `f07_synthetic_designation_added` operator audit entries and the activation/disable audit. Existing structural bindings and resource ownership were retained.

## Test council outcome

| Council / route | Designation and explicit binding | Final state |
| --- | --- | --- |
| Alpha — `alpha-commandmaps.dev.civicmaps.com.au` | `admin@alpha.synthetic.example`, municipality `20000000-0000-4000-8000-000000000001`, binding `10000000-0000-4000-8000-000000000001` | Activated ADMIN retained and usable; own profile/session/context only |
| Beta — `beta-commandmaps.dev.civicmaps.com.au` | `admin@beta.synthetic.example`, municipality `20000000-0000-4000-8000-000000000002`, binding `10000000-0000-4000-8000-000000000002` | Administrator permanently disabled, inactive identity and sessions revoked; council service/resources retained |

The existing authenticated `operator@platform.example` issued the synthetic links. Delivery and redemption used a controlled TLS test harness which held bearer values only in memory. This proves the approved synthetic development workflow, not external email delivery or production identity verification. Alpha's generated password remains solely in a root-owned mode0600 private file on the retained runtime; Beta's saved test password was removed. No password/token/cookie is stored in repository evidence or Empirical.

## Coverage limits and recovery

The deployed API flow was exercised over real TLS. Browser UI flows remain covered by the pinned source's three hosted/disposable browser suites; no new live-browser screenshot is claimed. True 24-hour expiry and login-row-lock timing retain their disposable-test evidence rather than being relabelled as live tests. Concurrent redemption was additionally exercised live.

Recovery was verified with compatible F07 code and retained migration012/data/audit. The older F06Q code was not reactivated after F07 identities existed; its compatibility is not assumed. Prefer a corrective forward release, keep affected access closed during repair, and never run a destructive down-migration, old unconditional bootstrap or routine restore over populated control data.

F08 entitlements, further branch workflows, municipality suspension, production identity/email and new infrastructure remain outside this release. The owner subsequently approved [D03](../F08-D03-decisions.md) for the separate F08 implementation. Publication CI/review for the evidence update is recorded separately in PR #20 and Empirical.
