# M1 handoff — corrected candidate `ff894d6`

**Authorship:** GPT-6 Luna implementation workstream; independent assessment of the earlier functional tree by GPT-6 Astra Low. **Current status:** `audit_pending`, acceptance blocked; no merge authorized.

| Field | Value |
|---|---|
| Repository | `https://github.com/TechCorp25/CivicMaps-rebuild` |
| Branch | `codex/civicmaps-dispatch-m1` |
| Verified base | `d4921eb1c37550d9ca1b53a5615242922abfa4ad` |
| Local candidate | `ff894d664d4cafe049c47d1e83c79ab421a20831` |
| Local candidate tree | `7b257e021e662a9cbdd1c96aea2151ba86b26674` |
| Published mirror | `a34495c6d6850148f64be8a4437321488b7881f9` (same tree) |
| Draft PR | [#40](https://github.com/TechCorp25/CivicMaps-rebuild/pull/40) |
| Previous hosted evidence | [Run 39894279378](M1-hosted-ci-39894279378.md), CommandMAPS assertion failed and correction committed |
| Current hosted run | `39894856312`, in progress at handoff update |
| Earlier source audit | [Candidate `600eca9`](M1-independent-audit-600eca9.md); reassessment of this corrected tree is required |

Required reproduction commands:

```bash
npm run check
npm run test:commandmaps:browser
npm run test:platform:browser
npm run test:activation:browser
```

The CI correction makes the browser scenario return `404` for the selected detail on every overlapping request until the unavailable-state assertion completes. `npm run lint` and `npm run format:check` pass on the changed test. No full database-backed local run is possible in the current environment: the disposable test container is absent, `/usr/lib/postgresql/15/bin/initdb` is missing, and `127.0.0.1:55432` refuses connections. The previous hosted run passed the app/API, generated-token, ingress/client-isolation, and Platform browser stages, but CommandMAPS failed at the test assertion and the activation browser stage was skipped. Current exact-tree CI is running.

**Next action:** wait for run `39894856312`. If it passes all required stages, restore local PostgreSQL for the exact local check and browser/screenshots/keyboard review, then start a fresh Astra Low reassessment against this exact tree. If it fails, address the reported finding on this branch and repeat checks. Candidate publication does not equal acceptance.
