# Documentation and practice reference map

Retrieved through Context7 on 24 October 2026. Queries contained public technology
names and concepts, not repository source, credentials or personal data. These are
current reference pages; they do not imply that every new feature documented by a
provider exists in the pinned library versions.

| Context7 library | Topic queried | Official reference | Applied assessment |
| --- | --- | --- | --- |
| `/websites/expressjs` | Express production security, cookies, brute-force limits, proxy authority and response headers | [Production security](https://expressjs.com/en/advanced/best-practice-security.html), [Behind proxies](https://expressjs.com/en/guide/behind-proxies.html) | QA01/QA15/QA18; preserve deliberate trusted-ingress design rather than enabling unrestricted proxy trust |
| `/reactjs/react.dev` | Effect cleanup, stale fetch responses and state reset on selection changes | [Synchronising with Effects](https://react.dev/learn/synchronizing-with-effects), [Preserving and resetting state](https://react.dev/learn/preserving-and-resetting-state) | QA04/QA07/QA09; retain generation/scope checks and explicit recovery while reducing composition complexity |
| `/websites/node-postgres` | Pool defaults, transaction release, errors, statement and connection timeouts | [Pool](https://node-postgres.com/apis/pool), [Client](https://node-postgres.com/apis/client), [Transactions](https://node-postgres.com/features/transactions) | QA02; use one client per transaction, release safely, preserve the existing error listener and add measured budgets |

The node-postgres reference explicitly documents zero as the default connection
timeout and no default statement/query timeout. Current `pg@8.20.0` configuration
was inspected locally as well; the finding does not rely solely on a documentation
snippet for a newer version.

For security advisories the source is
[GHSA-27r3-jxmh-p828](https://github.com/advisories/GHSA-27r3-jxmh-p828), fetched once
from the public GitHub advisory API and retained in
[body-parser-advisory.json](evidence/body-parser-advisory.json). Its patched version
is 2.4.0 for the affected 2.x line. The native npm audit result and installed
dependency tree independently match the affected range.

Additional deterministic checks use the project's installed ESLint/Prettier/TypeScript,
Ruff's explicit `E4,E7,E9,F` baseline, CloudFormation cfn-lint's selected-Region schema
validation and Caddy's configuration validator. Diagnostic complexity thresholds
are disclosed in the report. None is presented as a universal certification or
substitute for observed application behaviour.
