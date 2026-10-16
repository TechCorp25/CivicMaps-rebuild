# Development web naming — CIVIC MAPS

Recorded 16 October 2026 from owner-confirmed domain ownership and DNS delegation. Extends the approved product naming package; Expo/EAS identifiers are unchanged.

| Item | Naming contract |
| --- | --- |
| Owned domain | `civicmaps.com.au` |
| Parent DNS | VentraIP; retain apex website/email records |
| Development zone | `dev.civicmaps.com.au`, delegated to AWS Route 53 |
| Platform | `platform.dev.civicmaps.com.au` |
| CommandMAPS | `<municipality>-commandmaps.dev.civicmaps.com.au` |
| Acceptance hosts | `alpha-commandmaps.dev.civicmaps.com.au`, `beta-commandmaps.dev.civicmaps.com.au` |
| Reserved EnforcementMAPS | `<municipality>-enforcementmaps.dev.civicmaps.com.au` |
| Reserved public reporting | `<municipality>-report.dev.civicmaps.com.au` |
| API | `/api` on the application's own origin |
| Staging | `staging.civicmaps.com.au` reserved; no deployment selected |
| Production | Hostnames and deployment unconfigured |

Municipality slugs use the registry's validated lowercase DNS-safe slug. Hostnames must be explicitly registered; a wildcard certificate or DNS entry never authorises a municipality. Cookies are Secure, HttpOnly and host-only for deployed HTTPS; backend sessions also bind the exact host/route version. Platform and council identities remain separate. The routing implementation owns trusted ingress, origin/CSRF, readiness and revocation enforcement.

All service labels are a single DNS label beneath `dev`, allowing a future `*.dev.civicmaps.com.au` certificate. The initial deployment may issue exact-host certificates. Product URL tokens remain `commandmaps` and `enforcementmaps`; `emaps` is the officer Expo slug/scheme. Reserved names do not assert that scaffold services exist.

Route 53 zone: `Z01841903TEW783OZ3RC`. Delegation nameservers: `ns-219.awsdns-27.com`, `ns-1982.awsdns-55.co.uk`, `ns-1066.awsdns-05.org`, `ns-742.awsdns-28.net`. Public NS/SOA resolution verified on 16 October 2026; the parent still uses VentraIP's nameservers. Existing `.gov.au` wireframe URLs are historical placeholders, not the owned development domain. Never deploy to those names implicitly.

Update this standard and the [identity manifest](civic-maps-identity.manifest.json) together when adding an environment or changing a naming contract. Infrastructure and readiness evidence belong in [F06](../plans/F06-preparation.md).
