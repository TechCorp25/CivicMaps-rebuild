# CIVIC MAPS — Platform Naming Decision Record

**Status:** Approved  
**Decision type:** Naming architecture / Expo + EAS identity governance  
**Effective date:** 2026-03-23  
**Scope:** MAPS ecosystem, Expo deployments, EAS project identity, documentation, environment variables, code references

## 1. Approved ecosystem name

**CIVIC MAPS**

**Expanded form:**  
**C**entralised **I**ntegrated **V**isibility & **I**nformation for **C**ompliance

**MAPS product family meaning:**  
Municipal Administration, Patrol & Supervision

## 2. Approved deployment names

### 2.1 Officer field deployment
- **Product name:** `EnforcementMAPS`
- **Operational role:** officer field application
- **Expo slug:** `emaps`
- **EAS project ID:** `af957afa-01a5-4a77-bc19-bc46967b8edc`

### 2.2 Dispatch / admin / supervisor deployment
- **Product name:** `CommandMAPS`
- **Operational role:** dispatch, administration, supervision, compliance leadership
- **Expo slug:** `commandmaps`
- **EAS project ID:** `c1275292-88a4-415c-9b06-61a5a415f31d`

## 3. Decision rationale

`cmaps` was rejected as the dispatch/admin slug because it introduces avoidable ambiguity:

- `c` can be read as `Command`
- `c` can also be read as `CIVIC`
- ambiguity would leak into docs, code, CI, environment variables, and operational shorthand

`commandmaps` is longer, but materially clearer and safer for long-term maintenance.

## 4. Governance rules

The following rules are mandatory:

1. **CIVIC MAPS is the umbrella platform identity.**
   It is not the deployment-specific mobile app name for officer or command deployments.

2. **`EnforcementMAPS` is the officer product identity.**
   Its Expo slug remains `emaps`.

3. **`CommandMAPS` is the dispatch/admin product identity.**
   Its Expo slug is `commandmaps`.

4. **`cmaps` must not be used** in:
   - Expo slugs
   - EAS profile names
   - environment variables
   - package or bundle identifiers
   - repository names
   - code constants
   - internal shorthand in docs

5. **`civicmaps` may be used only for umbrella-level references** such as:
   - ecosystem documentation
   - architecture diagrams
   - portfolio or programme naming
   - umbrella websites or non-deployment assets

6. **EAS project identity must be treated as deployment-specific.**
   Each deployed application must retain its own unique EAS project ID.

## 5. Canonical naming hierarchy

```text
CIVIC MAPS
├── EnforcementMAPS   (slug: emaps)
└── CommandMAPS       (slug: commandmaps)
```

## 6. Authoritative language for documentation

Use the following exact language where a formal reference is required:

> CIVIC MAPS is the umbrella platform identity for the MAPS ecosystem.  
> EnforcementMAPS is the officer field deployment.  
> CommandMAPS is the dispatch, administration, and supervision deployment.

## 7. Change control

Any future change to:
- ecosystem name
- product names
- Expo slugs
- EAS project identity strategy
- reserved shorthand

must be recorded in a new decision record before implementation.

## 8. Final approved state

- **Ecosystem:** `CIVIC MAPS`
- **Officer app:** `EnforcementMAPS` / `emaps`
- **Command app:** `CommandMAPS` / `commandmaps`
- **Disallowed command shorthand:** `cmaps`
