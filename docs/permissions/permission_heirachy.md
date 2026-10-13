# CivicMAPS Permissions & Access Control

> CivicMAPS — Municipal Area Patrol System — Role-Based Access Control Reference

---

## Authority Hierarchy

All permission decisions flow from a single ranked hierarchy. Lower rank number = higher authority. A user can **never** edit a peer of equal rank or anyone above them.

| Rank | Role | Scope |
|------|------|-------|
| 1 | Admin | System-wide — all branches, all teams |
| 2 | Compliance Lead | Branch-wide — all teams within own branch |
| 3 | Compliance Coordinator | Branch-wide — all teams within own branch |
| 4 | Dispatch | Code21/SR operations only — global across all branches, **zero** employee write access |
| 5 | Team Supervisor | Own branch, assigned team(s) only |
| 6 | Shift Supervisor | Own branch, assigned team(s) only |
| 7 | Supervisor | Own branch, assigned team(s) only |
| 8 | Officer | Standard user — no write access |

The rank integer and role string are defined once in `shared/roles.ts` and referenced everywhere else. Role literals must never appear outside this module.

---

## Organisational Structure

```
Branch (e.g. Parking Services, Local Laws)
 └── Team (e.g. Day Team 1, Day Team 2)
      └── Officer
```

- Every employee belongs to exactly one branch.
- Every officer belongs to exactly one team within that branch.
- Compliance Lead and Compliance Coordinator are **branch-level cross-cutting roles** — they are not nested under a team.
- Supervisors/managers are linked to one or more teams via the supervisor/manager toggle and team assignment.

---

## Permission Domains

The system enforces two independent permission domains. Holding authority in one domain does **not** grant authority in the other.

### Domain 1 — Employee Data

Governs who can view and edit employee records (role, team, branch, shift, contact details). All employee data is operational context — not personal or sensitive.

### Domain 2 — Code21 / Service Request Operations

Governs who can create, assign, edit, close, and void service requests and parking infringement workflows.

Dispatch is the critical split-authority role: full global access in Domain 2, explicitly excluded from all writes in Domain 1.

---

## Domain 1 — Employee Data Permissions

### Read Access

**All authenticated users** can view all employee records across all branches. No restrictions.

### Write Access

Two conditions must **both** be satisfied:

1. **Branch match** — the user must belong to the same branch as the target employee. The sole exception is Admin, who spans all branches.
2. **Rank superiority** — the user's rank number must be strictly less than the target employee's rank number (`user_rank < target_rank`). Equal rank is denied. Higher rank number editing lower rank number is denied.

#### Write Access Matrix

| User Role | Can Edit | Scope Restriction |
|-----------|----------|-------------------|
| Admin (1) | Ranks 2–8 | All branches |
| Compliance Lead (2) | Ranks 3–8 | Own branch, all teams |
| Compliance Coordinator (3) | Ranks 4–8 | Own branch, all teams |
| Dispatch (4) | **None** | No employee write access |
| Team Supervisor (5) | Ranks 6–8 | Own branch, assigned team(s) only |
| Shift Supervisor (6) | Ranks 7–8 | Own branch, assigned team(s) only |
| Supervisor (7) | Rank 8 only | Own branch, assigned team(s) only |
| Officer (8) | **None** | No employee write access |

#### Branch Isolation Rule

Write permissions **never** cross branch boundaries except for Admin.

- Compliance Coordinator in Parking Services → **cannot** edit anyone in Local Laws.
- Supervisor of Day Team 2 in Parking Services → **cannot** edit Day Team 1 members in Parking Services.
- Admin → **can** edit any employee in any branch (subject to rank rule).

#### Hierarchical Gating Examples

| Scenario | Result | Reason |
|----------|--------|--------|
| Compliance Lead edits Compliance Coordinator (same branch) | ✅ Allowed | Rank 2 > Rank 3, same branch |
| Compliance Lead edits another Compliance Lead (same branch) | ❌ Denied | Equal rank — peer editing prohibited |
| Compliance Coordinator edits Compliance Lead | ❌ Denied | Rank 3 cannot edit Rank 2 |
| Team Supervisor edits Shift Supervisor (own team) | ✅ Allowed | Rank 5 > Rank 6, same branch + team |
| Supervisor edits another Supervisor | ❌ Denied | Equal rank |
| Dispatch edits any employee | ❌ Denied | Dispatch has zero employee write access |
| Compliance Coordinator (Local Laws) edits Officer (Parking Services) | ❌ Denied | Branch mismatch |

