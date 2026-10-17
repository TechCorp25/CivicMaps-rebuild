# F07 D02 — approved development scope

Owner approved in chat on 17 October 2026. Source: the explicit reply “Approve these D02 choices” to the PR #17 decision table. Empirical decision `6ad3601cbeb1d964705f3bc6`.

- First council ADMIN may access its own authenticated session/profile and only explicitly granted council contexts. No operational requests, personnel directory, dispatch/officer management or Platform rights are granted by the ADMIN label.
- An authenticated Platform operator verifies the intended recipient against the designated first administrator before issuing/delivering a synthetic activation link. Delivery is manual in the controlled development environment; no email provider is selected.
- Tokens expire after 24 hours and are single-use. Store only their hashes. Bind each token to the designated administrator, municipality and exact context version.
- Reissue by an authenticated Platform operator revokes all prior unused tokens after repeating recipient verification. Lost issuance responses require reissue; idempotency receipts never replay a plaintext token. Lost redemption responses can be recovered by signing in with the chosen password; do not replay credentials.
- Disabling an administrator revokes all its sessions and outstanding activation tokens. Record attributable audit without secret payloads. Reactivation and general user management are outside this initial slice.

These choices authorise the bounded synthetic development implementation. Release acceptance of merged F06Q remains a separate prerequisite. See [F07 handoff](F07-handoff.md).
