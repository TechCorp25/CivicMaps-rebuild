# Identity and Access

Status: repository-foundation placeholder; implementation baseline not yet approved.

Responsibility: Owns authentication, authorisation, service identity and access decisions.

This area must preserve the applicable Section 01 requirements and may not select a framework, runtime, database, identity mechanism, provider or deployment boundary until the relevant Section 03 ADR is approved.

The implemented council session now resolves explicit effective context grants before operational access. Platform identities remain separate. See the [F03 API and grant contract](../../docs/development/operating-context.md); identity-provider activation and per-realm role administration remain later work.
