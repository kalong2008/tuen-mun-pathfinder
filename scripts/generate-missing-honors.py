#!/usr/bin/env python3
"""Generate missing adventurer honor markdown + assets from ZH/EN handbooks.

Creates:
  - app/adventurer-honors/content/{category}/*.md
  - public/adventurer-honors/{CODE}.png (badge cropped from ZH handbook)
  - public/adventurer-honors/pdf-pages/{CODE}-{zh,en}.pdf

Skips YOU4056 (Left & Right alias of existing HKA4056).
Remaps Horsemanship from duplicate YOU4755 → YOU4995 (Magnet Fun I keeps YOU4755).
"""

from __future__ import annotations

import re
import sys
from dataclasses import dataclass, field
from pathlib import Path

import fitz
from pypdf import PdfReader, PdfWriter

ROOT = Path(__file__).resolve().parents[1]
CONTENT_DIR = ROOT / "app" / "adventurer-honors" / "content"
PUBLIC_DIR = ROOT / "public" / "adventurer-honors"
PDF_PAGES_DIR = PUBLIC_DIR / "pdf-pages"
CHI_PDF = PUBLIC_DIR / "handbooks" / "hkmc-2023-zh.pdf"
ENG_PDF = PUBLIC_DIR / "handbooks" / "award-book-2020-en.pdf"

CODE_RE = re.compile(r"(?:HKA|YOU)\d{4}", re.I)

# Handbook printed YOU4755 for both Magnet Fun I and Horsemanship.
HORSEMANSHIP_CODE_OVERRIDE = "YOU4995"

SKIP_CODES = frozenset({"YOU4056"})  # alias of existing HKA4056 Left and Right

CATEGORY_BY_CODE_PREFIX_PAGE: list[tuple[range, str]] = [
    (range(1, 20), "community"),
    (range(20, 58), "arts-crafts"),
    (range(58, 95), "household"),
    (range(95, 135), "nature"),
    (range(135, 170), "recreation"),
    (range(170, 210), "spiritual"),
]

NAME_EN_ALIASES: dict[str, list[str]] = {
    "Habitat": ["Habitats"],
    "Habitats": ["Habitat"],
    "Pearly Gate": ["Pearly Gates", "P early Gates"],
    "Pearly Gates": ["Pearly Gate", "P early Gates"],
    "Canoer": ["Canoer/Canoeist", "Canoeist"],
    "Canoer/Canoeist": ["Canoer"],
    "Left & Right": ["Left and Right"],
    "Jesus’ Special Supper": ["Jesus' Special Supper", "Jesus’ Special Supper"],
    "Jesus' Special Supper": ["Jesus’ Special Supper"],
    "Magnet FunⅠ": ["Magnet Fun I", "Magnet FunⅠ"],
    "Magnet Fun I": ["Magnet FunⅠ", "Magnet Fun I"],
    "Build and Fly": ["Build and Fly"],
    "Postcards": ["P ostcards", "Postcards"],
    "Purity": ["P urity", "Purity"],
    "Technology": ["Technology", "Technology (formerly Computer Skills)"],
}

EN_FOOTER_FIXES: dict[str, str] = {
    "P ostcards": "Postcards",
    "P early Gates": "Pearly Gates",
    "P urity": "Purity",
    "P arables of Jesus": "Parables of Jesus",
    "P ets": "Pets",
    "P otatoes": "Potatoes",
    "Z oo Animals": "Zoo Animals",
    "Jigsaw P uzzles": "Jigsaw Puzzles",
    "My P icture Book": "My Picture Book",
}


@dataclass
class HonorDraft:
    code: str
    name_zh: str
    name_en: str
    category: str
    chi_page: int  # 0-based
    requirements_md: str
    answers_md: str = ""
    answer_source: str = "draft"
    answer_source_note: str | None = None
    aliases: list[str] = field(default_factory=list)
    eng_pages: list[int] = field(default_factory=list)


