# CivicMAPS Rebuild — Wireframe Annotation Document
## Sequence 1 — Entry & Authentication

**Document ID:** WF-S1-ANN
**Status:** Draft for owner review
**Companion artefact:** `Wireframes S1 — Entry and Authentication.dc.html`
**Fidelity:** Low-fi (structure only). Hi-fi follows owner sign-off.
**Date:** 2026-08-04
**Source repository:** `CivicMAPS/CivicMaps-preview` @ `main`

---

### How to read this document

Every numbered marker on a wireframe corresponds to a numbered subsection below,
scoped to that screen. Reference format is `<screen id>.<marker>` — e.g. `1b.4`
is marker 4 on screen 1b.

Each screen carries three annotation classes:

| Class | Meaning |
|---|---|
| **Source** | The repository file or document the element is recreated from |
| **RBAC** | Which roles see or can act on the element |
| **Status** | `EXISTING` (present in code today) · `NEW` (rebuild addition, requires owner confirmation) |

Roles referenced use the 8-tier RBAC ranks defined in `civicmaps/README.md`:
ADMIN (1) · COMPLIANCE_LEAD (2) · COMPLIANCE_COORDINATOR (3) · DISPATCHER (4) ·
TEAM_SUPERVISOR (5) · SHIFT_SUPERVISOR (6) · SUPERVISOR (7) · OFFICER (8).

---

## Screen 1a — Council entry / tenant landing (web)

**Status:** NEW — no equivalent screen exists in the current codebase.
**Basis:** Owner direction, 2026-08-04 — *"separate login per tenant, no switcher"*.
**Purpose:** Establishes municipality (council) tenancy before any credential is
entered, and routes the user to the correct product surface.

| # | Element | Annotation |
|---|---|---|
| 1a.1 | Tenant-scoped URL | **NEW.** Tenancy is resolved from the hostname, not from a post-login switcher. Jurisdiction (state) → municipality (council) → branch is the nesting model confirmed by the owner. **Open question OQ-1:** is the tenant key a subdomain, a path segment, or a council-issued short code? |
| 1a.2 | Council crest placeholder | **NEW.** Per-tenant brand asset. Design system permits per-tenant crest in chrome; no CivicMAPS product mark is displaced. **Open question OQ-2:** who supplies and manages crest assets — platform admin or council admin? |
| 1a.3 | CommandMAPS entry card | Routes to screen `1b`. **RBAC:** available to ADMIN, COMPLIANCE_LEAD, COMPLIANCE_COORDINATOR, DISPATCHER, all SUPERVISOR tiers. Product described in `civicmaps/README.md` §Project Overview. |
| 1a.4 | EnforcementMAPS entry card | Routes to screen `1g` (web) or launches the installed app. **RBAC:** OFFICER primarily; supervisors retain field access. Product described in `civicmaps/README.md` §Project Overview. |
| 1a.5 | Provisioning footnote | Copy lifted verbatim from `civicmaps/enforcementmaps-web/src/features/auth/LoginPage.tsx` (register mode): *"Accounts are provisioned by administrators"*. No self-service registration exists at any tier. |

**Not shown, pending owner confirmation:**
- Jurisdiction (state-level) landing above the council landing — the owner's model
  has jurisdiction as a real level, but no screen has been confirmed for it.
- Platform-operator (TechCorp) entry point.

---

## Screen 1b — CommandMAPS sign-in (web)

**Status:** EXISTING, with one NEW element (1b.2).
**Source:** `civicmaps/commandmaps/src/features/auth/LoginPage.tsx`
**Supporting:** `civicmaps/commandmaps/src/features/auth/auth-context.tsx`,
`civicmaps/shared/contracts/auth.ts`

| # | Element | Annotation |
|---|---|---|
| 1b.1 | Product mark and card | Existing layout: full-viewport `bg-civic-primary`, centred white card, `max-w-md`. Heading renders "Command" in default weight with "MAPS" in `text-civic-accent`. Subtitle: "Admin Dispatch Dashboard". |
| 1b.2 | Tenant scope chip | **NEW.** Confirms which council the credential will be evaluated against, since there is no post-login switcher. Read-only; derived from `1a.1`. **Open question OQ-3:** should a wrong-tenant sign-in fail closed with "no account in this council", or redirect to the correct tenant? |
| 1b.3 | Unified identifier field | Single `identifier` field accepting email **or** badge number. Schema: `LoginRequestSchema` in `civicmaps/shared/contracts/auth.ts` — `{ identifier, password }`. Placeholder copy verbatim: *"Email or badge number (e.g. officer_629)"*. Server auto-detects: `@` present → email lookup; otherwise badge lookup with the `officer_` prefix stripped (`server/src/modules/auth/auth.routes.ts`). |
| 1b.4 | 24-hour policy hint | Copy verbatim: *"First login of the day requires email. After that, badge number is accepted."* Policy documented in `civicmaps/docs/work-reports/global/20260407t2345z-unified-login-24hr-policy-deployment.md`; backed by the `users.last_email_login_at` column (migration 022). |
| 1b.5 | Submit | Disabled during request; label swaps to "Signing in..." Existing behaviour. Token is a 24-hour JWT Bearer (`civicmaps/README.md` §Authentication). |

