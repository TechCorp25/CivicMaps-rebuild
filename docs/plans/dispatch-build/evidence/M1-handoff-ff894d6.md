# M1 handoff — corrected candidate `ff894d6`

**Authorship:** GPT-6 Luna implementation workstream; fresh independent reassessment of the exact functional tree is pending. **Current status:** `audit_pending`, acceptance not yet established; no merge authorized.

| Field | Value |
|---|---|
| Repository | `https://github.com/TechCorp25/CivicMaps-rebuild` |
| Branch | `codex/civicmaps-dispatch-m1` |
| Verified base | `d4921eb1c37550d9ca1b53a5615242922abfa4ad` |
| Local candidate | `ff894d664d4cafe049c47d1e83c79ab421a20831` |
| Local candidate tree | `7b257e021e662a9cbdd1c96aea2151ba86b26674` |
| Local handoff head | `ab6f3bc8c3556ea591443dee0c5becd413c043cf` (tree `1bce36387be01c6c37cfae3769e5e7ebca5322fd`) |
| Published mirror | `1ecbb801c6c4ec7de74f698540ca7dc74833ac47` (same tree as local handoff head) |
| Draft PR | [#40](https://github.com/TechCorp25/CivicMaps-rebuild/pull/40) |
| Previous hosted evidence | [Run 39894279378](M1-hosted-ci-39894279378.md), CommandMAPS assertion failed and correction committed |
| Current hosted run | [39895161432](M1-hosted-ci-39895161432.md), success; all 13 substantive workflow steps passed |
| Earlier source audit | [Candidate `600eca9`](M1-independent-audit-600eca9.md); reassessment of this corrected tree is required |

Required reproduction commands:

```bash
npm run check
npm run test:commandmaps:browser
npm run test:platform:browser
npm run test:activation:browser
```

The CI correction makes the browser scenario return `404` for the selected detail on every overlapping request until the unavailable-state assertion completes. `npm run lint`, `npm run format:check`, and `git diff --check` passed locally after the correction. Hosted run `39895161432` provisioned PostgreSQL 15 and passed the app/API/provisioning worker, generated-token, ingress/client-isolation, Platform browser, CommandMAPS browser and activation browser stages. Its artifact contains M1 desktop and narrow screenshots; those were inspected and show the 100-record queue, authorised counts, paging/load-more controls, independent detail, and a vertically stacked narrow layout without visible horizontal clipping. Keyboard operation has not been verified. The current environment still cannot run its own PostgreSQL service (`initdb` is absent and `127.0.0.1:55432` refuses connections); refer to [hosted CI evidence](M1-hosted-ci-39895161432.md) for the database-backed run.

**Next action:** complete the fresh Astra Low reassessment of functional candidate `ff894d664d4cafe049c47d1e83c79ab421a20831` using the frozen requirements and exact evidence, then resolve any findings. Separately, verify keyboard operation when a supported local runtime is available. Candidate publication and passing hosted checks do not alone equal acceptance.
