# 幼鋒會榮譽證 — 編輯指引

## 原則

| 內容 | 放哪裡 | 原因 |
| --- | --- | --- |
| 要求、答案、帶領提示 | `content/{category}/*.md` | 易讀、易改 |
| `id` / `code` / `status` 等欄位 | 同一檔的 YAML frontmatter | 仍可人手改，但格式固定 |
| 型別、搜尋、渲染 | `lib/**/*.ts`、`components/**` | 給程式用，唔好塞長文 |

**唔好**再把榮譽證正文寫返入 TypeScript（舊的 `honors-data.ts` 已棄用）。

## 改現有榮譽證

1. 打開 `content/{category}/{id}.md`
2. 改 `## 要求` / `## 答案` 正文
3. 需要時先改 frontmatter（例如核對後把 `status` 改成 `reviewed`）
4. 本地開 `/adventurer-honors` 抽查顯示

欄位與正文結構詳見 [authoring-sample.md](./lib/markdown/samples/authoring-sample.md)（頁面「Markdown 樣式」亦會顯示）。

## 新增榮譽證

1. 複製 [new-honor-template.md](./lib/markdown/samples/new-honor-template.md)
2. 存成 `content/{category}/{id}.md`（`id` 與檔名一致，例如 `you4920-swimmer-ii.md`）
3. 填 frontmatter 與要求／答案
4. 如有 badge／docx／PDF 頁，一併放入 `public/adventurer-honors/`（跟現有 code 命名）

## 大量改動

用腳本讀寫 markdown（經 `lib/data/serialize.ts`），例如 `npm run rewrite-honor-markdown-files`。唔好重建單一巨型 `.ts` 資料檔。

## 追蹤清單

新補榮譽證進度見 [NEW-HONORS-CHECKLIST.md](./NEW-HONORS-CHECKLIST.md)。
