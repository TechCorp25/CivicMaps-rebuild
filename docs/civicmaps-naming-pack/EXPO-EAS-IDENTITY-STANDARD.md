# Expo / EAS Identity Standard — CIVIC MAPS

**Status:** Approved standard  
**Effective date:** 2026-03-23

## 1. Purpose

This standard defines the approved naming and identity conventions for Expo and EAS across the CIVIC MAPS ecosystem.

## 2. Canonical identifiers

| Layer | EnforcementMAPS | CommandMAPS |
|---|---|---|
| Product name | `EnforcementMAPS` | `CommandMAPS` |
| Expo slug | `emaps` | `commandmaps` |
| Product constant | `ENFORCEMENT_MAPS` | `COMMAND_MAPS` |
| Recommended URL-safe token | `enforcementmaps` | `commandmaps` |
| Recommended deep link scheme | `emaps` | `commandmaps` |

## 3. EAS project IDs

### CommandMAPS
- **EAS project ID:** `c1275292-88a4-415c-9b06-61a5a415f31d`

### EnforcementMAPS
- Retain the existing officer deployment EAS project ID already assigned to `emaps`.
- Do not replace it merely to align naming.

## 4. Environment variable standard

Use non-public variables for build and configuration identity unless the value must be read in runtime client code.

### Required variables

```env
APP_FAMILY=CIVIC_MAPS

EXPO_APP_NAME=CommandMAPS
EXPO_APP_SLUG=commandmaps
EAS_PROJECT_ID=c1275292-88a4-415c-9b06-61a5a415f31d
APP_PRODUCT=COMMAND_MAPS
```

### Officer deployment pattern

```env
APP_FAMILY=CIVIC_MAPS

EXPO_APP_NAME=EnforcementMAPS
EXPO_APP_SLUG=emaps
EAS_PROJECT_ID=<retain existing emaps project id>
APP_PRODUCT=ENFORCEMENT_MAPS
```

## 5. Public variable rule

Do **not** use `EXPO_PUBLIC_` for app identity values unless the runtime JavaScript bundle must read them directly.

Preferred:
- `EXPO_APP_NAME`
- `EXPO_APP_SLUG`
- `EAS_PROJECT_ID`

Avoid:
- `EXPO_PUBLIC_APP_SLUG`
- `EXPO_PUBLIC_EAS_PROJECT_ID`

## 6. app.config.ts pattern

```ts
import type { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: process.env.EXPO_APP_NAME ?? "CommandMAPS",
  slug: process.env.EXPO_APP_SLUG ?? "commandmaps",
  scheme: process.env.EXPO_APP_SLUG ?? "commandmaps",
  extra: {
    ...config.extra,
    appFamily: process.env.APP_FAMILY ?? "CIVIC_MAPS",
    appProduct: process.env.APP_PRODUCT ?? "COMMAND_MAPS",
    eas: {
      projectId: process.env.EAS_PROJECT_ID,
    },
  },
});
```

## 7. Reserved naming rules

### Allowed
- `CIVIC MAPS` for umbrella/platform identity
- `EnforcementMAPS` for officer deployment
- `CommandMAPS` for dispatch/admin/supervisor deployment
- `emaps` as the officer slug
- `commandmaps` as the command slug

### Disallowed
- `cmaps`
- mixed use of `civic` and `command` for the same deployment
- using the umbrella name as the app slug for a deployment-specific mobile app

## 8. Recommended repository and package naming pattern

These patterns are approved even if final reverse-domain values are assigned later:

- Repository token: `civic-maps`
- Officer app folder token: `officer-app` or `enforcement-app`
- Command app folder token: `command-app`
- Android package pattern:
  - officer: `<reverse.domain>.enforcementmaps`
  - command: `<reverse.domain>.commandmaps`
- iOS bundle pattern:
  - officer: `<reverse.domain>.EnforcementMAPS`
  - command: `<reverse.domain>.CommandMAPS`

## 9. CI / profile naming guidance

Use clear profile and pipeline names:

- `officer-preview`
- `officer-production`
- `command-preview`
- `command-production`

Avoid:
- `civic-preview`
- `cmaps-preview`
- any profile name where the deployment target is ambiguous

## 10. Enforcement requirement

If a slug, profile, package ID, env var, or config path contains `cmaps`, it should be treated as a naming-policy violation and corrected.
