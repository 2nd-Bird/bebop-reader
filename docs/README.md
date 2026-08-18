# Bebop Reader documentation

This directory is the canonical home for the project's versioned product, curriculum, pedagogy, analysis, implementation, and source-handling documents.

After the documentation-migration PR is merged, edit these Markdown files through normal Git branches / pull requests. Google Drive copies may remain as convenient mirrors or archives, but they should not be treated as newer merely because they were edited later outside Git.

Large source material is the exception: the prepared Hamase corpus, page text, and page images remain in Google Drive. Git stores the policy for how those sources must be consulted.

## Canonical hierarchy

When guidance conflicts, use this order:

1. [`spec/product-spec-v0.9.md`](spec/product-spec-v0.9.md) — product UX, game loop, system responsibilities, technical requirements.
2. [`spec/curriculum-spec-v1.md`](spec/curriculum-spec-v1.md) — what is learned, in what sequence, and as what kind of Learning Event.
   - [`spec/key-unlock-contract-v1.md`](spec/key-unlock-contract-v1.md) is the normative appendix to Curriculum Spec v1 §14. It defines the detailed C → F → B♭ unlock / transfer-mastery contract at the same Source-of-Truth layer as the Curriculum Spec, while remaining subordinate to the main Curriculum Spec text if they conflict.
3. [`pedagogy/material-policy-rev3.md`](pedagogy/material-policy-rev3.md) — learning philosophy and material-design principles.
4. GitHub `main` / current implementation — implementation evidence, subordinate to the three documents above but preferred over legacy specs.
5. Legacy specs — history only.

## Supporting documents

- [`research/cross-chapter-analysis-rev.md`](research/cross-chapter-analysis-rev.md) — Hamase / Charlie Parker cross-chapter analysis. Use it to convert theory into material-generation grammar; it never overrides Product SPEC, Curriculum Spec, or material policy.
- [`implementation/implementation-plan.md`](implementation/implementation-plan.md) — implementation order. If it conflicts with a higher-order source, change the plan rather than the higher-order source by implication.
- [`implementation/structural-invariant-audit.md`](implementation/structural-invariant-audit.md) — required audit guardrails for structural target vs surface boundary, Stage 7 CELL identity, Stage 8 ornament boundaries, Stage 13 density/restart semantics, source provenance, and regression tests. Read this together with the Implementation Plan for those areas.
- [`source/hamase-prepared-corpus-policy.md`](source/hamase-prepared-corpus-policy.md) — how to consult the prepared book corpus. The corpus and page images remain on Google Drive.

## Change workflow

1. Change documents in Git, on a branch.
2. Review the diff in a pull request just like code.
3. If an implementation change exposes a spec problem, update the governing document explicitly in the same PR or a linked docs PR instead of silently encoding a new rule in tests/code.
4. Implementation PRs should cite the relevant document path / section.
5. For Stage 7 / 8 / 13 or any code/test that interprets Phrase Family boundaries, read the structural-invariant audit before implementation.
6. For Hamase-derived material, also cite the relevant prepared-corpus source/page and visually verify notation/figures where applicable.

## Why Git is canonical

These documents are tightly coupled to code. Git gives them the same version history, diffs, review path, branches, commits, and implementation context as the code they govern. Google Drive remains better for heavy source corpora, page images, and reading/reference material, so the project deliberately uses a hybrid model rather than forcing all artifacts into one store.

The repo root [`AGENTS.md`](../AGENTS.md) is the machine-facing entry point for implementation agents.
