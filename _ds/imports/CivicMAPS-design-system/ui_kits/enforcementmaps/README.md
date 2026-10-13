# EnforcementMAPS UI Kit

Recreation of the Android-only officer app. Used in the field by patrol officers for zone assignment awareness, dispatch acknowledgement, Code2 logging, live location, push-to-talk, and Code 1 SOS.

## What's here

- `index.html` — in-browser Android phone frame + click-through prototype
- `MobileShell.jsx` — StatusBar, AppHeader, TabBar, shared Lucide icon set
- `Patrol.jsx` — login screen, live map with heading-aware officer arrowhead, assigned-zone highlight, SR pins, oversized SOS, incoming-Code21 bottom sheet
- `OtherScreens.jsx` — PTT (hold-to-talk, pulse when transmitting), Jobs list (active + history), Profile

## Flows you can demo

1. **Sign in** — badge 142 + password → lands on Patrol map
2. After ~2.5s an incoming **Code21 dispatch bottom sheet** slides up. Acknowledge or decline.
3. Tap the **SR pin** on the map to re-open it
4. Tap the round **SOS** button (bottom-right of map) → Code 1 banner appears
5. Tab to **PTT** — press & hold the mic button (it changes to teal "TRANSMITTING")
6. Tab to **Jobs** — active + completed Code21s with Issue Infringement CTA
7. Tab to **Profile** — officer detail + sign out

## Deliberately omitted

- Real device location / Google Maps tiles
- Camera capture, infringement form (Issue Infringement is a visual affordance only)
- Haptics (Android Vibration API is a platform call; not reproducible in browser)
