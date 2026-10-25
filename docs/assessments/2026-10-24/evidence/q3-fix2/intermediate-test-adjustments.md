# Intermediate Q3 browser fixture adjustments

This file summarizes the iterative browser-test changes before the final serial pass. Only the final pass logs are acceptance evidence; the retained raw prior assertion failure is `intermediate-commandmaps-failure.log`.

- The existing create-request test used the old `Create request` label after a 503. With write-side 5xx correctly treated as uncertain, the UI now labels the safe idempotent action `Retry same request`; the test follows that label.
- The first ABA fixture was created through the API but not yet loaded into the queue. A refresh and exact row-visibility checks now precede selection.
- The malformed-write cases change selected request. The later existing concurrency case now explicitly reselects its fixture before verifying version-conflict behavior.
- Selection changes abort an in-flight reconciliation. The existing test now performs the required new explicit server-state/history check before expecting a same-key retry after navigating back to that request.

These were test-fixture expectation/setup changes; the final tests retain all original server-side authorization, version conflict and idempotency assertions.