### Enforcement

- **Server-side (authoritative):** Every employee write endpoint verifies branch match and rank superiority. Requests failing either check receive HTTP 403 with a structured JSON error body.
- **Client-side (supplementary):** Edit controls are hidden or disabled for users without write access to the specific target employee. This is a UX convenience — never the sole enforcement mechanism.

### Password Reset (Sub-Action of Employee Update)

Password reset is a permission-gated sub-action within the employee details update workflow. It generates a temporary password for the target account. The same hierarchical gating and branch isolation rules that govern employee data writes apply, with additional constraints.

#### Permission Gate

The requesting user must satisfy **all** of the following conditions:

1. **Not self** — a user cannot reset their own password through this workflow (self-service password reset is a separate feature).
2. **Rank superiority** — `requesting_user.role_rank < target_employee.role_rank` (strictly lower number = higher authority). Equal rank and upward resets are always denied.
3. **Branch match** — `requesting_user.branch_id == target_employee.branch_id` (except Admin, who spans all branches).
4. **Team match** (team-scoped roles only) — `target_employee.team_id IN requesting_user.supervised_team_ids`.

#### Password Reset Access Matrix

| User Role | Can Reset Passwords For | Scope Restriction |
|-----------|------------------------|-------------------|
| Admin (1) | Ranks 2–8 | All branches |
| Compliance Lead (2) | Ranks 3–8 | Own branch, all teams |
| Compliance Coordinator (3) | Ranks 4–8 | Own branch, all teams |
| Dispatch (4) | **None** | Explicitly excluded — no employee write access |
| Team Supervisor (5) | Ranks 6–8 | Own branch, assigned team(s) only |
| Shift Supervisor (6) | Ranks 7–8 | Own branch, assigned team(s) only |
| Supervisor (7) | Rank 8 only | Own branch, assigned team(s) only |
| Officer (8) | **None** | No write access |

#### Temporary Password Rules

| Rule | Detail |
|------|--------|
| Minimum length | 12 characters |
| Complexity | At least one uppercase, one lowercase, one digit, one special character |
| Generation | Cryptographically secure (`crypto.randomBytes`) — never `Math.random` |
| Storage | Hashed with `bcryptjs` before persistence. Plaintext never stored. |
| Plaintext return | Returned **exactly once** in the API response. Never logged, cached, or persisted. |
| Forced change | `password_must_change` flag set to `true` on target account |
| Expiry | `temp_password_expires_at` set to 24 hours from generation. After expiry, the temporary password is invalidated and requires admin intervention. |
| Rate limit | Maximum 5 password resets per requesting user per hour. HTTP 429 on exceeded. |

#### Password Reset Examples

| Scenario | Result | Reason |
|----------|--------|--------|
| Admin resets Compliance Lead (same or any branch) | ✅ Allowed | Rank 1 > Rank 2, admin spans all branches |
| Admin resets another Admin | ❌ Denied | Equal rank — peer reset prohibited |
| Compliance Lead resets Compliance Coordinator (same branch) | ✅ Allowed | Rank 2 > Rank 3, same branch |
| Compliance Coordinator resets Compliance Lead (same branch) | ❌ Denied | Rank 3 cannot reset Rank 2 |
| Compliance Coordinator resets Officer (different branch) | ❌ Denied | Branch mismatch |
| Team Supervisor resets Officer (own team, own branch) | ✅ Allowed | Rank 5 > Rank 8, same branch + team |
| Team Supervisor resets Officer (different team, same branch) | ❌ Denied | Team mismatch |
| Dispatch resets any employee | ❌ Denied | Dispatch excluded from employee writes |
| Any user resets their own password | ❌ Denied | Self-reset blocked |

#### Audit

Every password reset attempt — successful or denied — is recorded in the audit trail with: timestamp, requesting user (ID, role, rank, branch), target employee (ID, role, rank, branch, team), result, and denial reason if applicable.

