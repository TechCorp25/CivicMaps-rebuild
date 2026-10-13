# CivicMAPS Rebuild — Wireframe Annotation Document
## Sequence 2 — Shell & Navigation

**Document ID:** WF-S2-ANN
**Status:** Draft for owner review
**Companion artefact:** `Wireframes S2 — Shell and Navigation.dc.html`
**Fidelity:** Low-fi (structure only). Hi-fi follows owner sign-off.
**Date:** 2026-08-04
**Source repository:** `CivicMAPS/CivicMaps-preview` @ `main`

---

### How to read this document

Same convention as Sequence 1: each numbered marker maps to a row below,
scoped to its screen (`2a.3` = marker 3 on screen 2a). **Source** / **RBAC** /
**Status** classes carry the same meaning as WF-S1-ANN.

---

## Screen 2a — CommandMAPS shell, desktop header nav

**Status:** EXISTING.
**Source:** `civicmaps/commandmaps/src/components/AppShell.tsx`, mounted around
every authenticated route in `civicmaps/commandmaps/src/app/App.tsx`.
**Supporting:** `civicmaps/commandmaps/src/components/VersionBadge.tsx`.

| # | Element | Annotation |
|---|---|---|
| 2a.1 | Wordmark | "CommandMAPS" in `text-civic-accent` (Patrol Gold), `bg-civic-primary` header. |
| 2a.2 | Active nav item | `Dashboard`, `Directory`, `Assignments`, `Look Up` — four items, `navItems` array in `AppShell.tsx`. Active state is `bg-white/20`. |
| 2a.3 | Nav item, inactive | `text-white/70`, brightens to full white on hover. **RBAC:** every non-OFFICER role sees the identical four items — `AppShell.tsx` has no per-role filtering. Page-level RBAC (e.g. who can edit a Directory record) is enforced inside each page, not in the shell. |
| 2a.4 | User identity chip | `{user.displayName} ({user.role})`. Role string is the raw `UserRole` value from `civicmaps/shared/roles.ts` (e.g. `TEAM_SUPERVISOR`) — **open question OQ2-1:** the rebuild should likely render `ROLE_LABEL` ("Team Supervisor") instead of the raw enum for readability. |
| 2a.5 | Settings icon | Routes to `/settings`, separate from the nav-item row, right-aligned next to the identity chip. |
| 2a.6 | Logout | Plain text button, calls `logout()` from `auth-context.tsx`, which POSTs `/auth/logout` and clears the HttpOnly session cookie. |
| 2a.7 | Version stamp | `VersionBadge.tsx` — fixed bottom-right chip reading `v{commit} · {builtAt}`; click expands a popover that fetches `/api/version` to compare client vs. server build, surfacing deploy mismatches during triage. |

