# Development checkpoint — 13 October 2026

Session ended early at the user's request because the local battery was critically low.

The user directs that historical governance baseline documentation and approval gates are irrelevant to this development/build. This direction is recorded in Empirical and reflected in the development plan and affected module documentation.

## Saved implementation

The first local foundation slice includes React/TypeScript/Vite CommandMAPS, Express/PostgreSQL API, synthetic users in two separate contexts, hashed passwords, HttpOnly sessions, CSRF protection, scoped row controls, request creation/assignment/acknowledgement/attendance/closure, transactional audit, retry receipts and concurrent version checks. See [local-build.md](local-build.md) for exact setup/start commands and remaining work.

Source and package-lock.json are saved on the USB drive. PostgreSQL data persists on the Linux filesystem under `~/.local/share/civicmaps-local/postgres`. The database was stopped cleanly at session close. No Git repository or upstream is configured.

## Validation

- `npm run build`: PASS, including TypeScript checking and Vite production bundle with local DM Sans.
- `npm test`: PASS, 10/10 integration tests, zero skipped. Covers authentication, persistence, invalid ownership/number fields, cross-scope denials, row controls, role denials, lifecycle/audit, concurrent duplicate retries, competing updates, CSRF/origin checks and session revocation.
- An initial assignment test failure was corrected by removing a row-lock clause that requires UPDATE privilege on the read-only users table; UPDATE permission was not granted. The final suite passed. Concurrency between future officer-administration changes and assignment remains follow-up work.
- SHA-256 comparison: all 398 `_ds/` source files and existing AGENTS.md unchanged.
- Browser script is written but NOT RUN; no screenshot or accessibility pass is claimed.
- Native mobile, evidence capture/outcomes, offline sync, realtime presence and provider maps are NOT implemented. Goal 2 and Goal 3 remain incomplete.

## Resume

1. Read this checkpoint and query the CivicMAPS Empirical work-history entry.
2. Run `npm run db:start`, then `npm run dev` from the source root.
3. Run `npm run test:browser`; fix any real browser/API/data issues and inspect the generated screenshots.
4. Continue native mobile foundations and evidence/offline workflow work in bounded units. The full role hierarchy and supervisor team scoping also remain open.

Do not treat the unexecuted browser script or the successful frontend build as proof of end-to-end product readiness.
