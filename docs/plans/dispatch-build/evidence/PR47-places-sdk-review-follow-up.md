# PR47 Places SDK review follow-up

27 October 2026 · Author: Codex · Reviewed base: `3cb4be2cc8d8a99867979f6dee6a89d9d85a40d0`

Validated all three review findings. Prediction wrappers now call `toPlace()` on the original SDK instance. The shared Maps loader resolves through a unique Google callback, with timeout/error cleanup and retry reset. A details attempt discards the current autocomplete token before asynchronous work, covering imprecise, failed and stale completions without clearing a newer search's token on completion.

The CI-wired map browser suite now intercepts the cold Maps script with synthetic SDK code and delays initialisation until explicitly released. It checks readiness remains disabled until the callback, then accepts an address. The SDK fixture now requires the original prediction receiver. A street-only result followed by a precise result verifies token replacement and successful confirmation.

Passed: system Chromium `npm run test:map:browser`, lint, both app typechecks, targeted formatting and `git diff --check`. Tests use synthetic provider responses; no live Google calls or database integration suite were run. No merge or deployment.