**Not shown:** the hamburger toggle (`2a.1`'s sibling) is `md:hidden` — desktop
never renders it. See `2b` for the mobile equivalent.

---

## Screen 2b — CommandMAPS shell, mobile nav drawer

**Status:** EXISTING.
**Source:** `AppShell.tsx`, `menuOpen` state, `<768px` breakpoint.

| # | Element | Annotation |
|---|---|---|
| 2b.1 | Hamburger toggle | Only rendered `md:hidden`. Auto-closes on resize back above the breakpoint (`useEffect` + `resize` listener). |
| 2b.2 | Drawer container | Renders as a full-width block beneath the header, not an overlay/sheet — pushes page content down. Same `bg-civic-primary` as the header, `border-t border-white/10`. |
| 2b.3 | Stacked nav items | Same four items as `2a.2`, full-width rows instead of inline pills. Settings is appended as a fifth row inside the drawer (desktop keeps it separate, `2a.5`). |
| 2b.4 | User footer | Identity chip repeated at the foot of the drawer (`{user.displayName} ({user.role})`), since the desktop header's inline chip has no room on mobile. |

**Design-system note:** clicking any drawer link closes the drawer
(`onClick={() => setMenuOpen(false)}` on the `<nav>` wrapper) — no separate
close affordance needed.

---

## Screen 2c — Post-login role routing (web auth gate)

**Status:** EXISTING — and a **correction** to Sequence 1.
**Source:** `civicmaps/commandmaps/src/app/App.tsx` (`AuthGate`, `LoginGate`).

Sequence 1's annotation document flagged the post-login destination as
"differs by role... scheduled for Sequence 2" — reading the routing code
directly shows that's not quite right.

| # | Element | Annotation |
|---|---|---|
| 2c.1 | Role gate | `AuthGate` checks a single condition: `user.role === "OFFICER"`. There is no switch over the other 7 roles. |
| 2c.2 | OFFICER branch | Renders a bare in-page message — *"Access denied. Use the EnforcementMAPS mobile app."* — no redirect, no styled error state. Flagged as a rebuild opportunity (currently unstyled plain text, `text-status-emergency`). |
| 2c.3 | All other roles | ADMIN, COMPLIANCE_LEAD, COMPLIANCE_COORDINATOR, DISPATCHER, TEAM_SUPERVISOR, SHIFT_SUPERVISOR, SUPERVISOR all land on `/` (`DashboardPage`) — the same route, unconditionally. |
| 2c.4 | Correction note | RBAC in this codebase differentiates **within** a page (what a role can see/edit — see `shared/roles.ts` scope functions), not by routing to different landing pages per role. Sequence 1's open question can be closed: there is no undiscovered per-role landing screen to design. |

**RBAC:** `LoginGate` separately redirects an already-authenticated user away
from `/login` back to `/`.

---

## Screen 2d — EnforcementMAPS mobile nav chrome (over the live map)

**Status:** EXISTING.
**Source:** `civicmaps/src/features/patrol/screens/PatrolScreen.tsx` (the
screen actually mounted by `civicmaps/enforcementmaps/index.tsx`), plus
`civicmaps/src/features/patrol/components/EnforcementFab.tsx`.

EnforcementMAPS has no persistent tab bar or side drawer. The map is the
entire screen; every navigation affordance is a floating control layered on
top of it, all positioned via `useSafeAreaInsets()` offsets.

| # | Element | Annotation |
|---|---|---|
| 2d.1 | Compass | Top-right, `top: insets.top + 12`. Heading-aware, `useHeading()` hook. Not a nav control, included for positional context against the elements below it. |
| 2d.2 | Nav icon column | `top: insets.top + 96`, right-aligned, three stacked 44 px circular buttons: inbox (`router.push("/inbox")`, badge = `incoming.pending.length`), peer-share directory (badge = incoming peer-share count, ring highlights `civic.accent`-equivalent tint while actively sharing), settings (`router.push("/settings")`). |
| 2d.3 | Zone / street status bars | `Z-MAC`-style zone chip + a street-position line, both data-bound (current GPS zone, nearest street). Shown here as chrome context only — the live data layer is Sequence 3+ (Patrol/Map) scope. |
| 2d.4 | Route bar | `Code21RouteBar` — bottom-centre, `bottom: insets.bottom + 150`, pill reads outstanding Code 21 + Mark-Up stop count and a Plan/Clear action. |
| 2d.5 | DURESS trigger | Bottom-left, `bottom: insets.bottom + 88`. Opens the Code 1 emergency modal (`Code1EmergencyModal`) — full workflow is Sequence 3+ scope; this screen shows only the persistent entry control. |
| 2d.6 | Enforcement FAB stack | Bottom-right, four 44 px buttons top-to-bottom: Settings, Issue Infringement (shield glyph), Code 21 dispatch (badge = active count), New Mark-Up. Source comment in `EnforcementFab.tsx` documents each target route verbatim. |
| 2d.7 | Route bar (numbered above) | see 2d.4 |
| 2d.8 | Bottom control row | `ASSIGN ZONE` pill (disabled/greyed when already assigned to the current zone), a locate/re-centre button, a map-type cycle button (standard → satellite → hybrid). |

**Design-system note:** the map screen renders on a **dark surface**
(`Colors.dark.*` — background, raised chips at `E6`/`CC` alpha), which
departs from the system's "flat light surfaces, no dark ops screens" rule.
**Open question OQ2-2:** confirm whether the rebuild keeps this dark map
chrome (common for outdoor map legibility / glare) or moves it to the
light civic palette.

**Open question OQ2-3:** `civicmaps/enforcementmaps/tabs/` (a parallel
`index.tsx` + `_layout.tsx` with its own bottom-sheet nav pattern —
Code2Button, MarkUp inline, Archive) is **not reached** by the live route:
`civicmaps/enforcementmaps/index.tsx` renders `PatrolScreen` directly and
never redirects into `/tabs`. Confirm this directory is legacy/dead code
before any of its chrome is carried into the rebuild.

---

## Screen 2e — EnforcementMAPS Inbox / Settings modal chrome

**Status:** EXISTING.
**Source:** `civicmaps/enforcementmaps/inbox.tsx`, `civicmaps/enforcementmaps/settings.tsx`.
Both are registered in `_layout.tsx` as `presentation: "modal"` Stack screens.

| # | Element | Annotation |
|---|---|---|
| 2e.1 | Back / close control | Both screens call `router.back()` from a leading control — confirmed at `inbox.tsx:154` and `settings.tsx:246`. |
| 2e.2 | Title | Static per-screen title text; no shared modal-header component — each screen builds its own header row. |
| 2e.3 | Body content | Out of scope for this sequence. Inbox lists pending peer location-pulse requests (`usePendingPulseRequests`); Settings covers profile, notifications and sharing preferences (`settingsService.ts`). Full content is scheduled for a later sequence. |

---

## Open questions requiring owner decision

| ID | Question | Blocks |
|---|---|---|
| OQ2-1 | Should the shell render `ROLE_LABEL` ("Team Supervisor") instead of the raw role enum ("TEAM_SUPERVISOR") in the identity chip? | `2a`, `2b` |
| OQ2-2 | Keep the dark map-surface treatment on EnforcementMAPS, or move it to the light civic palette per the design system's "flat surfaces" rule? | `2d` |
| OQ2-3 | Is `enforcementmaps/tabs/` legacy/dead code? It isn't reached by the live `index.tsx` route. | `2d` and any future sequence touching Code 21 / Mark-Up in-map workflows |
| OQ2-4 | The OFFICER web-denial screen (`2c.2`) is currently unstyled plain text — worth a proper empty-state treatment in the rebuild? | `2c` |

---

## Sequence 2 screen register

| ID | Screen | Surface | Status |
|---|---|---|---|
| 2a | CommandMAPS shell — desktop header nav | Web | EXISTING |
| 2b | CommandMAPS shell — mobile drawer | Web | EXISTING |
| 2c | Post-login role routing (web auth gate) | Web | EXISTING + correction |
| 2d | EnforcementMAPS mobile nav chrome | Mobile | EXISTING |
| 2e | EnforcementMAPS Inbox / Settings modal chrome | Mobile | EXISTING |

Nothing in this sequence has been invented. Every element is traced to a
named file above; the one correction (`2c.4`) replaces a Sequence-1
assumption with what the routing code actually does.
