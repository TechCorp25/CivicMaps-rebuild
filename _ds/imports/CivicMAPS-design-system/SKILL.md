---
name: civicmaps-design
description: Use this skill to generate well-branded interfaces and assets for CivicMAPS (a multi-department, multi-jurisdiction public-sector field-operations platform, Melbourne-born — EnforcementMAPS mobile + CommandMAPS dashboard incl. the Dispatch operating context), either for production or throwaway prototypes / mocks. Contains essential design guidelines, colours, type, fonts, assets, and UI-kit components for prototyping.
user-invocable: true
---

Read the `README.md` file within this skill, and explore the other available files.

Key entry points:

- `README.md` — product context, content fundamentals, visual foundations, iconography, anti-patterns
- `colors_and_type.css` — CSS token entry point (generated from `tokens/civicmaps.tokens.json`, the canonical source). Link or paste into any new artifact
- `assets/` — logo lock-up, custom domain icon rules
- `preview/` — small design-system cards (colours, type, spacing, components)
- `ui_kits/commandmaps/` — dispatcher dashboard recreation (login → map → modals → directory → audit)
- `ui_kits/dispatch/` — DISPATCHER operating context (governed, role-restricted CommandMAPS view; teal header)
- `ui_kits/enforcementmaps/` — Android officer app recreation (login → patrol → PTT → jobs → profile)

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. Always link `colors_and_type.css` rather than re-declaring tokens.

If working on production code, read the rules in `README.md` to become an expert in designing with this brand — in particular the anti-patterns list, the triple-encoding status rule (colour + icon + text), and the monospace-for-identifiers rule.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some clarifying questions (which product — CommandMAPS or EnforcementMAPS? which flow? is this production or throwaway?), and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.
