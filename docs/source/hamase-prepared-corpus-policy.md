# Hamase prepared corpus policy

This file defines how Bebop Reader implementation work must consult 『チャーリー・パーカーの技法』.

## Canonical source location

For this project, **do not read or analyze the EPUB directly**.

Use the prepared corpus on Google Drive as the source material:

`https://drive.google.com/drive/folders/1CKe_AbiZLbIXwMimz2v4cUnkpDLbVXRa`

The old Google Doc `epubの扱い方` is historical guidance only and is superseded by this policy for Bebop Reader.

## Required lookup order

Consult the prepared corpus in this order:

1. `corpus/corpus_index.json`
2. `corpus/chapter_map.csv`
3. `corpus/visual_index.json`
4. `manifest.json`
5. `chapters/*.md` or `page_text/page_XXXX.md`
6. when notation, a diagram, or a visual claim matters: `pages/page_XXXX.jpg`

## Reading rules

- Prefer Markdown for understanding the prose.
- Do not decide that a Drive path is inaccessible merely from the path string. Search/fetch the actual file through the Google Drive connector.
- When a claim depends on notation or a figure, fetch and **visually inspect the corresponding page image** before using it as evidence.
- Page text and page images share the page number. Example: `page_text/page_0020.md` ↔ `pages/page_0020.jpg`.
- OCR or extracted text may help locate material but is not sufficient evidence for notation, layout, or figures.
- Ask the user to upload a source file only after an actual Drive search/fetch confirms that the required prepared-corpus file cannot be found.

## Relationship to versioned project docs

The prepared corpus is source evidence, not a higher-order product specification. It informs Hamase-derived analysis and material generation, but it does not override:

1. `docs/spec/product-spec-v0.9.md`
2. `docs/spec/curriculum-spec-v1.md`
3. `docs/pedagogy/material-policy-rev3.md`

The cross-chapter analysis at `docs/research/cross-chapter-analysis-rev.md` interprets the prepared corpus for material generation and is likewise subordinate to those documents.
