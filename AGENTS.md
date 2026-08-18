# Bebop Reader — Agent Instructions

Before changing implementation, curriculum, or learning materials, read `docs/README.md` and the canonical documents it points to. Do not implement from conversation memory or an old summary alone.

## Source of Truth

When documents conflict, use this order:

1. `docs/spec/product-spec-v0.9.md`
2. `docs/spec/curriculum-spec-v1.md`
3. `docs/pedagogy/material-policy-rev3.md`
4. GitHub `main` / current implementation
5. legacy specifications, only for historical context

Supporting documents do not override the hierarchy above:

- `docs/research/cross-chapter-analysis-rev.md` — analysis for converting Hamase / Parker theory into material-generation grammar.
- `docs/implementation/implementation-plan.md` — implementation order; revise the plan if it conflicts with higher-order documents.

## Required pre-implementation checks

For every implementation or curriculum/material change:

- Read the relevant Product SPEC section.
- Read the corresponding Curriculum Stage.
- Check the material-policy document for contradictions.
- For Hamase-derived material, also read the cross-chapter analysis.
- When a score example is involved, use the prepared corpus in the order specified by `docs/source/hamase-prepared-corpus-policy.md` and visually inspect the actual source page image when notation or a figure matters.

## Product invariant

The learner's central action remains:

**ordinary staff notation → audiate internally → sing on time without stopping the music**

Hamase concepts such as LINEAR LINE, CELL, Chord Change, Relative Major / Minor, and related analyses are primarily internal grammar for generating and sequencing material. Do not turn theory analysis itself into the learner's task unless a higher-order spec explicitly requires it.

New material should preserve continuity from known structure:

**SEED → GROW → CHANGE → MOVE → FLOW**

Before adding a Phrase Family variant, explicitly state the Family's structural invariant. Do not infer structural targets from the first or last surface note. Phrase Variant, Harmony/Form context, and Presentation Mode should remain separable unless the canonical specs require coupling.

## Source book / prepared corpus

Do not read the EPUB directly for implementation decisions. Keep the prepared corpus and page images in Google Drive; Git stores the policies and analysis, not the large source corpus. Follow `docs/source/hamase-prepared-corpus-policy.md`.
