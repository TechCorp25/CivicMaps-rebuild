# Naming Adoption Checklist — CIVIC MAPS

**Objective:** eliminate identity drift and lock the approved naming into configuration, code, CI, and documentation.

## Mandatory actions

- [ ] Set the ecosystem/platform name to `CIVIC MAPS` in umbrella documentation.
- [ ] Keep the officer deployment name as `EnforcementMAPS`.
- [ ] Keep the officer slug as `emaps`.
- [ ] Set the dispatch/admin deployment name to `CommandMAPS`.
- [ ] Set the dispatch/admin slug to `commandmaps`.
- [ ] Set the CommandMAPS EAS project ID to `c1275292-88a4-415c-9b06-61a5a415f31d`.
- [ ] Remove any use of `cmaps` from source, config, docs, CI, and build profiles.
- [ ] Standardise env vars to `EXPO_APP_NAME`, `EXPO_APP_SLUG`, `EAS_PROJECT_ID`, `APP_FAMILY`, `APP_PRODUCT`.
- [ ] Reserve `CIVIC MAPS` for umbrella/platform identity only.
- [ ] Ensure app config derives `name`, `slug`, `scheme`, and `extra.eas.projectId` from environment variables.
- [ ] Ensure preview/production build profiles are product-specific, not umbrella-generic.

## Search-and-replace targets

Search for and review these tokens:
- `cmaps`
- `CMaps`
- `civicmaps` used as an app slug
- `EXPO_PUBLIC_EAS_PROJECT_ID`
- `EXPO_PUBLIC_APP_SLUG`

## Completion criteria

The naming lock-in is complete only when:
- all deployment config points to approved names
- all code and CI references are unambiguous
- no banned shorthand remains
- documentation and config agree on the same canonical identifiers