def local_codes() -> set[str]:
    codes: set[str] = set()
    for path in CONTENT_DIR.rglob("*.md"):
        text = path.read_text(encoding="utf-8")
        match = re.search(r"^code: ((?:HKA|YOU)\d+)", text, re.M)
        if match:
            codes.add(match.group(1).upper())
    return codes


def category_for_page(page_1based: int) -> str:
    for page_range, category in CATEGORY_BY_CODE_PREFIX_PAGE:
        if page_1based in page_range:
            return category
    return "household"


def slugify(name_en: str) -> str:
    slug = name_en.lower()
    slug = slug.replace("&", " and ")
    slug = slug.replace("/", "-")
    slug = re.sub(r"[^a-z0-9]+", "-", slug)
    return slug.strip("-")


def normalize_name(value: str) -> str:
    value = value.replace("\u2019", "'").replace("\u2018", "'").replace("\u2013", "-")
    value = value.replace("Ⅰ", " I").replace("Ⅱ", " II").replace("Ⅲ", " III")
    value = re.sub(r"\s+", " ", value.strip())
    return value


def parse_zh_requirements(body: str) -> str:
    """Convert ZH handbook requirement body into markdown ordered lists."""
    # Drop trailing code / page noise
    body = re.split(r"(?:HKA|YOU)\d{4}", body)[0]
    body = re.sub(r"\n?P\.\d+\s*$", "", body)
    lines = [re.sub(r"\s+", " ", ln).strip() for ln in body.split("\n")]
    lines = [ln for ln in lines if ln]

    # Merge hyphenated line wraps that don't start a new item
    merged: list[str] = []
    item_start = re.compile(r"^(\d+|[a-z]|[ivx]+|i{1,3})\.\s+", re.I)
    for line in lines:
        if merged and not item_start.match(line) and not re.match(r"^[a-z]\.\s", line):
            # continuation of previous line
            merged[-1] = f"{merged[-1]}{line}"
        else:
            merged.append(line)

    out: list[str] = []
    for line in merged:
        top = re.match(r"^(\d+)\.\s+(.*)$", line)
        if top:
            out.append(f"{top.group(1)}. {top.group(2)}")
            continue
        alpha = re.match(r"^([a-z])\.\s+(.*)$", line)
        if alpha:
            out.append(f"   {alpha.group(1)}. {alpha.group(2)}")
            continue
        roman = re.match(r"^([ivx]+)\.\s+(.*)$", line, re.I)
        if roman:
            out.append(f"      {roman.group(1).lower()}. {roman.group(2)}")
            continue
        if out:
            # attach leftover to last item
            indent = "   " if out[-1].startswith("   ") else ""
            if indent:
                out[-1] = f"{out[-1]} {line}"
            else:
                out[-1] = f"{out[-1]} {line}"
        else:
            out.append(line)

    return "\n".join(out).strip()