---

## Domain 2 — Code21 / Service Request Permissions

### 2a — Create / Dispatch a New Service Request

| Role | Access |
|------|--------|
| Admin | ✅ Global — all branches |
| Dispatch | ✅ Global — all branches |
| Compliance Lead | ✅ Global — all branches |
| Compliance Coordinator | ✅ Global — all branches |
| All others | ❌ Denied |

### 2b — Assign / Reassign Officer to a Service Request

| Role | Access |
|------|--------|
| Admin | ✅ Global — any officer, any branch |
| Dispatch | ✅ Global — any officer, any branch |
| Compliance Lead | ✅ Global — any officer, any branch |
| Compliance Coordinator | ✅ Global — any officer, any branch |
| Team Supervisor | ⚠️ Scoped — assigned team(s), own branch only |
| Shift Supervisor | ⚠️ Scoped — assigned team(s), own branch only |
| Supervisor | ⚠️ Scoped — assigned team(s), own branch only |
| All others | ❌ Denied |

### 2c — Log Code2 Entries Against Officers

| Role | Access |
|------|--------|
| Admin | ✅ Global — any officer, any branch |
| Dispatch | ✅ Global — any officer, any branch |
| Compliance Lead | ✅ Global — any officer, any branch |
| Compliance Coordinator | ✅ Global — any officer, any branch |
| All others | ❌ Denied |

### 2d — Edit a Service Request Form

#### Field Lock Rules (enforced server-side, applies to ALL roles)

| Field | Lock Condition |
|-------|---------------|
| SR Number | Read-only after initial save — immutable for all roles once the SR has been persisted |
| Post-PIN fields | Read-only after PIN assignment is saved — all fields populated at or after PIN assignment become permanently immutable |
| All other fields | Editable per role permissions below |

#### Role Permissions (subject to field locks above)

| Role | Access |
|------|--------|
| Admin | ✅ Global — all branches |
| Dispatch | ✅ Global — all branches |
| Compliance Lead | ✅ Edit any SR |
| Compliance Coordinator | ✅ Edit any SR |
| Assigned Officer | ✅ Edit their own assigned SR only |
| Assigned Officer's People Manager | ✅ Edit the SR assigned to their direct report |
| All others | ❌ Read-only view |

### 2e — Close a Service Request

| Role | Access |
|------|--------|
| Admin | ✅ Global — all branches |
| Dispatch | ✅ Global — all branches |
| Compliance Lead | ✅ Global — all branches |
| Compliance Coordinator | ✅ Global — all branches |
| All others | ❌ Denied |

### 2f — Void / Delete a Service Request Containing an Issued PIN

This is the highest-consequence action in the system — it removes a parking infringement from the record.

| Role | Access |
|------|--------|
| Compliance Lead | ✅ Global — any branch |
| Compliance Coordinator | ✅ Global — any branch |
| Team Supervisor | ⚠️ Scoped — team-level, own branch only |
| Shift Supervisor | ⚠️ Scoped — team-level, own branch only |
| Supervisor | ⚠️ Scoped — team-level, own branch only |
| Dispatch | ❌ **Explicitly denied** — can edit/close SRs but cannot void a PIN |
| Admin | ❌ **Excluded by design** — see rationale below |
| All others | ❌ Denied |

> **Admin exclusion rationale:** The Admin account is not intended for operational use. PIN issuance and PIN void/delete are legally accountable actions that require an identifiable, operationally authorised individual for audit purposes. Admin carries no legal accountability and therefore cannot issue, void, or delete a PIN. Admin is intended for updating operational information, managing accounts, and testing workflows — not for legally consequential operational actions.

---

## Employee Onboarding & Association Rules

### Hierarchy Persistence

When an employee record is saved, the system must correctly persist:

- `branch_id` — which branch the employee belongs to
- `team_id` — which team the employee belongs to (if applicable)
- `role` — the employee's role string
- `role_rank` — the integer rank from the authority hierarchy (derived from `role`, stored for query efficiency)
- `is_supervisor` — boolean supervisor/manager toggle
- `supervised_team_ids` — list of team IDs this employee manages (populated when `is_supervisor` is true)

