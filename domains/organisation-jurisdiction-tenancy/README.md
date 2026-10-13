# Organisation, Jurisdiction and Tenancy Management

Status: repository-foundation placeholder; implementation baseline not yet approved.

Responsibility: Owns structural relationships, lifecycle, effective dating and Authority Realm resolution.

This area must preserve the applicable Section 01 requirements and may not select a framework, runtime, database, identity mechanism, provider or deployment boundary until the relevant Section 03 ADR is approved.

F03 implements the local versioned municipality binding, effective user grant and per-operation resolver in [services/api/operating-context.mjs](../../services/api/operating-context.mjs), with [migration 004](../../services/api/migrations/004-operating-context.sql). See the [contract and migration guide](../../docs/development/operating-context.md). This uses the authorised existing stack; provider provisioning and operator-facing structural administration remain later work.