def extract_zh_honors(chi_pages: list[str], existing: set[str]) -> list[HonorDraft]:
    drafts: list[HonorDraft] = []
    seen_codes: set[str] = set()

    for index, text in enumerate(chi_pages):
        if not re.search(r"要求[：:]", text):
            continue
        codes = CODE_RE.findall(text)
        if not codes or len(codes) > 4:
            continue
        code = codes[0].upper()
        if code in existing or code in SKIP_CODES:
            continue

        lines = [ln.strip() for ln in text.split("\n") if ln.strip()]
        name_en = ""
        name_zh = ""
        for line in lines[:20]:
            # "Magnet FunⅠaward" has no word-boundary before award
            if re.search(r"[Aa]ward\s*$", line) or re.search(r"[Aa]ward\b", line):
                name_en = re.sub(r"\s*[Aa]ward\s*$", "", line, flags=re.I).strip()
                name_en = normalize_name(name_en)
                break
        for line in lines[:20]:
            if "榮譽證" in line:
                name_zh = line.replace("榮譽證", "").strip()
                name_zh = re.sub(r"\s+", " ", name_zh)
                break

        if not name_zh or not name_en:
            continue

        # Normalize Roman-numeral titles like "Magnet FunⅠ"
        name_en = re.sub(r"([a-z])([IVXⅠⅱⅲ]+)$", r"\1 \2", name_en, flags=re.I)
        name_en = normalize_name(name_en)

        # Horsemanship duplicate code
        aliases: list[str] = []
        note = None
        if code == "YOU4755" and "馬術" in name_zh:
            aliases.append("YOU4755")
            code = HORSEMANSHIP_CODE_OVERRIDE
            note = "HKMC 手冊將此榮譽證編號印為 YOU4755（與磁鐵樂 I 重複）；本站改用 YOU4995。"

        if code in seen_codes:
            # Second Magnet Fun I page shouldn't happen after remap
            continue
        seen_codes.add(code)

        req_match = re.search(r"要求[：:]\s*\n?(.*)", text, re.S)
        requirements_md = parse_zh_requirements(req_match.group(1) if req_match else "")

        drafts.append(
            HonorDraft(
                code=code,
                name_zh=name_zh,
                name_en=name_en,
                category=category_for_page(index + 1),
                chi_page=index,
                requirements_md=requirements_md,
                aliases=aliases,
                answer_source_note=note,
            )
        )

    return drafts


def get_page_footer(page_text: str) -> str:
    lines = [line.strip() for line in page_text.split("\n") if line.strip()]
    for line in reversed(lines):
        if line.startswith("Page "):
            continue
        if line in ("Requirements", "Supporting Answers"):
            continue
        return EN_FOOTER_FIXES.get(line, line)
    return lines[-1] if lines else ""


def find_eng_pages(eng_pages: list[str], name_en: str) -> list[int] | None:
    variants = {normalize_name(name_en).lower()}
    for alias in NAME_EN_ALIASES.get(name_en, []):
        variants.add(normalize_name(alias).lower())
    # spaced OCR variants
    compact = re.sub(r"\s+", "", name_en.lower())
    variants.add(compact)

    start: int | None = None
    for index, page_text in enumerate(eng_pages):
        if "Requirements" not in page_text:
            continue
        footer = normalize_name(get_page_footer(page_text)).lower()
        footer_compact = re.sub(r"\s+", "", footer)
        header = normalize_name(page_text[:500]).lower()
        if footer in variants or footer_compact in variants:
            start = index
            break
        if any(v in header for v in variants if len(v) > 3):
            # Prefer pages that look like honor starts
            if re.search(r"Requirements\s*\n\s*1\.", page_text) or "Originated in" in page_text:
                start = index
                break

    if start is None:
        # fuzzy: footer contains name tokens
        tokens = [t for t in re.split(r"\W+", name_en.lower()) if len(t) > 2]
        for index, page_text in enumerate(eng_pages):
            if "Requirements" not in page_text:
                continue
            footer = normalize_name(get_page_footer(page_text)).lower()
            if tokens and all(t in footer for t in tokens):
                start = index
                break

    if start is None:
        return None

    indices = [start]
    start_footer = normalize_name(get_page_footer(eng_pages[start])).lower()
    i = start + 1
    while i < len(eng_pages):
        page_text = eng_pages[i]
        lines = [ln.strip() for ln in page_text.split("\n") if ln.strip()]
        if len(lines) <= 1 and (not lines or lines[0].startswith("Page ")):
            break
        footer = normalize_name(get_page_footer(page_text)).lower()
        if re.search(r"Requirements\s*\n\s*1\.", page_text) and footer != start_footer:
            break
        if (
            "Requirements" in page_text
            and footer != start_footer
            and footer not in ("requirements", "supporting answers")
            and not footer.startswith("updated in")
            and not re.match(r"^\d+\.", footer)
        ):
            if re.search(r"Requirements\s*\n\s*1\.", page_text):
                break
        indices.append(i)
        if i > start and re.search(r"Updated in:\s*\d{4}", page_text):
            break
        i += 1
    return indices


