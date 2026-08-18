# Bebop Reader — Free Flow Contract v1

Status: **Normative appendix to Curriculum Spec v1 Stage 14 / FLOW**.

This appendix resolves the runtime/scoring contract for the `Free Flow` step in:

**READ → Repeat → Mutation → Connect → Trade → 4 bars → 1 Chorus → Free Flow**

It is subordinate to Product SPEC v0.9 and Curriculum Spec v1. If this appendix conflicts with either higher document, the higher document wins.

---

## 1. Free Flow is constrained recombination, not arbitrary improvisation

Free Flow does not mean:

- erase the score completely;
- ask the learner to improvise anything;
- stop evaluating whether known musical language remains available on time.

Free Flow means:

**ordinary staff cue → audiate → sing → reuse / choose / recombine already-mastered Phrase Family chunks while transport and form continue**.

The learner is not asked to name the Family, CELL, harmony function, or transform operator.

---

## 2. v1 first field: one complete C Blues chorus

The first Free Flow implementation uses:

- form: `c-blues-12`
- duration: 12 bars / 48 SING beats
- key: C in the first production slice
- Family: `g-to-f-surfaces`

This follows successful ordinary one-chorus FLOW.

C Blues Free Flow becomes the final C Blues FLOW gate before automatic progression to Rhythm Changes.

Rhythm Changes Free Flow is a later extension of the same interaction/scoring model; it is not silently invented in this first slice.

---

## 3. What remains visible

The staff is never replaced by an analysis diagram or theory prompt.

The 12-bar score remains an ordinary treble staff with:

- clef / key signature / meter;
- barlines;
- full form harmony labels;
- three **cue bars** at bars 1, 5, and 9;
- ordinary empty measures in the other nine bars.

Each cue bar contains one already-mastered one-bar Variant from the designated Phrase Family.

Initial v1 cue Variant:

`gf-cell-seed`

The cue is a musical launch point, not a label explaining the internal structure.

This is intentionally less scaffold than Recall / One Chorus, but it is not a blank-score arbitrary-improvisation task.

---

## 4. Valid response space

### Cue bars

At bars 1, 5, and 9, the visible notated cue is the expected target. The learner should read and sing that cue on time.

### Free bars

At the other nine bars, any already-approved one-bar Variant from the same Phrase Family is a valid response candidate.

Initial v1 candidate set:

- `gf-cell-seed`
- `gf-cell-return`
- `gf-cell-fan`

The learner does not tap/select a candidate before singing.

The scoring system infers which known chunk was sung by comparing the performed bar against all valid candidate score models and taking the best musical match.

A response that does not sufficiently match any known candidate is not treated as a successful known-chunk reuse in v1. This is deliberate: v1 Free Flow is **recombination of acquired vocabulary**, not unrestricted open improvisation.

---

## 5. Form / harmony behavior

Transport and C Blues harmony continue for the full chorus.

Candidate Phrase Variants are realized at Learning Event time in the actual form slot, using the same form-transfer mechanism already used by Stage 14.

Phrase Variant identity remains separate from Harmony / Form.

Free Flow does not create twelve new form-specific Variants.

---

## 6. Scoring model

Single-target whole-phrase scoring is insufficient because the nine free bars have multiple valid answers.

Free Flow scoring is therefore **bar-segmented**.

For each 4-beat bar:

1. isolate the performed samples belonging to that bar;
2. construct each valid candidate as an ordinary four-beat score model in the active key;
3. evaluate the bar using the normal movable-do reading scorer;
4. for a cue bar, use only the visible cue candidate;
5. for a free bar, select the candidate with the highest `readScore`;
6. record the matched `variantId`, bar `readScore`, note accuracy, timing, and continuity.

The normal ±85-cent reading tolerance and octave folding remain in force.

No generative-AI judgment is introduced.

---

## 7. Free Flow success evidence

A C Blues Free Flow chorus counts as successful when all of the following are true:

1. the full 48-beat SING window completes without transport interruption;
2. whole-chorus continuity is at least **70**;
3. all three visible cue bars score at least **65**;
4. at least **7 of the 9** free bars have a best known-Variant match with `readScore >= 65`;
5. the successful free bars contain at least **two distinct matched Variants**.

The 65 threshold corresponds to an ordinary three-star readable bar rather than requiring polished intonation.

The diversity condition prevents Free Flow from being passed by repeating one seed mechanically for the entire chorus.

A failed Free Flow chorus does not stop transport and does not erase prior one-chorus mastery.

---

## 8. Result / mastery integration

Free Flow remains a FLOW presentation, not COLD READ Variant mastery.

The event records:

- `flowAction: FREE_FLOW`
- `freeFlowPassed`
- matched Variant per bar
- successful free-bar count
- matched Variant diversity
- whole-chorus continuity

It must not fabricate:

- Variant cold-read coverage;
- Harmony cold-read coverage;
- new Phrase Variant identity.

C Blues Stage 14 readiness requires the existing C Blues cold-form transfer evidence plus the ordered FLOW path through successful Free Flow.

---

## 9. Learner-facing copy

Keep copy experiential and short.

Recommended badge:

**合図から、自由につなぐ**

Do not display:

- candidate Variant names;
- CELL / LINEAR LINE terminology;
- match-selection details during SING;
- red/green per-note feedback during the chorus.

Detailed matched-bar analysis may be kept internally or shown only after the Session if later product work needs it.

---

## 10. Non-goals of v1

This first contract does not yet implement:

- unrestricted notes outside known Phrase Variants;
- model-generated improvisation scoring;
- scoreless arbitrary improvisation;
- automatic Rhythm Changes Free Flow;
- user-facing theory analysis;
- a new Hamase-derived Phrase Family.

The next expansion should generalize the same cue/recombination scorer to Rhythm Changes after the C Blues interaction is validated in practice.
