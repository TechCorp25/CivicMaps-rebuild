# M1 PR40 review follow-up

24 October 2026. Review baseline: `8c6cce9fcbfc0c813dc916aec18410459c2a2ee4`.
All three Codex findings on PR40 were validated against that baseline.

- Comment 4365787154: moved server-search API coverage into `tests/requests/search.test.mjs`, with its own uniquely named disposable database and teardown. The root recursive Node test command and CI discover this module.
- Comment 4365787157: both search predicates now pad to the greater of seven characters and the complete bigint text length. Added API coverage for short, eight-digit and near-maximum bigint references, including first-page counts and cursor-page matching.
- Comment 4365787159: selected-detail refresh results use request, scope and detail-generation guards before queue-generation cancellation. Added a browser regression that holds a refresh's detail response until a newer Load more operation completes, then checks successful detail and denied-detail handling. The existing CommandMAPS browser entry executes it.

Local exact-lockfile setup, lint, formatting, both application typechecks/builds and whitespace checks passed. PostgreSQL binaries are absent locally; the focused API test could not execute successfully. Database and browser acceptance require hosted CI on the published fix commit. CI results and the immutable fix SHA will be recorded in the publication receipt.

The prior Astra report remains evidence for its recorded candidate only. These product changes require fresh reassessment; publication and passing CI alone do not extend that historical acceptance. No merge or deployment is authorised by this follow-up.
