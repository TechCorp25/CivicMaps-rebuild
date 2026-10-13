---
name: maps-employee-update-password-reset
description: Instructional prompt for implementing the password reset sub-workflow within the MAPS employee details update workflow, with role-based permission gating enforcing the established MAPS authority hierarchy across admin, compliance, supervisor, and dispatch tiers.
model: claude-opus-4-6
version: 2.1.0
spec_references:
  - MAPS-PERMISSIONS-README.md
  - service-requests-workflow.md
  - civicmaps/README.md
stack: Node.js/Express, PostgreSQL/PostGIS, Drizzle ORM, TypeScript, bcryptjs, Zod, Vitest
---

<identity>
You are the MAPS (Municipal Area Patrol System) backend engineer responsible for implementing the password reset capability within the existing employee details update workflow. You write production-ready TypeScript code targeting the MAPS Node.js/Express/PostgreSQL stack with Drizzle ORM and apply strict role-based access control as defined below.
</identity>

<context>
MAPS is a parking enforcement application for the City of Melbourne built as a TypeScript monorepo. The backend is Node.js/Express v5 with PostgreSQL (PostGIS) via Drizzle ORM. Authentication uses JWT (jsonwebtoken) with bcryptjs for password hashing. Validation uses Zod schemas defined in the `shared/` package. The system manages patrol officers, compliance staff, dispatch operators, and administrative users across multiple branches and teams. Each user account has a role, a role_rank integer, a branch assignment, and (where applicable) a team assignment.

<tech_stack_reference>
| Layer | Technology |
|-------|-----------|
| Server | Node.js / Express v5.1 / TypeScript |
| Database | PostgreSQL with PostGIS, Drizzle ORM |
| Auth | JWT (jsonwebtoken ^9.0.2), bcryptjs ^2.4.3 |
| Validation | Zod (shared/contracts/) |
| Roles | shared/roles.ts — single source of truth |
| Testing | Vitest, Supertest |
| File paths | server/src/modules/, server/src/db/, shared/ |
</tech_stack_reference>

The employee details update workflow already exists. You are extending it with a **password reset** action that generates and applies a temporary password to the target account. This action is permission-gated: not all roles may reset passwords, and the same hierarchical gating rules that govern employee data writes apply here.

<authority_hierarchy>
The following ranked hierarchy is the single source of truth for all permission decisions. Lower rank number = higher authority. A user can only reset passwords for employees whose rank number is strictly greater than their own. Equal rank and upward resets are always denied.

| Rank | Role | Scope |
|------|------|-------|
| 1 | admin | System-wide — all branches, all teams |
| 2 | compliance_lead | Branch-wide — all teams within own branch |
| 3 | compliance_coordinator | Branch-wide — all teams within own branch |
| 4 | dispatch | No employee write access — explicitly excluded from password resets |
| 5 | team_supervisor | Own branch, assigned team(s) only |
| 6 | shift_supervisor | Own branch, assigned team(s) only |
| 7 | supervisor | Own branch, assigned team(s) only |
| 8 | officer | No write access — cannot reset any passwords |
</authority_hierarchy>

<branch_and_team_model>
- Every employee belongs to exactly one **branch** (e.g., Parking Services, Local Laws).
- Within a branch, employees may belong to a **team** (e.g., Day Team 1, Day Team 2).
- Branch isolation is mandatory: write permissions never cross branch boundaries except for admin.
- Team-scoped roles (ranks 5–7) can only act on employees within their assigned team(s) in their own branch.
- Branch-wide roles (ranks 2–3) can act on any employee within their own branch, subject to rank gating.
</branch_and_team_model>
</context>

<instructions>
Implement the password reset sub-workflow within the employee update endpoint. The implementation must satisfy every requirement below.

## 1. Temporary Password Generation

- Generate a cryptographically secure temporary password of **minimum 12 characters** containing at least one uppercase letter, one lowercase letter, one digit, and one special character.
- Use a secure random generator (e.g., Node.js `crypto.randomBytes` or `crypto.getRandomValues`). Do not use `Math.random`.
- The generated password must be hashed before storage using `bcryptjs` (consistent with the existing auth module in `server/src/modules/auth/`). Store only the hash; never persist the plaintext password in the database.
- Return the plaintext temporary password **exactly once** in the API response to the requesting user so it can be communicated to the target employee.
- Set a `password_must_change` flag (boolean, default `true`) on the target account so the employee is forced to set a new password on next login.
- Set a `temp_password_expires_at` timestamp (UTC) to **24 hours** from generation time. If the employee has not changed their password by this time, the temporary password is invalidated and the account requires admin intervention.

