# R4 current dependency guidance retrieval

Retrieved 2026-10-30 UTC using the connected Context7 tools. Installed versions were read from the clean lockfile-installed tree after `npm run setup`; no package was upgraded.

| Package | Installed version | Context7 library ID | Version relation | Retrieved topic and cited source |
| --- | --- | --- | --- | --- |
| Express | 5.2.1 | `/expressjs/express/v5.2.0` | Same 5.2 minor; nearest indexed patch | JSON/body parser limits and Express 5 error middleware/async handling. https://context7.com/expressjs/express/llms.txt |
| React | 19.2.0 | `/reactjs/react.dev` | Official current React docs; no exact 19.2.0 pin offered for this docs library | `useEffect` setup, cleanup, and reactive dependency lifecycle. https://github.com/reactjs/react.dev/blob/main/src/content/reference/react/useEffect.md |
| node-postgres (`pg`) | 8.20.0 | `/websites/node-postgres` | Official docs do not expose a version selector in Context7 results; consulted 8.x package’s general API docs | Transactions on one checked-out client, parameterised queries, pool use and client release. https://node-postgres.com/features/transactions ; https://node-postgres.com/features/queries ; https://node-postgres.com/features/pooling |
| Playwright (`@playwright/test`) | 1.58.2 | `/microsoft/playwright/v1.58.2` | Exact indexed version | Browser context isolation and auto-waiting web-first assertions. https://github.com/microsoft/playwright/blob/v1.58.2/docs/src/browser-contexts.md ; https://github.com/microsoft/playwright/blob/v1.58.2/docs/src/best-practices-js.md |
| Vite | 6.4.5 | `/websites/vite_dev/v6` | Version-6 docs; patch-exact docs are not indexed | `server.fs.strict`, allow/deny precedence, and proxy `rewriteWsOrigin` security caveat. https://v6.vite.dev/config/server-options |

Context7 resolution selected the official/high-reputation package or project documentation in each case. The versions above were separately verified in `package-lock.json` after setup. React, node-postgres and Vite sources were not patch-exact; this is recorded rather than presented as patch-specific advice. This is a current-guidance retrieval record, not an independent audit verdict or claim that every cited rule was exhaustively re-audited.