### Cross-Cutting Roles

Compliance Lead and Compliance Coordinator are **branch-level** roles. They are stored with a `branch_id` but are **not** nested under any team. The save workflow must ensure these roles are resolved and stored separately from the team supervisor → officer hierarchy to prevent corruption of parent/sibling references.

### Supervisor / Manager Toggle

When toggled **ON**:
- A dropdown appears showing available team names within the employee's branch.
- The selected team is saved to `supervised_team_ids`.

When toggled **OFF**:
- The dropdown is hidden.
- `supervised_team_ids` is cleared.

### Team Autofill on People Manager Selection

When the People Manager field is changed during onboarding or editing:

1. If the selected manager has an assigned team → the Team Name field is **autofilled** with that team.
2. The autofilled value remains **editable** if the logged-in user holds write permission over the target employee.
3. If the logged-in user lacks write permission → the autofilled value is displayed as read-only.

**Example:** New onboarding → People Manager: "Bruce" → Team Name autofills: "Day Team 2"

---

## Server-Side Enforcement Summary

Every protected endpoint must execute checks in the following order:

```
1. Authentication — is the user logged in?
         ↓ fail → 401 Unauthorized
2. Domain routing — is this an employee-data or SR-operation endpoint?
         ↓
3a. [Employee Data] Branch check — user.branch_id == target.branch_id (skip for admin)
         ↓ fail → 403 Forbidden
3b. [Employee Data] Rank check — user.role_rank < target.role_rank
         ↓ fail → 403 Forbidden
3c. [Employee Data] Scope check — if team-scoped role, target.team_id in user.supervised_team_ids
         ↓ fail → 403 Forbidden
         ↓ pass → Allow write
         
3a. [SR Operation] Role check — user.role in permitted role list for action
         ↓ fail → 403 Forbidden
3b. [SR Operation] Scope check — if team-scoped role, verify branch + team match
         ↓ fail → 403 Forbidden
3c. [SR Operation] Field lock check — reject modifications to locked fields
         ↓ fail → 403 Forbidden (with locked field names in response body)
         ↓ pass → Allow operation
```

All 403 responses must return a structured JSON body:

```json
{
  "error": "forbidden",
  "message": "Insufficient permissions to edit this employee",
  "detail": {
    "required_rank": 3,
    "user_rank": 5,
    "branch_match": true,
    "team_match": false
  }
}
```

---

## Admin Account — Legal Accountability Exclusion

The Admin account is a **system administration role**, not an operational role. It exists for managing employee records, account configuration, operational data, and workflow testing.

Admin is **explicitly excluded** from all legally accountable operational actions:

| Action | Admin | Reason |
|--------|-------|--------|
| Issue a PIN | ❌ | PIN issuance requires an identifiable, legally accountable officer |
| Void / delete a PIN | ❌ | PIN void requires legal accountability for audit trail |
| Any action that creates or destroys a legal infringement record | ❌ | No legal standing for audit purposes |

Admin **can** perform all other SR operations (create, dispatch, assign, edit, close) as these are administrative/operational actions that do not carry direct legal consequence tied to a parking infringement.

---

## Platform Access & Dispatch Training Mode

### Platform Matrix

| Role | CommandMAPS (Web) | EnforcementMAPS (Mobile) |
|------|-------------------|----------------|
| Admin | ✅ Full access | ✅ Full access |
| Compliance Lead | ✅ Full access | ✅ Full access |
| Compliance Coordinator | ✅ Full access | ✅ Full access |
| Dispatch | ✅ Full access | ⚠️ Training mode only |
| Team Supervisor | ✅ Full access | ✅ Full access (elevated permissions retained) |
| Shift Supervisor | ✅ Full access | ✅ Full access (elevated permissions retained) |
| Supervisor | ✅ Full access | ✅ Full access (elevated permissions retained) |
| Officer | ❌ Not applicable | ✅ Full access |

### People Managers on EnforcementMAPS

People managers (Team Supervisor, Shift Supervisor, Supervisor) retain their elevated authority and permissions when logged into EnforcementMAPS on a mobile handset. While their roles are primarily office-based, operational requirements (training, staffing levels, coverage) may require them to work in the field. EnforcementMAPS must function as a fully operational, separate instance for people managers with all permissions intact.

