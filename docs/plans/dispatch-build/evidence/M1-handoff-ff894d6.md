# M1 handoff — corrected candidate `ff894d6`

**Authorship:** GPT-6 Luna implementation workstream; fresh independent assessment by GPT-6 Astra Low in isolated `fork_turns=none` context. **Current status:** `accepted` for M1 shared discovery on the exact tree below; owner merge remains required before dependent work. No merge or deployment is authorized.

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

The CI correction makes the browser scenario return `404` for the selected detail on every overlapping request until the unavailable-state assertion completes. `npm run lint`, `npm run format:check`, and `git diff --check` passed locally after the correction. Hosted run `39895161432` provisioned PostgreSQL 15 and passed the app/API/provisioning worker, generated-token, ingress/client-isolation, Platform browser, CommandMAPS browser and activation browser stages. Its artifact contains M1 desktop and narrow screenshots; those were inspected and show the 100-record queue, authorised counts, paging/load-more controls, independent detail, and a vertically stacked narrow layout without visible horizontal clipping. Focused keyboard operation was verified in browser source and hosted run: the M1 test focuses Load more, presses Enter, and asserts the loaded result count. This is not a comprehensive assistive-technology audit. The current environment still cannot run its own PostgreSQL service (`initdb` is absent and `127.0.0.1:55432` refuses connections); refer to [hosted CI evidence](M1-hosted-ci-39895161432.md) for the database-backed run.

**Acceptance basis:** exact candidate `d905b85ca7f0c2a20eaa956b0448ed7f5581f47b`, tree `9f2950e421c230c03b05efbdcc76a8b4e4fda1da`; fresh product audit passed, 93/93 hosted tests and all required browser jobs passed, focused visual and keyboard checks passed. Local PostgreSQL setup failed and remains an explicit limitation. Next action: owner review/merge of PR #40; no dependent implementation before owner merge. This handoff does not authorize deployment.
