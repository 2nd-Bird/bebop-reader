# Bebop Reader — Key Unlock Contract v1

Status: **Normative appendix to `docs/spec/curriculum-spec-v1.md` §14 Key Unlock**.

This document resolves the Key Unlock threshold that Curriculum Spec v1 intentionally left unspecified. It is subordinate to Product SPEC v0.9 and is part of the Curriculum Spec layer of the Source of Truth. If this appendix conflicts with `product-spec-v0.9.md` or `curriculum-spec-v1.md`, the higher document wins.

---

## 1. Purpose

Key Unlock is a separate progression axis from Stage progression.

Canonical order:

**C → F → B♭**

The purpose is not to teach new grammar in a new key. The learner should experience:

**same musical structure / different ordinary-staff location**.

Therefore a Phrase Family may be transferred to a new key only after that Family is already mastered in its source C curriculum context.

---

## 2. Two different states: global key unlock and per-Family transfer eligibility

Do not collapse these into one flag.

### Global key unlock

A key becoming globally unlocked means that key may appear as a transfer world in normal scheduling.

### Per-Family transfer eligibility

A Family may appear in F only after its C Family mastery is complete.

A Family may appear in B♭ only after:

1. its C Family mastery is complete, and
2. its F key-transfer mastery is complete.

This preserves the order **C → F → B♭** inside each musical structure even after the global key world has opened.

A new Stage / Phrase Family is always learned first in C.

---

## 3. F unlock gate

F unlocks globally when the learner has completed the C curriculum through **Stage 3 — Make the Line** and therefore Stage 4 is unlocked.

Operationally:

`stageProgress.currentStage >= 4`

is sufficient because Stage progression already requires the Stage 0–3 required Families to satisfy their normal COLD READ mastery gates.

Why Stage 3 is the boundary:

- Staff Anchor is established.
- DO / SOL can be sung in time.
- Tonic Shape is established.
- the learner has begun to read a short line as a structure rather than isolated notes.

This is the first point where changing staff location tests transfer of known reading structures rather than introducing the reading system itself.

F unlock does **not** mean Stage 4+ material may be introduced first in F. Later Families become F-eligible only after each one is mastered in C.

---

## 4. Foundation transfer set for B♭ unlock

B♭ remains globally locked until the learner has demonstrated stable F transfer for every Stage 0–3 Family:

- `anchor-do-sol`
- `do-sol-in-time`
- `tonic-shape`
- `descend-to-mi`
- `descend-to-do`

This set deliberately measures the same foundation that opened F: landmark reading, tonic/fifth time-feel, tonic shape, and short line reading.

B♭ does not wait for later harmony / CELL / Relative Major material. Those later Families still obey per-Family C → F → B♭ eligibility as they are learned.

---

## 5. Key-transfer mastery for one Family

Key-transfer mastery is separate from ordinary C Family mastery.

For a target key and Family, mastery requires:

1. **scaffold-free presentation only**: `COLD_READ` or `DELAYED_READ`;
2. **readScore >= 78** for a successful transfer read;
3. successful transfer reads in **at least two distinct Sessions**;
4. when the Family has at least two cold-readable Variants, successful evidence must cover **at least two distinct Variants**.

BUILD and TEACHER_CALL do not count toward key-transfer mastery.

A failed transfer read may receive the normal non-blocking recovery behavior, but failure does not revoke an already unlocked key and does not create transfer mastery evidence.

The key axis therefore measures retained staff-location transfer rather than a one-off lucky read.

---

## 6. B♭ unlock gate

B♭ unlocks globally when all five Foundation transfer Families in §4 satisfy the F key-transfer mastery rule in §5.

Once B♭ is globally unlocked, a later Family becomes B♭-eligible only after its own F key-transfer mastery is complete.

This keeps the key sequence ordered inside every Family:

**C mastery → F transfer mastery → B♭ transfer eligibility**.

---

## 7. Scheduler contract

Key transfer remains lower priority than learning the current C grammar and higher priority than optional closing FLOW, matching Curriculum Spec v1 Scheduler priority.

For ordinary Training 4 / Phrase 8 Sessions:

- schedule at most **one key-transfer Learning Event per Session** initially;
- choose an already-mastered C Family that still lacks the next-key transfer evidence;
- use `COLD_READ` or `DELAYED_READ` only;
- do not create a new Phrase Variant for the target key;
- realize notation, harmony, model/scoring targets and tonal orientation through the Key axis at Learning Event time.

The rest of the Session may remain in C. `LearningEvent.key` is therefore allowed to differ from `SessionPlan.key`.

### Form sessions

Do not switch key inside one Blues / Rhythm Changes chorus merely to satisfy a transfer review slot.

A form-level key transfer is form-wide. F/B♭ Blues or Rhythm Changes should be scheduled only after the corresponding C form capability is already established. Until that form-level scheduling rule is implemented, key-transfer review may remain in Training 4 / Phrase 8 fields.

---

## 8. Persistence contract

`keyProgress` must persist independently from `familyMastery`.

At minimum it must represent:

- global unlock state for C / F / B♭;
- per-key, per-Family successful transfer Session IDs;
- successful transferred Variant IDs;
- last successful transfer time.

Non-C transfer results must not fabricate C Variant/Harmony cold-read coverage or advance a Stage gate by themselves.

Stage progression and Key progression remain separate axes.

---

## 9. UX contract

Progress may show C / F / B♭ as separate worlds.

- C: available from the start.
- F: locked until Stage 3 C mastery is complete.
- B♭: locked until the F Foundation transfer gate is complete.

The learner-facing task remains ordinary:

**see the staff → audiate → sing on time**.

Do not expose “key-transfer mastery”, scale-degree analysis, CELL names, Relative Major, or other internal grammar as a quiz.

---

## 10. Non-goals

This contract does not:

- make F or B♭ a separate new curriculum;
- duplicate Phrase Variants by key;
- require absolute-pitch singing;
- change Stage unlock requirements;
- define Free Flow;
- require a full F/B♭ Blues or Rhythm Changes implementation before early key-transfer review can begin.