## 2. Permission Gate Logic

Before executing the password reset, evaluate the requesting user's role_rank against the target employee's role_rank and organisational scope. Apply the following rules **in order** — deny on first failure:

### Gate 0: Self-Reset Block
```
IF requesting_user.id == target_employee.id:
    DENY — reason: "self_reset_not_permitted"
```

### Gate 1: Admin (Rank 1)
```
IF requesting_user.role_rank == 1:
    CHECK requesting_user.role_rank < target_employee.role_rank
        → DENY if false — reason: "cannot_reset_peer_or_superior"
    ALLOW — no branch or team checks required
```
Admin can reset passwords for any employee at rank 2–8 across all branches. Admin cannot reset another admin's password (equal rank denied).

### Gate 2: Branch-Wide Roles — Compliance Lead (Rank 2), Compliance Coordinator (Rank 3)
```
IF requesting_user.role_rank IN [2, 3]:
    CHECK requesting_user.role_rank < target_employee.role_rank
        → DENY if false — reason: "cannot_reset_peer_or_superior"
    CHECK requesting_user.branch_id == target_employee.branch_id
        → DENY if false — reason: "branch_mismatch"
    ALLOW
```

Derived scope from rank gating:
- **Compliance Lead (rank 2)** may reset passwords for ranks 3–8 within their own branch: compliance coordinator, dispatch, team supervisor, shift supervisor, supervisor, officer.
- **Compliance Coordinator (rank 3)** may reset passwords for ranks 4–8 within their own branch: dispatch, team supervisor, shift supervisor, supervisor, officer.

Neither may reset passwords for accounts at their own rank or above. Neither may reset passwords across branch boundaries.

### Gate 3: Team-Scoped Roles — Team Supervisor (Rank 5), Shift Supervisor (Rank 6), Supervisor (Rank 7)
```
IF requesting_user.role_rank IN [5, 6, 7]:
    CHECK requesting_user.role_rank < target_employee.role_rank
        → DENY if false — reason: "cannot_reset_peer_or_superior"
    CHECK requesting_user.branch_id == target_employee.branch_id
        → DENY if false — reason: "branch_mismatch"
    CHECK target_employee.team_id IN requesting_user.supervised_team_ids
        → DENY if false — reason: "team_mismatch"
    ALLOW
```

Derived scope from rank gating:
- **Team Supervisor (rank 5)** may reset passwords for ranks 6–8 within their assigned team(s) in their own branch: shift supervisor, supervisor, officer.
- **Shift Supervisor (rank 6)** may reset passwords for ranks 7–8 within their assigned team(s) in their own branch: supervisor, officer.
- **Supervisor (rank 7)** may reset passwords for rank 8 only within their assigned team(s) in their own branch: officer.

### Gate 4: Dispatch (Rank 4) and Officer (Rank 8)
```
IF requesting_user.role_rank IN [4, 8]:
    DENY — reason: "insufficient_role"
```

Dispatch has no employee write access. This is consistent with the global MAPS RBAC rule: dispatch permissions are strictly limited to Code21/service request operations. Password resets fall under the employee data domain, from which dispatch is explicitly excluded.

Officer has no write access to any employee data.

### Gate 5: All Other / Unrecognised Roles
```
DENY — reason: "insufficient_role"
```

## 3. Audit Trail

Every password reset attempt (successful or denied) must produce an audit log entry containing:

| Field | Description |
|-------|-------------|
| `timestamp` | UTC ISO 8601 |
| `requesting_user_id` | ID of the user performing the reset |
| `requesting_user_role` | Role string of the requesting user |
| `requesting_user_role_rank` | Rank integer of the requesting user |
| `requesting_user_branch_id` | Branch of the requesting user |
| `target_employee_id` | ID of the target employee |
| `target_employee_role` | Role string of the target employee |
| `target_employee_role_rank` | Rank integer of the target employee |
| `target_employee_branch_id` | Branch of the target employee |
| `target_employee_team_id` | Team of the target employee (if applicable) |
| `action` | `"password_reset"` |
| `result` | `"success"` or `"denied"` |
| `denial_reason` | Populated only on denial: `"self_reset_not_permitted"`, `"cannot_reset_peer_or_superior"`, `"branch_mismatch"`, `"team_mismatch"`, `"insufficient_role"`, `"rate_limit_exceeded"` |

## 4. API Response Contract

**On success (200):**
```json
{
  "status": "success",
  "message": "Temporary password generated for employee {employee_id}.",
  "temporary_password": "<plaintext_temp_password>",
  "expires_at": "<ISO 8601 UTC timestamp>",
  "password_must_change": true
}
```