def split_numbered_answers(body: str) -> list[tuple[int, str]]:
    matches = list(re.finditer(r"(?:^|\n)(\d+)\.\s+", body))
    if not matches:
        return []
    answers: list[tuple[int, str]] = []
    for index, match in enumerate(matches):
        num = int(match.group(1))
        start = match.end()
        end = matches[index + 1].start() if index + 1 < len(matches) else len(body)
        chunk = body[start:end].strip()
        chunk = re.sub(r"\s+", " ", chunk)
        chunk = re.sub(r"Updated in:.*$", "", chunk).strip()
        if chunk:
            answers.append((num, chunk))
    return answers


def attach_english_answers(draft: HonorDraft, eng_pages: list[str]) -> None:
    page_indices = find_eng_pages(eng_pages, draft.name_en)
    if not page_indices:
        draft.answer_source = "draft"
        draft.answer_source_note = (
            (draft.answer_source_note + "；" if draft.answer_source_note else "")
            + "英文 Award Book 未能自動對應頁面"
        )
        return

    draft.eng_pages = page_indices
    full = "\n".join(eng_pages[i] for i in page_indices)
    if "Supporting Answers" not in full:
        draft.answer_source = "draft"
        draft.answer_source_note = (
            (draft.answer_source_note + "；" if draft.answer_source_note else "")
            + "英文 Award Book 2020 未有 Supporting Answers"
        )
        return

    answers_block = full.split("Supporting Answers", 1)[1]
    answers_block = re.sub(r"^Page \d+\s*", "", answers_block, flags=re.M)
    numbered = split_numbered_answers(answers_block)
    if not numbered:
        draft.answer_source = "draft"
        return

    sections = []
    for num, text in numbered:
        # Keep English answers temporarily; mark as draft pending Chinese translation.
        sections.append(f"### 要求 {num}\n\n{text}")
    draft.answers_md = "\n\n".join(sections)
    draft.answer_source = "draft"
    draft.answer_source_note = (
        (draft.answer_source_note + "；" if draft.answer_source_note else "")
        + "答案暫為英文 Award Book 2020 Supporting Answers，待譯中文"
    )


def write_markdown(draft: HonorDraft) -> Path:
    honor_id = f"{draft.code.lower()}-{slugify(draft.name_en)}"
    aliases_block = (
        "aliases:\n" + "\n".join(f'  - "{a}"' for a in draft.aliases)
        if draft.aliases
        else "aliases: []"
    )
    note_line = (
        f'answerSourceNote: "{draft.answer_source_note}"\n' if draft.answer_source_note else ""
    )
    body_parts = [
        f"---",
        f"id: {honor_id}",
        f"code: {draft.code}",
        f'nameZh: "{draft.name_zh}"',
        f'nameEn: "{draft.name_en}"',
        aliases_block,
        f"category: {draft.category}",
        f"answerSource: {draft.answer_source}",
        note_line.rstrip("\n"),
        f"status: non-review",
        f"---",
        "",
        "## 要求",
        "",
        draft.requirements_md,
    ]
    # Remove empty note line if absent
    body_parts = [p for p in body_parts if p is not None and p != ""]
    # Rebuild more carefully
    lines = [
        "---",
        f"id: {honor_id}",
        f"code: {draft.code}",
        f'nameZh: "{draft.name_zh}"',
        f'nameEn: "{draft.name_en}"',
    ]
    if draft.aliases:
        lines.append("aliases:")
        lines.extend(f'  - "{a}"' for a in draft.aliases)
    else:
        lines.append("aliases: []")
    lines.extend(
        [
            f"category: {draft.category}",
            f"answerSource: {draft.answer_source}",
        ]
    )
    if draft.answer_source_note:
        # Escape quotes in note
        note = draft.answer_source_note.replace('"', "\\\"")
        lines.append(f'answerSourceNote: "{note}"')
    lines.extend(["status: non-review", "---", "", "## 要求", "", draft.requirements_md])
    if draft.answers_md:
        lines.extend(["", "## 答案", "", draft.answers_md])
    lines.append("")

    out_dir = CONTENT_DIR / draft.category
    out_dir.mkdir(parents=True, exist_ok=True)
    path = out_dir / f"{honor_id}.md"
    path.write_text("\n".join(lines), encoding="utf-8")
    return path