### Dispatch Training Mode (EnforcementMAPS)

Dispatch has no operational requirement for the EnforcementMAPS mobile application. When a Dispatch account logs into EnforcementMAPS on a mobile handset, the application must enter **Training Mode**:

| Aspect | Behaviour |
|--------|-----------|
| UI visibility | All features and functions are visible — Dispatch sees exactly what a field officer sees across all workflows |
| PIN issuance | **Disabled** — Dispatch cannot issue a PIN in training mode |
| SR creation | Permitted, but the SR receives a **TRAINING** flag |
| TRAINING flag | Persisted on the SR record. Training SRs have no legal value, no location attendance requirements |
| Visibility of training SRs | Training-flagged SRs are **only visible to the Dispatch account** that created them, on both CommandMAPS and EnforcementMAPS. They are invisible to all other users |
| Visual indicator | EnforcementMAPS must display a persistent, prominent banner or indicator confirming the app is in Training Mode |
| Entry confirmation | Pop-up confirmation must be manually acknowledged, confirming switch from active status to training mode |

### Dispatch Training Mode (CommandMAPS)

Dispatch can self-assign training mode via the **CommandMAPS settings panel**:

| Aspect | Behaviour |
|--------|-----------|
| Entry | Self-assigned in settings. Pop-up confirmation required acknowledging switch from active to training. |
| Training timer | 60-minute timer begins on entry. On expiry, a pop-up notification asks if training is still active. Must be manually acknowledged to continue or exit. |
| TRAINING flag | Same rules as EnforcementMAPS — SRs flagged TRAINING, no legal value, visible only to creating dispatch account |
| Audit | Training mode entry, timer renewal, and exit recorded in audit trail |

### New Officer Training Mode (Probation / Onboarding)

New officers during probation or onboarding may be assigned training mode:

| Aspect | Behaviour |
|--------|-----------|
| Assigned by | Branch-specific compliance coordinator or direct people manager |
| Platform | EnforcementMAPS |
| Audit | Training mode assignment logged on the employee's audit trail (employee card). Audit trail visible only to users with relevant RBAC permissions. |
| TRAINING flag | Same rules as dispatch — SRs have no legal value, no location attendance requirements, visible only to trainee and assigning manager/coordinator |
| No Report evidence | Full workflow — real camera use, images flagged TRAINING |

### Training SR Lifecycle

| Aspect | Behaviour |
|--------|-----------|
| Auto-deletion | Training SRs deleted from all normal views after **7 days** from creation |
| Permanent archive | Complete SR record and all evidence images permanently archived in **branch compliance coordinator's audit archive log** — lookup only, cannot be edited or deleted |
| Archive visibility | Branch compliance coordinator only |

---

## Quick Reference — Role Capabilities at a Glance

| Capability | Admin | Comp. Lead | Comp. Coord. | Dispatch | Team Sup. | Shift Sup. | Supervisor | Officer |
|---|---|---|---|---|---|---|---|---|
| View all employees | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Edit employees (branch-wide) | ✅ All | ✅ Own | ✅ Own | ❌ | ❌ | ❌ | ❌ | ❌ |
| Edit employees (team-scoped) | — | — | — | ❌ | ✅ Own | ✅ Own | ✅ Own | ❌ |
| Hierarchical gating applies | ✅ | ✅ | ✅ | — | ✅ | ✅ | ✅ | — |
| Create/dispatch SR | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Assign officer to SR | ✅ | ✅ | ✅ | ✅ | ⚠️ Team | ⚠️ Team | ⚠️ Team | ❌ |
| Log Code2 entries | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Edit SR form | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ⚠️ Own |
| Close SR | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Void PIN SR (global) | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Void PIN SR (team) | ❌ | — | — | ❌ | ✅ | ✅ | ✅ | ❌ |
| Reset employee password | ✅ All | ✅ Own branch | ✅ Own branch | ❌ | ⚠️ Team | ⚠️ Team | ⚠️ Team | ❌ |

> ✅ = Full access at stated scope | ⚠️ = Scoped/conditional access | ❌ = Denied | — = Not applicable (covered by broader permission)