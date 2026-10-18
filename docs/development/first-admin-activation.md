# First council-admin activation (F07)

Apply the [owner-approved D02 choices](../plans/F07-D02-decisions.md). Council ADMIN can read its own session/profile and discover its effective explicit contexts. It cannot read operational requests, officers, resource status or Platform data, mutate operational records or manage personnel. The API rejects those operations and restrictive database policies deny ADMIN operational rows even under direct application-role SQL. Existing staff roles keep their current scope.

## Operator delivery and recovery

1. In Platform, open a municipality with its designated first administrator and an effective, explicitly authored council binding. Registration alone neither creates a user nor supplies a sign-in password. Earlier pending registration hashes and receipts remain intact and are not used for activation.
2. Select the intended context version, independently verify the designated recipient, type the verified email and affirm verification. Issue the synthetic link and deliver it through the controlled channel. No email provider or production identity proof is selected. Each issue requires a fresh verification affirmation.
3. A link is shown only in its issuance response. Its bearer secret is in the URL fragment, never the HTTP URL. The council page removes that fragment from the address bar and holds it in component memory only. Open the complete delivered link; a reload after removal requires reopening the link or reissue.
4. If issuance or delivery is lost, repeat verification and reissue with a new request key. All previous unused links are revoked. A retry using the same key returns safe metadata and `replayed: true`, never the token. Reissue after activation is denied.
5. The administrator chooses a 12–128-character password and redeems once within24hours. Concurrent redemption permits one success. Passwords and tokens are hashed; no plaintext credential/token enters receipts or audit. If the response was lost after commit, sign in with the chosen password. Replaying the activation is rejected.
6. Operator disable permanently closes this initial administrator state and revokes all sessions/outstanding links. Reactivation and general user management require a subsequent feature. Municipality-wide suspension remains F09, not this action.

`CIVICMAPS_ACTIVATION_ORIGIN` may select the local CommandMAPS test/development origin; default `http://127.0.0.1:5173`. In deployed routing mode, delivery uses the existing council route for the exact binding and redemption requires the same ready route. Platform and council sessions stay separate. No grant authoring or new-council resource deployment is introduced.

## API and durability

| Endpoint | Authority and behaviour |
| --- | --- |
| `GET /api/platform/municipalities/:id/activation` | Authenticated Platform operator; safe designation, contexts and last-token status |
| `POST /api/platform/municipalities/:id/activation` | Operator+CSRF+Idempotency-Key; explicit bindingId, verifiedEmail and recipientVerified=true |
| `POST /api/platform/municipalities/:id/activation/disable` | Operator+CSRF+Idempotency-Key; revoke administrator access |
| `POST /api/activation/redeem` | Bounded bearer redemption with municipalityId, bindingId, token and chosen password; origin and deployed route checked |

Migration012 adds the ADMIN role, designation links, hashed activation records, attributable activation events and narrow security-definer transitions. Immutable binding IDs identify exact versioned snapshots. Issue/redeem/disable serialise on the designation row. Redemption atomically creates one ADMIN identity, one grant and its activation/audit state. Binding revocation/expiry and municipality suspension deny redemption. Login takes a shared user lock and rechecks credentials/activity, preventing a login waiting behind disable from issuing a usable session.

Application roles receive no general identity/grant/token writes. The existing trusted broker alone receives the narrow redemption/login-lock functions; deployment provisioning grants those functions without changing its identity UPDATE privileges. Failed redemption records a non-secret event and commits it before sending an error. `council_admin_events` distinguishes issuance, redemption, expiry, rejected/context-conflict attempts and operator disable. Structural grant history remains in `operating_context_changes`; tokens never appear in either.

Migrations/seeds and retained manifest bootstrap preserve activated/disabled designations, credentials, grants, routes, resources, sessions and history. Unknown historical users receive no new grants. No seed or environment reset is required to upgrade. Migration012 does not activate pending registrations.

## Validation and release boundary

`npm run check` covers 69 integration tests, including populated upgrade/replay, hashed24-hour tokens, idempotent lost-response recovery, expiry/reissue/replay, concurrent redemption, wrong council/context/route, copied-cookie rejection, least privilege, bootstrap preservation and a real login-versus-disable lock wait. Run all three browser suites sequentially; `npm run test:activation:browser` adds operator delivery through administrator sign-in/reload and disable, with phone-layout screenshots. CI also runs actual Caddy ingress/client-isolation checks.

F07 merged source `2b73318` is deployed and its scoped live-release gate passed. [Release closure](../plans/evidence/F07-release-closure.md) records original-data/configuration preservation, approved Alpha retained/Beta disabled test designations, real TLS API activation/isolation/revocation and compatible recovery. True expiry and login-lock timing retain their disposable-test evidence; browser UI coverage remains the pinned source's hosted/disposable suites. Later source changes require their own release qualification.

For recovery retain migration012, audit and populated data. Operator disable revokes access without deletion; tokens cannot be reinstated. Prefer a corrective forward release. A code downgrade must retain the ADMIN-denying database policies and must not run the old unconditional manifest bootstrap. No destructive down-migration or restore over populated control data is authorised by this feature.
