# Pre-markdown migration scripts (archived)

These scripts read and wrote honor data in the old `honors-data.ts` TypeScript array format. They are **obsolete** after the markdown migration (`content/{category}/*.md`).

Use the maintained tooling instead:

| Task | Script |
| --- | --- |
| Rewrite frontmatter / body formatting | `npm run rewrite-honor-markdown-files` |
| Normalize `answerSource` frontmatter | `node scripts/standardize-answer-source.mjs` |
| Download Word documents | `python3 scripts/download-honor-documents.py` |
| Download badge images | `python3 scripts/download-honor-images.py` |
| Extract handbook PDF pages | `python3 scripts/extract-honor-pdf-pages.py` |
| Audit missing HKMC docx links | `python3 scripts/fetch-honor-downloads.py` |

If you need to revive batch answer workflows, port them to read/write markdown via `lib/data/serialize.ts` patterns (see `rewrite-honor-markdown-files.ts`).
