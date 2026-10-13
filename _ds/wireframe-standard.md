---
name: civicmaps-wireframe-standard
description: Production standard for CivicMAPS Multi-Jurisdiction wireframe pages. Accompanies the CivicMAPS design-system expansion instruction. Governs annotation separation, numbered markers, page structure consistency, uniform frame scaling across product surfaces and form factors, and the boundary between wireframe fidelity and design-system fidelity. Wireframes run as a separate track from the design-system gate sequence.
model: claude-sonnet-5
effort: high
surface: claude-design
version: 1.0
accompanies: civicmaps-design-system-expansion v2.0
---

# CivicMAPS Wireframe Production Standard

Wireframe pages are produced to `SKYNET/CivicMAPS/CivicMAPS Multi-Jurisdiction/docs/wireframes/`.

This standard governs **how a wireframe page is built**. The design-system expansion
instruction governs **what the interface means**. Where the two touch — surface names,
terminology, status semantics, accessibility minimums — the design-system instruction
takes precedence and this document defers to it.

**Wireframes run as a separate track** within the expansion rebuild. They are not
Gate 6 fixtures and are not gated by the design-system gate sequence. Gate 6 produces
interactive, tokenised fixtures that validate the built system; wireframes are static
sketch artefacts that establish screen intent ahead of it. The sketch-fidelity rules in
Section 1 apply to this track only, not to Gate 6 output.

Match the existing approved pages rather than rebuilding the layout from this document.
Where an existing page conflicts with a rule here, record it and raise it rather than
silently following either.

---

## 1. Wireframe fidelity is deliberate — do not "correct" it toward the design system

Wireframes use a sketch presentation so they are not mistaken for approved visual
design. This is intentional and is retained:

- **Architects Daughter** for interface text and **JetBrains Mono** for identifiers,
  codes, plates, money, times and coordinates. Do **not** substitute DM Sans or
  Plus Jakarta Sans. The design system's type stack applies to the design system;
  the sketch face applies to wireframes and signals draft status.
- Hairline borders, flat fills, no elevation beyond the frame.
- Raw hex values are acceptable **on wireframe pages only**. Wireframes are
  explicitly-labelled throwaway fixtures under the design system's package-quality
  rule, not reusable components. Do not tokenise them, and do not treat wireframe hex
  usage as a design-system defect.

What wireframes **do** inherit from the design system, without exception:

- Brand anchor colours where they carry meaning: Civic Navy `#1B2A4A` for platform
  chrome and primary actions; status colours reserved for status only.
- Every operational status shown as **colour + icon + text**, never colour alone.
- Australian English (`en-AU`), sentence case for headings, labels and actions,
  uppercase only for compact operational status labels and approved code labels.
- Dates as `DD/MM/YYYY`. Identifiers reproduced exactly in the mono style.
- Full product names — CivicMAPS, CommandMAPS, EnforcementMAPS. The shorthand
  `cmaps` is not used.
- Role labels used accurately: inspector, ranger, contractor, field worker,
  dispatcher, reviewer, administrator, public user. Reserve "officer" for
  enforcement officers.
- Code 1 and equivalent critical events shown as persistent presentation, never as a
  transient toast.
- Authority Context visible on any screen where authority or data access is in play.

---

## 2. Numbered markers on the graphic, annotation text in an accompanying document

The graphical page carries numbered markers (`.mk`) and nothing else. **Keep the
markers** — they are the anchor the annotations resolve against. Remove descriptive
text, callout prose and margin notes from the graphic.

Annotation text goes into an accompanying document in the same directory.

Markers restart at 1 on each screen, so a bare number is ambiguous across a page. Key
every annotation to `screen-id + marker`: `24b-2`, not `2`.

Every marker on the graphic has exactly one entry in the accompanying document, and
every entry corresponds to a marker that exists. Confirm this in both directions when
delivering.

Where a screen exceeds its viewport, record the fold position in the accompanying
document rather than on the graphic.

---

## 3. Screen identity and page structure

Each screen carries its sub-lettered id (`24a`, `24b`, `24c`) in `.dv-oid`, with a
short label in `.dv-olabel`. The label names the screen; it does not describe
behaviour. Behaviour belongs in the accompanying document.

Every page uses the same scaffold — `.dv-turn` > `.dv-thd` > `.dv-opts` > `.dv-opt` >
`.dv-card` — with the same margins, the same marker size and placement convention, and
the same line weights, fills and type treatment.

Card widths are drawn from a fixed set, not chosen per screen. Screens of the same
surface and role use the same width across the whole set.

---

## 4. Frames are scaled per product surface, uniformly on both axes

