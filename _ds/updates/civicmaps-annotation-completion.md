---
name: civicmaps-annotation-document-completion
description: Instructional prompt for producing the missing wireframe annotation documents identified by the CivicMAPS compliance audit, covering approximately 90 unannotated screens across sequences S10–S16 and S19–S25. Governs inventory verification, marker extraction, entry authoring, bidirectional reconciliation and handoff. Use at the start of a Claude Code session working in the CivicMAPS Multi-Jurisdiction directory.
model: claude-sonnet-5
effort: high
surface: claude-code
version: 1.0
governed_by: wireframe-standard.md, viewport-framing.md
---

# CivicMAPS Annotation Document Completion — S10–S16, S19–S25

You are working in the repository directory
`SKYNET/CivicMAPS/CivicMAPS Multi-Jurisdiction`. Wireframe sequence files sit at the
root of that directory; annotation documents belong in the same directory as the
graphic they accompany.

The compliance audit found approximately 90 wireframe screens carrying numbered
markers on the graphic with no accompanying annotation document. Those screens fall
in sequences S10 to S16 and S19 to S25. Their phase cannot be built until every one
of those screens has a complete annotation document. Producing those documents is
the whole of this task.

## Step 1 — Read the standards in full before writing anything

Read these two files end to end before drafting a single annotation entry:

- `SKYNET/CivicMAPS/CivicMAPS Multi-Jurisdiction/_ds/wireframe-standard.md`
- `SKYNET/CivicMAPS/CivicMAPS Multi-Jurisdiction/_ds/viewport-framing.md`

Read each completely. Do not skim, sample, truncate, or read only the sections that
appear to concern annotations — the marker convention, screen identity rules, frame
rules and missing-information rules all bear on what an entry may and may not say.
Where the two touch the same subject, `wireframe-standard.md` governs.

Then read the current `handoff.md` and `github.md`, and read at least three existing
annotation documents that have already been accepted. Those accepted documents define
the house form for this set: heading structure, entry order, key format, tone,
sentence length and the level of detail an entry carries. Match them. Do not design a
new document format.

## Step 2 — Establish the real inventory before producing anything

The audit figure of roughly 90 screens and the ranges S10–S16 and S19–S25 are a
starting estimate, not a verified list. Two discrepancies in the record must be
resolved by direct inspection before you write:

1. An earlier session recorded that annotation documents `WF-S10` through `WF-S15`
   were written. The audit now lists S10 to S16 as unannotated. Open those sequences
   and their directory and determine what actually exists — a document that is
   present but incomplete, stale against a rebuilt graphic, or missing entirely are
   three different findings and each needs naming.
2. The audit range extends to S25, while prior work treated the set as S1 to S24.
   Confirm whether S25 exists. If it does, include it. If it does not, record that
   the audit range was wrong and stop at S24.

Then, for each of S10, S11, S12, S13, S14, S15, S16, S19, S20, S21, S22, S23, S24 and
S25 — every one of them, individually, including any the audit implies is already
handled — record:

- Every screen id in the sequence, taken from `.dv-oid`.
- Every `.mk` marker on each of those screens, with its number.
- Whether an accompanying annotation document exists, and which screens and markers
  it already covers.
- The gap: the specific screen-and-marker pairs with no entry.

Produce this inventory in full and state your screen and marker totals against the
audit's approximate 90 before you begin authoring. If your count differs materially,
say so and say why. Do not begin writing entries from the audit's ranges alone.

## Step 3 — Author the annotation documents

For every gap identified in Step 2, write the annotation entry. Work sequence by
sequence and complete each sequence's document before moving to the next.

Rules for every entry:

- **Key format.** Every entry is keyed to `screen-id + marker` — `24b-2`, never a
  bare `2`. Markers restart at 1 on each screen, so a bare number is ambiguous across
  a page.
- **Content source.** Entry text comes from what the graphic actually shows and from
  annotation prose that has drifted onto the graphic as inline caption text. Extract
  that drifted prose into the document. Where a screen carries inline captions, strip
  them from the graphic once their content is in the document, leaving the numbered
  markers in place. Markers stay on the graphic; nothing else does.