**RBAC:** the screen is unauthenticated. Role gating occurs after token issue —
the post-login destination differs by role and is **out of scope for Sequence 1**
(scheduled for Sequence 2, Shell & Navigation).

---

## Screen 1c — CommandMAPS sign-in, badge blocked (403)

**Status:** EXISTING.
**Source:** `civicmaps/server/src/modules/auth/auth.routes.ts` (403 `EMAIL_LOGIN_REQUIRED`),
rendered by the `error` branch of `commandmaps/src/features/auth/LoginPage.tsx`.

| # | Element | Annotation |
|---|---|---|
| 1c.1 | Error banner | Rendered above the form. Server message verbatim: *"First login of the day requires your email address."* Returned when `last_email_login_at` is null or older than 24 hours. Verified in the deployment report's API test matrix (tests 1 and 3). |
| 1c.2 | Offending input retained | The identifier is not cleared, so the officer can prepend their email without re-typing. Existing behaviour — the component does not reset state on error. |

**Design-system note:** the banner uses `--status-emergency`. Per system rules,
colour is never the sole indicator — the wireframe reserves space for an icon
alongside the text at hi-fi.

---

## Screen 1d — Officer sign-in (mobile)

**Status:** EXISTING.
**Source:** `civicmaps/src/features/auth/auth-screen.tsx`
**Supporting:** `civicmaps/src/services/authService.ts`,
`civicmaps/enforcementmaps/services/authService.ts`

| # | Element | Annotation |
|---|---|---|
| 1d.1 | Brand lock-up | Current code renders the wordmark "MAPS" at 56 px with 6 px tracking, subtitle "MUNICIPAL AREA PATROL SYSTEM". **Conflict flagged:** the design system forbids the shorthand and names the mobile product **EnforcementMAPS**. **Open question OQ-4:** confirm the rebuild wordmark for the officer app. |
| 1d.2 | Policy hint | Copy verbatim, two lines: *"Use your email for your first login of the day. After that, your badge number (e.g. officer_629) is accepted."* |
| 1d.3 | Sign In | Replaced by an activity indicator while the request is in flight (existing behaviour — the button is unmounted, not disabled). |
| 1d.4 | Register link | Navigates to `/register`, which renders the provisioning notice (screen `1f`). No account is ever created from this path. **Open question OQ-5:** retain the link in the rebuild, given it can never succeed? |
| 1d.5 | Footer | Hard-coded today as "City of Melbourne — Parking Enforcement". **Must become tenant- and branch-derived** in the rebuild: council name + branch label. |

**RBAC:** unauthenticated. Officer accounts are `OFFICER` rank 8; supervisors may
also sign in here.

---

## Screen 1e — Officer sign-in, badge blocked (mobile)

**Status:** EXISTING.
**Source:** `civicmaps/src/features/auth/auth-screen.tsx` (error state),
`civicmaps/src/services/authService.ts` (`EMAIL_LOGIN_REQUIRED` handling).

| # | Element | Annotation |
|---|---|---|
| 1e.1 | Badge identifier | Both `629` and `officer_629` are accepted formats; the server strips the prefix. Both verified in the deployment report API matrix (tests 3 and 4). |
| 1e.2 | Inline error | Rendered beneath the fields, above the submit button — not as a banner (unlike web, `1c.1`). **Recommendation for the rebuild:** align both surfaces on the banner treatment. Requires owner decision. |

---

## Screen 1f — Account provisioning notice

**Status:** EXISTING.
**Source:** `civicmaps/src/features/auth/auth-screen.tsx` (register mode) and
`civicmaps/enforcementmaps-web/src/features/auth/LoginPage.tsx` (register mode).
The two surfaces carry slightly different copy; the wireframe shows the web
variant, which is the fuller of the two.

| # | Element | Annotation |
|---|---|---|
| 1f.1 | Heading | Verbatim: "Officer Accounts". |
| 1f.2 | Notice body | Web copy verbatim: *"Accounts are provisioned by administrators"* / *"Officer accounts are created via the Patrol Zones Admin dashboard. Please contact your supervisor or system administrator if you need access to EnforcementMAPS."* **Note:** "Patrol Zones Admin dashboard" is a legacy product name; the rebuild should say CommandMAPS. |
| 1f.3 | Back to sign in | Web surface only. The mobile variant is a dead-end screen with no return affordance — a defect carried forward for the rebuild. |

---

## Screen 1g — Officer sign-in (EnforcementMAPS web)

**Status:** EXISTING.
**Source:** `civicmaps/enforcementmaps-web/src/features/auth/LoginPage.tsx`
**Supporting:** `civicmaps/enforcementmaps-web/src/features/auth/auth-context.tsx`