A frame is a claim about what that surface's viewport shows. If width and height are
scaled by different factors, every element inside is misrepresented and the screen
cannot be judged from it.

Frames are keyed to **product surface and form factor**, not to generic device
categories. A surface and a form factor are two separate facts about a screen and both
must be stated.

**EnforcementMAPS runs across every form factor.** It is built predominantly for
handset use in the field, and must also operate on tablet, laptop and desktop when
required. Wireframing it only at handset size understates the surface.

Apply this to every EnforcementMAPS screen in the set, not only to screens where a
form-factor difference is obvious: for each screen, determine whether its layout
differs at tablet and at laptop/desktop. Wireframe each form factor whose layout
differs. Where the layout is genuinely identical across form factors, state that
explicitly against the screen rather than producing a duplicate page or leaving the
question unanswered.

| Form factor | Viewport | Scale | Frame (w x h) |
|---|---|---|---|
| Handset | 390 x 844 | 0.697 | **272 x 588** |
| Tablet | 834 x 1194 | 0.456 | **380 x 544** |
| Laptop / desktop | 1440 x 900 | 0.514 | **740 x 463** |

Surface-to-form-factor mapping:

| Surface | Form factors wireframed |
|---|---|
| EnforcementMAPS | Handset primary; tablet and laptop/desktop where layout differs |
| CommandMAPS | Laptop/desktop primary; tablet where a supported supervisory use exists |
| Public portal | Handset primary; laptop/desktop where the public flow differs |

One handset frame covers all field handheld use. Rugged PDA hardware does not get a
separate frame: field devices are expected to be enterprise-grade handsets locked to
single-purpose EnforcementMAPS operation, so standard handset geometry is the correct
reference. If a single-purpose device configuration removes system chrome and changes
the usable viewport, confirm the actual figure before wireframing against it rather
than assuming either value.

A shared frame size does not imply a shared layout. EnforcementMAPS at laptop/desktop
and CommandMAPS at laptop/desktop use the same 740 x 463 frame and are different
shells with different navigation. Label which shell each screen shows.

Rules for every framed screen:

- Set both width and height explicitly. A frame with unconstrained height grows to fit
  its content and makes no viewport claim at all.
- Never adjust one axis to fit available page space. Adjust the scale factor and
  recompute both.
- Interface elements sit at true relative size. The 44px minimum touch target scales
  to 30.7px at handset, 20.1px at tablet and 22.6px at laptop/desktop. Where a
  wireframe shows a touch-operated control smaller than the scaled minimum for its
  form factor, that is an accessibility defect in the design, not a drawing artefact
  — flag it against the screen.
- Field constraints are form-factor specific. One-handed reach, glove operation,
  direct sunlight and accidental-activation protection apply to handset screens.
  Do not carry a handset control layout onto a tablet or desktop frame unchanged, and
  do not carry a desktop-density layout onto a handset frame.
- Show the layout that surface and form factor produce together. EnforcementMAPS on a
  tablet is not a stretched handset layout, and EnforcementMAPS on a desktop is not
  CommandMAPS.
- Browser or OS chrome drawn inside the frame consumes frame height exactly as it
  consumes viewport height on the device. Content starts below it.
- Where content exceeds the viewport, hold the frame at its stated height and let
  content clip. Do not extend the frame or compress content to fit.
- Every screen of the same form factor uses the same frame dimensions across the whole
  set — this applies to all screens, not only to screens within one sequence.
- CommandMAPS supports standard and compact density. Where both are wireframed, use
  the same frame dimensions for each and vary only the content density.

---

## 5. When information is missing

If the correct layout for a surface, the surface's breakpoints, the authority context,
or the content of a screen is not established, ask before producing the page. Do not
fill the gap with a plausible frame.

Record unknowns the way the design-system instruction does: `DECISION REQUIRED` or
`OWNER VALIDATION REQUIRED`, against the screen they affect. An inaccurate wireframe is
worse than a missing one, because it will be reviewed as though it were accurate.

Do not invent legal, legislative, evidence, custody, delegation or operational rules to
populate a screen. Where authoritative domain detail is unavailable, mark the content
as representative.

---

## 6. Before delivering a page or set

State for each screen:

- Screen id, and that the graphic carries markers only.
- Marker count, and that it matches the accompanying document entry count in both
  directions.
- Product surface, form factor, frame dimensions, and that both axes used the same
  scale factor.
- That frame dimensions match other screens of that form factor across the set.
- Fold position where content exceeds the viewport.
- Any touch-operated control below the scaled minimum for its form factor.
- Any status shown without both icon and text.
- Anything unconfirmed, named against the screen it affects.
