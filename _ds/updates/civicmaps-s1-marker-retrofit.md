---
name: civicmaps-s1-marker-retrofit
description: Instructional prompt for retro-fitting .mk numbered markers onto the four pre-convention CivicMAPS wireframe screens 1a, 1b, 1c and 1g, so their existing annotation entries resolve against on-graphic markers. Governs entry-led marker derivation, placement, scaffold preservation and bidirectional reconciliation. Use in a Claude Code session working in the CivicMAPS Multi-Jurisdiction directory.
model: claude-sonnet-5
effort: high
surface: claude-code
version: 1.0
governed_by: wireframe-standard.md, viewport-framing.md
---

# CivicMAPS Sequence 1 Marker Retro-fit — screens 1a, 1b, 1c, 1g

You are working in the repository directory
`SKYNET/CivicMAPS/CivicMAPS Multi-Jurisdiction`. Wireframe sequence files sit at the
root of that directory.

Screens `1a`, `1b`, `1c` and `1g` in Sequence 1 predate the `.mk` marker convention.
Their annotation document carries numbered entries, but the graphics carry no
corresponding on-graphic markers, so the entries resolve against nothing. The owner
has approved adding markers to these four graphics. Bringing those four screens onto
the convention is the whole of this task.

Scope is exactly those four screens. Do not extend to any other screen in Sequence 1,
and do not extend to any other sequence, even where the same pattern appears.

## Step 1 — Read the standards and the house form in full

Read these two files end to end before editing any graphic:

- `SKYNET/CivicMAPS/CivicMAPS Multi-Jurisdiction/_ds/wireframe-standard.md`
- `SKYNET/CivicMAPS/CivicMAPS Multi-Jurisdiction/_ds/viewport-framing.md`

Read each completely. Do not skim, sample or truncate. Where the two touch the same
subject, `wireframe-standard.md` governs.

Then read `handoff.md` and `github.md` for the recorded state, and read the Sequence 1
annotation document in full.

Then establish the marker convention empirically rather than from description. Open
at least three Sequence 1 screens that already carry markers correctly — and at least
one screen of the same form factor as each screen you are about to edit — and record
the actual marker implementation: the `.mk` element markup, its size, its offset from
the element it points at, its placement convention relative to the target, its
z-order and how it behaves when it sits near a wide heading or a frame edge. Match
what those screens do. Do not invent a marker treatment.

## Step 2 — Derive the markers from the existing entries

The annotation document is the source of truth here. The entries already exist and
are numbered; your task is to place a marker on the graphic for each one, not to
rewrite the annotations.

For each of `1a`, `1b`, `1c` and `1g` individually — all four, in that order:

- List every numbered entry in the annotation document for that screen.
- For each entry, identify the interface element on the graphic that it describes.
- Record the intended marker number and its target element.
- Confirm the numbering restarts at 1 on each screen, as the convention requires.

Where an entry describes something with no single identifiable target on the graphic
— a behaviour spanning the whole screen, a state that is not drawn, or a compound
point covering several elements — do not force a marker onto an arbitrary element.
The parity pass already established that Sequence 1's documents legitimately use
compound multi-marker rows and behavioural notes without a single badge. Identify
which entries are of that kind, state them, and leave them without a marker. Report
each one so the reconciliation totals are understood rather than treated as a defect.

Present this per-screen mapping — entry number, target element, marker or
deliberately unmarked — and stop for approval before editing any graphic.

## Step 3 — Place the markers

After approval, place the markers on the four graphics.

- Use the exact `.mk` markup, size and styling taken from Step 1. Markers on these
  four screens must be indistinguishable in treatment from markers elsewhere in the
  set.
- Place each marker so it is fully legible and does not overlap or obscure the element
  it points at, adjacent labels, or another marker. Where a marker would collide with
  a wide heading, position it above and outside the heading, following the treatment
  already used on S8f.
- Markers go on the graphic; annotation text does not. If you encounter inline caption
  prose on any of these four screens, leave it in place and report it. Removing it is
  a different task.

Preserve everything else exactly. Do not change frame dimensions, do not alter the
`.dv-turn` / `.dv-thd` / `.dv-opts` / `.dv-opt` / `.dv-card` scaffold, do not restyle
or relayout any interface element, do not renumber existing entries, and do not touch
the annotation document's content. Adding markers must not change what the screen
shows or how it is framed.

After editing each file, confirm its `div` count balances to zero. The missing
`.dv-opt` closing `div` defect that silently nested screens inside each other has
already occurred in this set — verify you have not reintroduced it.

## Step 4 — Reconcile and verify

For each of the four screens, confirm both directions and state the result:

- Every `.mk` marker now on the graphic has exactly one entry in the annotation
  document.
- Every entry corresponds either to a marker that exists or to an entry deliberately
  left unmarked under Step 2, named individually.

Report marker count and entry count per screen. Matching totals with wrong pairing is
still a failure — check the pairing.

Then verify the rendered output visually. Confirm for each of the four screens that
every marker is legible, unobscured, correctly positioned against its target, and
consistent in size and style with markers on the reference screens from Step 1. Confirm
the frame still holds its stated height and that no content has shifted or reflowed as
a result of the edit.

Use `/dev-automation-suite` for the `div`-balance check and the marker-to-entry
reconciliation. Use `/building-native-ui` where a marker's correct target depends on
reasoning about a control as a real interface rather than as markup. Invoke either only
where it does work you would otherwise do by hand.

## Step 5 — Report anything you find, fix nothing else

If you observe any other defect while working on these four screens — a frame that
grows to fit content, a structural imbalance, a status shown without both icon and
text, a touch-operated control below the scaled 44px minimum, or terminology outside
the standard — record it against the screen and report it. Do not fix it in this pass.

The three open owner decisions stand and are not yours to resolve: the set's real
frame sizes of 272px mobile and 820px desktop against the standard's literal table;
the absence of EnforcementMAPS tablet and laptop/desktop wireframes; and
EnforcementMAPS Web as a fourth surface missing from the standard's surface table.

## Step 6 — Update the continuation records

Update `handoff.md` with the markers added per screen, entries deliberately left
unmarked, the reconciliation result, visual verification status, and any defect
observed but not actioned. Update `github.md` with the files touched. Record that the
Sequence 1 pre-convention marker gap is now closed for `1a`, `1b`, `1c` and `1g`.

## Step 7 — Summarise inline

Close with a summary in the chat, under 300 words:

1. Markers added per screen, with marker and entry counts and confirmation that
   reconciliation passed in both directions.
2. Entries deliberately left unmarked, named, with the reason.
3. Visual verification result and `div`-balance confirmation for each of the four
   files.
4. Defects observed but not actioned.
5. What the next session should pick up first.

Lead with the conclusion in each section. Omit preamble and narration of your steps.
