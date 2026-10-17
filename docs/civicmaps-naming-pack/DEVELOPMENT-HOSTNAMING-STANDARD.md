# Development web naming — CIVIC MAPS

Recorded 16 October 2026 from owner-confirmed domain ownership and DNS delegation. Extends the approved product naming package; Expo/EAS identifiers are unchanged.

| Item | Naming contract |
| --- | --- |
| Owned domain | `civicmaps.com.au` |
| Parent DNS | VentraIP; retain apex website/email records |
| Development zone | `dev.civicmaps.com.au`, delegated to AWS Route 53 |
| Platform | `platform.dev.civicmaps.com.au` |
| CommandMAPS | `<municipality-token>-commandmaps.dev.civicmaps.com.au` |
| Acceptance hosts | `alpha-commandmaps.dev.civicmaps.com.au`, `beta-commandmaps.dev.civicmaps.com.au` |
| Reserved EnforcementMAPS | `<municipality-token>-enforcementmaps.dev.civicmaps.com.au` |
| Reserved public reporting | `<municipality-token>-report.dev.civicmaps.com.au` |
| API | `/api` on the application's own origin |
| Staging | `staging.civicmaps.com.au` reserved; no deployment selected |
| Production | Hostnames and deployment unconfigured |

Municipality tokens follow the deterministic mapping below; the registry's existing slug contract is unchanged. Hostnames must be explicitly registered; a wildcard certificate or DNS entry never authorises a municipality. Cookies are Secure, HttpOnly and host-only for deployed HTTPS; backend sessions also bind the exact host/route version. Platform and council identities remain separate. The routing implementation owns trusted ingress, origin/CSRF, readiness and revocation enforcement.

All service labels are a single DNS label beneath `dev`, allowing a future `*.dev.civicmaps.com.au` certificate. The initial deployment may issue exact-host certificates. Product URL tokens remain `commandmaps` and `enforcementmaps`; `emaps` is the officer Expo slug/scheme. Reserved names do not assert that scaffold services exist.

Route 53 zone: `Z01841903TEW783OZ3RC`. Delegation nameservers: `ns-219.awsdns-27.com`, `ns-1982.awsdns-55.co.uk`, `ns-1066.awsdns-05.org`, `ns-742.awsdns-28.net`. Public NS/SOA resolution verified on 16 October 2026; the parent still uses VentraIP's nameservers. Existing `.gov.au` wireframe URLs are historical placeholders, not the owned development domain. Never deploy to those names implicitly.

Update this standard and the [identity manifest](civic-maps-identity.manifest.json) together when adding an environment or changing a naming contract. Infrastructure and readiness evidence belong in [F06](../plans/F06-preparation.md).

## Municipality token contract

The registry accepts immutable lowercase slugs up to 63 characters. Appending a product suffix directly to every valid slug would exceed DNS's 63-character label limit. Use one municipality token across all listed products:

1. If the validated registry slug is at most 47 characters and does not start with `id-`, use the slug unchanged.
2. Otherwise use `id-` followed by the municipality's immutable UUID as 32 lowercase hexadecimal characters, with UUID hyphens removed. Use the full UUID, never a truncated slug, random retry suffix or shortened hash.
3. Reserve the `id-` token prefix exclusively for UUID-derived tokens. A registry slug beginning with `id-` remains valid but must itself use its municipality's UUID-derived token. Validate the UUID and reject missing/invalid identity before registering any route.
4. Persist the token and exact canonical hostname with the municipality's immutable identity in the route manifest. Enforce unique host ownership and reject conflicting assignments; naming is never an authorisation grant.

The longest suffix is `-enforcementmaps` (16 characters), so a 47-character token yields a 63-character label. UUID-derived tokens are 35 characters and fit every reserved product. Alpha/Beta acceptance hostnames remain unchanged. Different valid slugs cannot collide with UUID-derived tokens because direct tokens cannot start with `id-`; distinct municipality UUIDs produce distinct derived tokens.

Preserve all existing municipality slugs, IDs, grants and records. Existing long slugs and `id-` slugs receive the derived token during route creation; do not rename or reject their registry records. If an existing route disagrees with this mapping, report a reconciliation conflict and retain its recorded ownership; replacement requires explicit withdrawal, old-session invalidation and fresh readiness checks. Never silently rebind a hostname.

F06 build acceptance must cover slug lengths 47, 48, 51, 52 and 63 across every product pattern; repeated mapping; two long slugs with the same first 47 characters and distinct UUIDs; a slug equal to another municipality's `id-` token; invalid/missing UUIDs; conflicting stored ownership; and existing-record preservation. These are implementation requirements, not controls implemented by this preparation PR.

## Retained acceptance identities

The deployed acceptance registry uses `synthetic-alpha` (UUID `20000000-0000-4000-8000-000000000001`) and `synthetic-beta` (UUID `20000000-0000-4000-8000-000000000002`). Preserve their approved `alpha` and `beta` tokens only for those exact UUID/slug pairs. Reserve those two tokens: any other registry slug equal to `alpha` or `beta` uses its full UUID-derived token. This explicit exception preserves existing public destinations and registry records without permitting another municipality to claim an acceptance hostname. All other identities follow the general mapping above.

Migration 010 persists these tokens, checks DNS label bounds and aborts atomically on incompatible recorded ownership. Resolve such a conflict explicitly before applying the migration; never rename a registry record to make the migration pass.
