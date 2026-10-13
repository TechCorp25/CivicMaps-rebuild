# CivicMAPS assets

- `logo.svg` — primary lock-up: Civic Navy field, white wordmark, Patrol Gold "MAPS" + mark. Candidate; replace with owner-supplied artwork when available.
- `icons/` — custom domain icons only (glyphs Lucide lacks: parking meter, infringement book, patrol-zone boundary, SR badge). Rules: 24×24 viewBox, 2px stroke, `currentColor`, rounded caps + joins, `kebab-case.svg`. Everything else uses Lucide directly.

No PNG icons. No emoji as UI. Third-party/authority crests load into the Authority Context slot at runtime — never baked into components.
