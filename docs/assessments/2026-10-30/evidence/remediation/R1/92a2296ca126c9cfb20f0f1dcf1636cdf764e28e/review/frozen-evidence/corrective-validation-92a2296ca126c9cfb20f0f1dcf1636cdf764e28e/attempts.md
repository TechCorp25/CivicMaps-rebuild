# Earlier validation attempts (not acceptance evidence)

The first corrective `npm run check` was started without `CIVICMAPS_DATABASE_URL` and without the PostgreSQL wrapper directory in `PATH`. The sandbox denied Docker/loopback access, and tests could not use the dedicated synthetic database. A subsequent configured attempt used the dedicated URL and wrapper path, but two test trees overlapped and the command remained alive after conflicting test output. These attempts were terminated by their exact PIDs after confirmation that both trees were still alive. The retained `ambiguous-earlier-check-attempt.log` contains interleaved failure/pass output and is intentionally not used as a pass result.

Definitive evidence is `check.log`: a separate single `npm run check` run with `PATH=/workspace/work/2026-10-31/builder-work/R1:$PATH` and `CIVICMAPS_DATABASE_URL=postgres://civicmaps_builder@127.0.0.1:55461/civicmaps_builder` completed with actual shell exit 0 and 114/114 tests passing.
