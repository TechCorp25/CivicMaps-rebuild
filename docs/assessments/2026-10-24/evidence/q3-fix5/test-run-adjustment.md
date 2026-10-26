# Q3 follow-up 5 test-run notes

The first full `npm run check` stopped in ESLint because `location` in a browser test's `page.evaluate` callback was not declared in the Node test scope. The test now uses `window.location.href`; the first output is retained as `npm-check-lint-failure.log`.

The first Platform browser execution of the interrupted-body fixture reached the expected safe state (the dialog closed and all nine controls were disabled), then failed because its assertion expected the generic HTTP response text. An interrupted body is reported as a safe network transport error, so the assertion now checks the corresponding generic network message and verifies that the private stream error is not shown. The final sequential Platform browser output is `browser-platform.log`.
