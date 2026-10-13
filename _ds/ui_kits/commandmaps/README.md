# CommandMAPS UI Kit

Recreation of the dispatcher dashboard — used by admins, supervisors, and dispatchers to monitor patrol zones on a live map, create and assign Code21 service requests, manage officer rosters, and review audit activity.

## What's here

- `index.html` — interactive click-through entry point
- `Shell.jsx` — shared header, LucideIcon SVG set
- `LoginPage.jsx` — email/badge + password login, form validation
- `Dashboard.jsx` — map canvas (zones + officer markers + SR pins), right-side operations panel with KPI tiles, zone assignments, recent Code21s
- `Modals.jsx` — New SR (Code21) creation, Assign officer, SR detail drawer
- `OtherPages.jsx` — Directory (officers table, role tags), Audit activity log

## Flows you can demo

1. **Sign in** on the login screen (defaults pre-filled) → lands on dashboard
2. After login a **Code 2 roster-call banner** appears at the top after ~3.5s
3. Click **New Code21 (SR)** in the right panel → dispatch dialog → new SR appears in the list
4. Click a zone's **Assign / Reassign** chip → officer picker → zone updates
5. Click one of the **SR pins** on the map → detail modal
6. Swap to **Directory** or **Audit** in the header nav

## Deliberately omitted

- Assignments tab and Look Up search (out of scope for kit)
- Real Google Maps tiles (Map ID `aadaf0ce47fb616839a32e81` referenced cosmetically)
- Real WebSocket streams — markers are static snapshots
