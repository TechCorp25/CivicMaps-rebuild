# Dispatch UI kit

The DISPATCHER role's view of the CivicMAPS web portal. Same backend routes as CommandMAPS, but role-restricted UI focused on the **Code21 dispatch workflow** — receive, route, monitor lifecycle, void/close.

## Why a separate kit?

In the repo (`commandmaps/src`), DISPATCHER is one of 8 RBAC tiers — they share routes with admin/supervisor but get a reduced nav and a teal context accent. In a design-system context, separating it is useful because:

- Dispatcher mental model is **queue-driven**, not map-first
- Header chrome swaps Civic Navy → **Operations Teal** so the context is unmistakable
- No Directory, Audit, or Settings navigation
- Code21 **Dashboard** (the dispatcher queue) is the home page
- The 11-state lifecycle is exposed as the primary affordance

## Files

- `index.html` — entry point (Code 1 SOS banner fires after 5s)
- `DispatchShell.jsx` — teal `DispHeader` with WS-LIVE indicator and channel readout
- `DispatchDashboard.jsx` — `Dashboard`, `StatusPill` (all 11 lifecycle states), `PriorityChip`, `FilterChip`
- `Detail.jsx` — `DetailDrawer` (with `LifecycleTrack` mini-stepper + next-action button reflecting server-enforced transitions), `CreateSRModal`

## Flows you can demo

1. **Dashboard** loads with 8 SRs across the lifecycle. Filter by Open / Needs dispatch / P1 / All.
2. Click any row → **Detail drawer** slides in from the right. Lifecycle stepper highlights current state.
3. The action button at the drawer footer advances state by one step (RECEIVED → DISPATCHED → ACTIVE → IN_PROGRESS → ATTENDED → PIN_ISSUED → COMPLETED). The button label changes per state.
4. Click **New Code21** → modal with location, type, priority. Submitted SRs auto-route server-side.
5. After 5 s, a **Code 1 SOS** persistent banner appears. Action: Open comms / Acknowledge.

## Lifecycle reference

Server-enforced transitions (only the controller can change state):

```
RECEIVED → DISPATCHED_NOT_ACTIVE → DISPATCHED_ACTIVE → IN_PROGRESS → ATTENDED → PIN_ISSUED → COMPLETED
                                                                              ↘ NO_REPORT ↗
At any open state: → VOIDED, → CANCELLED, → CLOSED
```

The 11 statuses each have a fixed colour + icon + label triple — see `STATUS_META` in `DispatchDashboard.jsx`. Never repurpose these elsewhere.

## Deliberately omitted

- Live Map, Assignments, Look Up screens — these are shared with CommandMAPS and re-rendered by the same components. The kit shows stubs to keep scope tight.
- Audit log — DISPATCHER role does not have access (RBAC).