def extract_pdf_pages(reader: PdfReader, indices: list[int], output: Path) -> None:
    writer = PdfWriter()
    for index in indices:
        writer.add_page(reader.pages[index])
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open("wb") as handle:
        writer.write(handle)


def extract_badge_png(doc: fitz.Document, page_index: int, output: Path) -> bool:
    page = doc[page_index]
    badge_rect = None
    for img in page.get_images(full=True):
        xref = img[0]
        for rect in page.get_image_rects(xref):
            if 40 < rect.width < 150 and 40 < rect.height < 120:
                badge_rect = rect
                break
        if badge_rect:
            break
    if badge_rect is None:
        return False

    # Render at high DPI then upscale to ~1024 wide to match existing badges
    pix = page.get_pixmap(matrix=fitz.Matrix(8, 8), clip=badge_rect, alpha=True)
    output.parent.mkdir(parents=True, exist_ok=True)
    tmp = output.with_suffix(".tmp.png")
    pix.save(tmp)

    try:
        from PIL import Image

        image = Image.open(tmp).convert("RGBA")
        # Upscale to similar footprint as HKMC site badges
        target_w = 1024
        ratio = target_w / image.width
        target_h = max(1, int(image.height * ratio))
        image = image.resize((target_w, target_h), Image.Resampling.LANCZOS)
        # Pad to 1024x769-ish canvas for visual consistency
        canvas = Image.new("RGBA", (1024, 769), (255, 255, 255, 0))
        x = (1024 - image.width) // 2
        y = (769 - image.height) // 2
        canvas.paste(image, (x, y), image)
        canvas.save(output)
        tmp.unlink(missing_ok=True)
    except Exception:
        tmp.replace(output)
    return True


def main() -> int:
    if not CHI_PDF.is_file() or not ENG_PDF.is_file():
        print("Handbook PDFs missing", file=sys.stderr)
        return 1

    existing = local_codes()
    chi_reader = PdfReader(str(CHI_PDF))
    eng_reader = PdfReader(str(ENG_PDF))
    chi_pages = [(page.extract_text() or "") for page in chi_reader.pages]
    eng_pages = [(page.extract_text() or "") for page in eng_reader.pages]
    chi_doc = fitz.open(CHI_PDF)

    drafts = extract_zh_honors(chi_pages, existing)
    print(f"Found {len(drafts)} missing honors in ZH handbook")

    missing_eng: list[str] = []
    written = 0
    for draft in drafts:
        attach_english_answers(draft, eng_pages)
        if not draft.eng_pages:
            missing_eng.append(f"{draft.code} {draft.name_en}")

        path = write_markdown(draft)
        written += 1

        # ZH pdf page
        extract_pdf_pages(chi_reader, [draft.chi_page], PDF_PAGES_DIR / f"{draft.code}-zh.pdf")
        # EN pdf pages
        if draft.eng_pages:
            extract_pdf_pages(
                eng_reader, draft.eng_pages, PDF_PAGES_DIR / f"{draft.code}-en.pdf"
            )
        else:
            # Still create empty? tests require file — copy zh as placeholder? Better skip and update test.
            pass

        if not extract_badge_png(chi_doc, draft.chi_page, PUBLIC_DIR / f"{draft.code}.png"):
            print(f"  WARN: no badge image for {draft.code}")

        print(f"  + {draft.code} {draft.name_en} → {path.relative_to(ROOT)}")

    print(f"\nWrote {written} markdown files")
    if missing_eng:
        print("Missing EN page match:")
        for item in missing_eng:
            print(f"  - {item}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
