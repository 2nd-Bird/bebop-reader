# Structural Invariant Audit — implementation guardrails

Status: required implementation addendum derived from the current Curriculum Spec v1 and material policy rev3.

This document records the corrections discovered while auditing Stage 7 / 8 / 13 against the prepared Hamase corpus. It does not override Product SPEC, Curriculum Spec, or material policy. Where an older Implementation Plan example, test, or code path conflicts with the rules below, correct the lower-order artifact.

## 1. Core correction

Do **not** define Phrase Family identity by literal equality of the first and last notes in a visible Variant.

The invariant belongs to the musical structure declared by the Phrase Family. Depending on the Family, that may include:

- LINEAR LINE target sequence
- a target relation such as G→F
- CELL identity
- harmonic interpretation / role
- directional motion
- rhythmic anchor / placement
- voice-leading relation

`Variant.notes` is surface notation. `notes[0]` and `notes[-1]` are not universal structural boundaries.

A Variant may therefore begin before its first structural target or continue after a structural target while preserving the Family invariant.

## 2. Required data-model separation

Phrase Family should be able to declare at least:

```js
{
  invariant,
  structuralTargets
}
```

Variant should be able to declare at least:

```js
{
  notes,
  structuralTargetIndices,
  entryRole,
  exitRole,
  continuationRole
}
```

When a Variant performs a restart / continuation transform, it may additionally declare operator-specific metadata such as:

```js
{
  operationType,
  restartEntryIndices
}
```

Structural targets must be validated as real, non-rest notes. They must not be inferred from surface endpoints when explicit metadata exists.

## 3. Stage 7 — CELL Grammar

CELL identity is not equivalent to `surface[0]` + `surface[-1]`.

For a G→F Family:

- declare G→F as the structural target relation
- record which visible notes realize those targets
- allow later Variants to add material before, between, or after structural targets if the declared CELL identity still survives

Current compact Stage 7 examples may all happen to begin on G and end on F. That is a property of those examples, not a universal test contract.

Forbidden regression:

```js
assert(notes[0] === 'G4' && notes.at(-1) === 'F4')
```

Preferred regression:

```js
assert(structuralPitches(variant).join(',') === 'G4,F4')
```

## 4. Stage 8 — Ornament as Direction

Target-directed ornament explicitly requires structural target and surface boundary to be separable.

Prepared-corpus evidence includes:

- ex.032: `D–C–B–C` turn around structural C. The target occurs before the surface is complete.
- ex.043: the phrase begins with a double appoggiatura before the structural parent target.
- ex.044 / ex.045: double-appoggiatura material itself can be horizontally expanded.

Therefore Stage 8 must support both:

1. **pre-target surface** — visible notes before the first structural target
2. **post-target continuation** — visible notes after a structural target before the ornament completes

A regression fixture should intentionally contain a surface whose `notes[0]` is not the first structural target. Another should contain a structural target before `notes[-1]`.

A four-beat Training 4 window may be retained for current Stage 8 examples as a presentation scaffold. It must not be treated as the definition of ornament identity.

## 5. Stage 13 — Density / Double Time

Stage 13 contains at least two distinct operators and tests must keep them separate.

### 5.1 DENSITY_EXPANSION — ex.267 pattern

Prepared source: ex.267, p232.

Verified source relation:

- local structural `g→f`
- Gm7b5 (= Bbm6) 1→7 inside Eb7(#11,13)
- arpeggiation
- passing-tone / scalar filling
- chromaticization
- rhythmic placement contributes to the expansion

A pedagogical four-beat density ladder is valid as a scaffold:

`2 notes → arpeggio → scalarization → chromaticization → rhythmic compression`

But four beats and literal surface endpoint equality are **not** universal Stage 13 invariants.

### 5.2 CELL_RESTART_EXTENSION — ex.268 pattern

Prepared source: ex.268, p233.

Verified operation:

`cell expansion → exit → reinterpret exit/connector as next entry → restart same generating unit`

This may lengthen the phrase. Tests must permit an internal structural exit to be followed by new entry material before the next structural target.

Do not model ex.268 as blind concatenation of an identical surface array.

## 6. Source provenance vs pedagogical application

When a source example supplies an **operator** rather than the exact learner-facing phrase, metadata must distinguish the two.

For example, the Stage 13 G7 material may use the ex.267 density operator while applying it to a previously known C-key / G7 G→F cell.

Do not describe that as a simplified transcription of ex.267.

Record separately:

- source example / page
- source harmony / analytic role
- extracted operator
- pedagogical application
- adaptation statement

The same rule applies to ex.268 restart semantics.

## 7. Test rules

Tests should assert musical contracts at the same abstraction level as the specification.

### Required

- Phrase Family declares its invariant.
- structural targets are explicit when surface boundaries can differ.
- structural target indices are valid notes.
- target order / relation survives the transform.
- provenance and pedagogical adaptation are not conflated.
- Stage 8 includes pre-target and post-target-continuation regressions.
- Stage 13 distinguishes density expansion from restart extension.
- fixed BPM remains independent from density.

### Forbidden as universal assertions

- every Variant starts on the first structural target
- every Variant ends on the last structural target
- every Stage 13 Variant is exactly four beats
- ex.268 is represented by `surface.concat(surface)` without restart-entry semantics

Local tests may still assert a fixed surface boundary or phrase window when that exact pedagogical fixture intentionally requires it. Such assertions must be scoped to the fixture, not presented as the Phrase Family invariant.

## 8. Prepared-corpus anchors

For future audit or implementation work, re-fetch and visually inspect the prepared pages rather than relying on this summary alone.

Key anchors used in this audit:

- ex.032 — page 34 — turn around C
- ex.043 — page 38 — phrase begins with double appoggiatura before parent target
- ex.044 / ex.045 — following pages — horizontal expansion of double-appoggiatura material
- ex.267 — page 232 — density expansion of local G→F cell
- ex.268 — page 233 — exit / entry reinterpretation and cell restart

Follow `docs/source/hamase-prepared-corpus-policy.md` for the required lookup order and image verification procedure.

## 9. Implementation Plan correction rule

Until every older implementation-plan example has been rewritten, read `docs/implementation/implementation-plan.md` together with this audit addendum.

If the plan or an existing PR encodes literal endpoint equality or a universal fixed-span rule for Stage 7 / 8 / 13, treat that as an outdated lower-order assumption and replace it with the structural-invariant contract defined by the current Curriculum Spec and material policy.