| # | Element | Annotation |
|---|---|---|
| 1g.1 | Brand lock-up | Renders the full "EnforcementMAPS" wordmark in `text-civic-accent`, subtitle "MUNICIPAL AREA PATROL SYSTEM". Diverges from mobile (`1d.1`), which renders "MAPS". |
| 1g.2 | Create a new account | Toggles the same component into register mode (screen `1f`) — no route change. |
| 1g.3 | Responsive card | Below the `sm` breakpoint the form is full-bleed with no card; at `sm` and above it becomes a bordered panel. Both states are the same component. |
| 1g.4 | Footer | Hard-coded "City of Melbourne -- Parking Enforcement" (double hyphen in source). Same tenancy remark as `1d.5`. |

**On successful auth** the component redirects to `/patrol`. The destination
shell is Sequence 2 scope.

---

## Screen 1h — Code 2 sign-on and its receipts

**Status:** EXISTING.
**Source:** `civicmaps/enforcementmaps/components/dispatch/Code2Button.tsx` (mobile),
`civicmaps/enforcementmaps-web/src/features/dispatch/Code2Button.tsx` (web),
`civicmaps/server/src/modules/officer-status/officer.routes.ts` (`POST /me/status/code2`),
`civicmaps/commandmaps/src/features/dashboard/DashboardPage.tsx`,
`civicmaps/commandmaps/src/features/directory/DirectoryPage.tsx`.
**Work report:** `civicmaps/docs/work-reports/20260421_000000_task30-and-code2-signon-work-report.md`

Authentication and **sign-on** are distinct events. Signing in issues a token;
logging Code 2 declares the officer field-active and flips presence to online.

| # | Element | Annotation |
|---|---|---|
| 1h.1 | Log Code 2 control | Officer-initiated. **RBAC:** `requireRole('OFFICER')` on the server route. Supervisors do not log Code 2 on an officer's behalf. |
| 1h.2 | Confirmed state | Mobile: the button itself transitions to a green "CODE 2 LOGGED — ONLINE" state with a check icon, held 2.4 s, with no second blocking alert. Web: a full modal success state — green check ring plus "CODE 2 LOGGED — You are now ONLINE" — held 1.8 s before auto-closing. The wireframe shows the modal treatment. |
| 1h.3 | Dispatcher zone-panel row | The server upserts `user_presence.is_online = true` and broadcasts `PRESENCE_UPDATED` on the `admin:dashboard` channel alongside `OFFICER_CODE2_LOGGED`. Online officers render with an emerald row background, a pulsing **ONLINE** pill, and a **CODE 2** pill where applicable; offline officers show a muted grey pill. **RBAC:** visible to DISPATCHER and above. |
| 1h.4 | KPI tile | Officers-online count updates from the same presence broadcast. |

**Design-system note:** the CODE 2 pill renders purple in current production
(`administrative outcome` in the token vocabulary). Confirm at hi-fi whether
Code 2 should instead use the operational-green family, since it denotes a
presence state rather than an outcome.

---

## Open questions requiring owner decision

| ID | Question | Blocks |
|---|---|---|
| OQ-1 | Tenant key format: subdomain, path, or council short code? | `1a` |
| OQ-2 | Ownership of per-tenant brand assets (crest, council name) | `1a`, `1b` |
| OQ-3 | Wrong-tenant sign-in: fail closed or redirect? | `1b` |
| OQ-4 | Officer app wordmark — "MAPS" (current code) or "EnforcementMAPS" (design system) | `1d` |
| OQ-5 | Retain the Register link that can never succeed? | `1d`, `1f` |
| OQ-6 | Is there a jurisdiction (state) level entry screen, or does entry always begin at council? | `1a` |
| OQ-7 | Is there a platform-operator (TechCorp) sign-in surface in scope? | Sequence 1 completeness |
| OQ-8 | Forced password change / first-login credential reset — repository contains a password-reset workflow specification under `attached_assets/`; confirm whether it belongs in Sequence 1. | Sequence 1 completeness |
| OQ-9 | Multi-branch officers: does an officer with membership in more than one branch choose a branch at sign-on, or is branch fixed to the account? | `1d`, `1h` |

---

## Sequence 1 screen register

| ID | Screen | Surface | Status |
|---|---|---|---|
| 1a | Council entry / tenant landing | Web | NEW — owner-directed |
| 1b | CommandMAPS sign-in | Web | EXISTING + 1 new element |
| 1c | CommandMAPS sign-in — 403 badge blocked | Web | EXISTING |
| 1d | Officer sign-in | Mobile | EXISTING |
| 1e | Officer sign-in — 403 badge blocked | Mobile | EXISTING |
| 1f | Account provisioning notice | Mobile + Web | EXISTING |
| 1g | Officer sign-in | EnforcementMAPS web | EXISTING |
| 1h | Code 2 sign-on + dispatcher receipt | Mobile + Web | EXISTING |

Nothing in this sequence has been invented. Every EXISTING element is traced to a
named file above; every NEW element is traced to owner direction and carries an
open question where its behaviour is not yet defined.