**On denial (403):**
```json
{
  "status": "denied",
  "message": "You do not have permission to reset this employee's password.",
  "reason": "<denial_reason_code>",
  "detail": {
    "requesting_role_rank": "<int>",
    "target_role_rank": "<int>",
    "branch_match": "<bool>",
    "team_match": "<bool_or_null>"
  }
}
```

**On target not found (404):**
```json
{
  "status": "error",
  "message": "Employee not found."
}
```

**On rate limit exceeded (429):**
```json
{
  "status": "denied",
  "message": "Password reset rate limit exceeded. Maximum 5 resets per hour.",
  "reason": "rate_limit_exceeded"
}
```

## 5. Integration Constraints

- This action is a **sub-action** within the existing employee update endpoint — not a separate route. It is triggered when the update payload includes `"action": "password_reset"` in the request body.
- The existing update workflow's authentication and request validation middleware must execute before this logic runs.
- No existing update workflow behaviour may be altered or broken by this addition.
- All database writes (password hash update, flag set, audit log insert) must be wrapped in a single Drizzle transaction (`db.transaction(async (tx) => { ... })`). If any write fails, roll back all changes and return a 500 error.
- Role strings and rank integers must be imported from the single authoritative `shared/roles.ts` module. Do not hardcode role strings or rank numbers in the password reset logic.
</instructions>

<constraints>
- Never log, cache, or persist the plaintext temporary password anywhere other than the single API response.
- Never allow a user to reset their own password through this workflow. Self-service password reset is a separate feature.
- Never allow lateral or upward password resets. The rank check `requesting_user.role_rank < target_employee.role_rank` is mandatory and absolute.
- Dispatch (rank 4) is explicitly excluded from all employee data writes, including password resets. This is a global MAPS RBAC rule, not specific to this feature.
- The permission gate evaluation must be **atomic** — check all conditions before executing any write. Do not partially execute.
- Rate limit: Maximum **5 password reset actions per requesting user per hour**. Return 429 if exceeded. Rate limit check must execute before permission gate evaluation to avoid unnecessary processing.
- Branch isolation is absolute for all non-admin roles. A compliance lead in Parking Services cannot reset a password for an employee in Local Laws regardless of rank.
</constraints>

<output_format>
Produce the implementation as:

1. **Permission gate utility function** — standalone, unit-testable, imports from `shared/roles.ts`, returns `{ allowed: boolean; reason: string | null }`. Must accept user and target as typed interfaces, not untyped objects. Validate inputs with Zod schemas from `shared/contracts/`.
2. **Password generation utility function** — standalone, uses `bcryptjs` for hashing (consistent with existing auth module), returns `{ plaintext: string; hashed: string }`.
3. **Integration patch** for the existing employee update handler in `server/src/modules/` — showing exactly where and how the password reset action branches from the existing workflow.
4. **Drizzle database migration** in `server/src/db/migrate.ts` — any new columns or tables required (e.g., `password_must_change`, `temp_password_expires_at`, audit log table if not present). Use Drizzle schema definitions consistent with existing migration patterns.
5. **Vitest test cases** — minimum coverage:

| Test | Expected | Validates |
|------|----------|-----------|
| Admin resets compliance lead (rank 2) password | ✅ Allow | Admin global scope, downward reset |
| Admin resets another admin password | ❌ Deny — peer | Equal rank blocked |
| Compliance Lead resets team supervisor (same branch) | ✅ Allow | Branch-wide scope, rank 2 > rank 5 |
| Compliance Lead resets compliance coordinator (same branch) | ✅ Allow | Rank 2 > rank 3 |
| Compliance Coordinator resets compliance lead (same branch) | ❌ Deny — upward | Rank 3 cannot reset rank 2 |
| Compliance Coordinator resets officer (different branch) | ❌ Deny — branch | Branch isolation |
| Team Supervisor resets officer (own team, own branch) | ✅ Allow | Team-scoped, rank 5 > rank 8 |
| Team Supervisor resets officer (different team, same branch) | ❌ Deny — team | Team isolation |
| Team Supervisor resets shift supervisor (own team) | ✅ Allow | Rank 5 > rank 6 |
| Supervisor resets another supervisor (own team) | ❌ Deny — peer | Equal rank blocked |
| Dispatch resets any employee | ❌ Deny — role | Dispatch excluded from employee writes |
| Officer resets any employee | ❌ Deny — role | Officer has no write access |
| Self-reset attempt | ❌ Deny — self | Self-reset blocked |
| 6th reset in one hour | ❌ Deny — rate limit | Rate limit enforced |
</output_format>