- **Behaviour belongs here.** The `.dv-olabel` on the graphic names the screen. What
  the screen does, how a control behaves, what a state means, what happens on
  interaction — all of that is an annotation entry, not graphic text.
- **Fold position.** Where a screen's content exceeds its viewport, record the fold
  position in the document, not on the graphic.
- **Terminology.** Australian English, sentence case for headings, labels and
  actions, uppercase only for compact operational status labels and approved code
  labels. Dates as `DD/MM/YYYY`. Identifiers reproduced exactly. Full product names —
  CivicMAPS, CommandMAPS, EnforcementMAPS — never `cmaps`. Role labels used
  accurately: inspector, ranger, contractor, field worker, dispatcher, reviewer,
  administrator, public user, with "officer" reserved for enforcement officers.
- **Do not invent.** Do not write legal, legislative, evidence, custody, delegation or
  operational rules to fill an entry. Where the marker's meaning is not established by
  the graphic, the design system or an authorised source, mark the entry
  `DECISION REQUIRED` or `OWNER VALIDATION REQUIRED` against that screen and marker
  and leave it unresolved. Where domain detail is unavailable but the entry is
  otherwise sound, mark the content as representative. An invented annotation is
  worse than a missing one, because the build will be run against it.

## Step 4 — Reconcile in both directions, per sequence

Before closing each sequence, confirm both directions and state the result:

- Every `.mk` marker on every graphic in the sequence has exactly one entry in the
  accompanying document.
- Every entry in the document corresponds to a marker that exists on a graphic.

Report the marker count and the entry count for each sequence. A sequence where the
two numbers match but the pairing is wrong is still a failure — check the pairing,
not just the totals.

## Step 5 — Stay inside scope

Write and edit annotation documents, strip inline caption text from graphics where
its content has been moved into a document, and update the continuation records in
Step 6. Do nothing else.

Specifically: do not change frame dimensions, do not reposition or renumber markers,
do not alter the `.dv-*` scaffold, do not restructure sequences, and do not edit the
design system or either standard file. If you find a defect of any of those kinds
while reading a graphic — including any frame that grows to fit content instead of
holding its stated height, any structural `div` imbalance, or any touch-operated
control below the scaled 44px minimum — record it against the screen and report it.
Do not fix it in this pass.

The three open owner decisions stand and are not yours to resolve: the set's real
frame sizes of 272px mobile and 820px desktop against the standard's literal table;
the absence of EnforcementMAPS tablet and laptop/desktop wireframes; and
EnforcementMAPS Web as a fourth surface missing from the standard's surface table.

Use `/dev-automation-suite` for verification and quality-gate work where it enforces
a check you would otherwise perform by eye — marker-to-entry reconciliation across a
sequence is the clearest case. Use `/building-native-ui` where a marker sits on a
control whose behaviour must be reasoned about as a real interface before it can be
described accurately. Invoke either only where it does work you would otherwise do by
hand.

## Step 6 — Update the continuation records

On completion, update:

- `handoff.md` — sequences completed, screens and markers annotated, sequences left
  incomplete and why, every entry left as `DECISION REQUIRED` or
  `OWNER VALIDATION REQUIRED`, and every defect observed but not actioned.
- `github.md` — the sync record, listing every sequence and document touched.

## Step 7 — Summarise inline

Close with a summary in the chat, under 500 words, structured as:

1. Verified inventory: sequences, screens and markers, against the audit's ~90
   estimate, with the S10–S15 and S25 discrepancies resolved.
2. Annotation documents produced or completed, by sequence, with marker and entry
   counts and confirmation that reconciliation passed in both directions.
3. Entries left unresolved, keyed to screen and marker, with what is needed to close
   each one.
4. Defects observed but deliberately not actioned, by sequence.
5. What the next session should pick up first.

Lead with the conclusion in each section. Omit preamble, restatement of this brief,
and narration of the steps you took.
