# F06 preparation — reassessment handoff

Prepared 17 October 2026 (Australia/Melbourne) by Codex. Applies only to preparation PR #13, branch `codex/civicmaps-f06-preparation`, updating reviewed head `8eb7eba8d7c9324388b5feed0f641951bceb6ab1` against main `4bedee8d9770c922775128a89f3b8cb4fee5461d`.

## Review corrections

- P2 DNS label overflow: the [naming standard](../../civicmaps-naming-pack/DEVELOPMENT-HOSTNAMING-STANDARD.md) and [identity manifest](../../civicmaps-naming-pack/civic-maps-identity.manifest.json) now define a shared municipality token. Direct slugs are limited to 47 characters and cannot use the reserved `id-` prefix. Other valid registry slugs map to `id-` plus all 32 hexadecimal digits of their immutable municipality UUID. No slug truncation, registry renaming or new registration restriction is required.
- Collision handling: the reserved prefix separates direct and UUID-derived tokens; immutable unique municipality IDs distinguish derived tokens. Manifest ownership remains unique and conflicts fail closed. Existing incompatible routes require explicit reconciliation, withdrawal, session invalidation and new readiness checks.
- Stale handoff wording: the preparation, ledger and assessment now distinguish selected domain/EC2/Caddy decisions from outstanding cost-fit and provider-support verification.
- Acceptance matrix now requires length boundaries, determinism, same-prefix and reserved-prefix collisions, invalid identity, conflicting ownership and existing-record preservation.

## Validation

An independent temporary Python model of the manifest policy passed all 15 combinations of slug lengths 47, 48, 51, 52 and 63 with CommandMAPS, reserved EnforcementMAPS and reporting patterns. Direct tokens top out at 47 characters; the longest suffix produces exactly 63. Derived tokens are 35 characters.

Additional checks passed: repeatable mapping; distinct IDs for long slugs sharing a prefix; a slug matching another municipality's derived token; missing/invalid UUID rejection; unchanged Alpha/Beta acceptance hosts; preserved legacy identity fields; parsing both JSON documents; 29 allowed-status ledger entries with F06 still planned and acceptance false; all 32 relative file links in the five updated source documents; trailing-whitespace checks.

The model validates the specification, not deployed routing or the separate build branch. Existing-record preservation and stored-route conflict/recovery are specified acceptance requirements requiring implementation tests. Runtime suites were not rerun locally for these documentation-only corrections. Hosted CI for the new commit must be inspected independently; the previous head's passing CI is not evidence for this revision.

## Independent reassessment

Review the diff from `8eb7eba`, confirm the standard and manifest agree, and verify the naming algorithm's disjoint token namespaces and DNS bounds. Check updated handoff language and new-head CI. No runtime enforcement, AWS/DNS changes, feature acceptance or owner merge is claimed. The separate F06 build PR must incorporate the revised contract and demonstrate its acceptance cases before claiming F06 completion.
