# CivicMAPS Accessibility Specification
Status: CANDIDATE — Gate 4 deliverable · 2026-07-19 · testable presentation-layer criteria.
Platform/engineering conformance items are S03-owned (DR-06, §3.9.11/§3.4.14) and tagged, not resolved here.

Each criterion is pass/fail testable. IDs are stable for the Gate 7 validation report.

## A. Contrast
- **A1** Body text ≥ 4.5:1 against its surface token in every appearance mode (light, dark, high-contrast). Headings ≥ 4.5:1; large text (≥24px/700) ≥ 3:1.
- **A2** Status/presence badge text ≥ 4.5:1 against its `-bg` pair token, both modes. Includes the DR-04 pairs: grey-on-green (`--presence-active-offline` #4A5568 on #F0FDF4 = 7.6:1 ✓) and dark-grey-on-light-grey (`--presence-inactive` #374151 on #F3F4F6 = 9.6:1 ✓).
- **A3** Interactive control boundaries and focus indicators ≥ 3:1 against adjacent colours.
- **A4** Dark-mode inherited values: Gate 7 measures every text/surface pair; failures adjusted via gate exception process (owner ruling on DR-11 — preservation does not protect WCAG failures).

## B. Non-colour encoding
- **B1** Triple encoding mandatory: every status, presence, and priority indication carries colour + icon + text. Automated check: no Badge/StatusPill/marker rendered without both icon slot and visible label.
- **B2** Radio codes always render code + label together (`CODE 2 · Available`), never colour or code alone.
- **B3** Role tags keep visible text labels (F19).

## C. Motion & flashing
- **C1** Code 1 banner flash: 900ms period ≈ 1.1 flashes/sec — below WCAG 2.3.1's 3-per-second threshold. Gate 7 records formal measurement (DR-12). No other component may flash faster.
- **C2** `prefers-reduced-motion`: all pulse/flash/slide animations disabled; banner remains solid `--status-emergency`; essential state changes still visible via colour+icon+text.
- **C3** No animation may be the sole carrier of a safety-critical state.

## D. Focus & keyboard (web surfaces)
- **D1** All interactive elements reachable in DOM order matching visual order; focus visible per `*:focus-visible` (2px `--civic-accent` outline, 2px offset) everywhere, never suppressed.
- **D2** Modals/drawers trap focus, restore it on close, close on Esc.
- **D3** Emergency and directive banners are focusable landmarks reachable first after skip link.

## E. Screen reader & semantics
- **E1** Code 1 / urgent-assist banners: `role="alert"` (assertive). Roster-call and directive banners: `role="status"` + `aria-live="polite"`.
- **E2** Status pills expose full text (`aria-label="Status: In progress"`), not abbreviations.
- **E3** Read-only audit views expose no actionable semantics — no buttons/links styled as text (OC-4/F22).
- **E4** Monospace identifiers keep natural reading (no letter-spacing hacks that fragment SR output).
- **E5** DateTime renders `DD/MM/YYYY` visually with machine-readable ISO 8601 `datetime` attribute.

## F. Touch & pointer
- **F1** Mobile hit targets ≥ 44×44px; PTT and SOS controls ≥ 56px with ≥8px isolation from adjacent targets.
- **F2** Destructive/emergency actions never adjacent to routine actions without spacing or confirmation step.

## G. Content
- **G1** en-AU sentence case; ALL CAPS only in status badges (SRs read caps letter-by-letter — badges must also satisfy E2).
- **G2** Urgency conveyed by colour+icon+persistence, never punctuation.

## S03 DEPENDENCIES (tagged, not resolved)
- Native platform accessibility APIs (TalkBack behaviour, haptics) — §3.9.11.
- Automated CI contrast tooling and conformance reporting — §3.4.14.
