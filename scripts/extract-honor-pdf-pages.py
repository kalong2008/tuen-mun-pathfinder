#!/usr/bin/env python3
"""Map honors to PDF pages and extract multi-page PDFs for Chinese and English handbooks."""

from __future__ import annotations

import os
import re
from dataclasses import dataclass
from pathlib import Path

from pypdf import PdfReader, PdfWriter

ROOT = Path(__file__).resolve().parents[1]
HONORS_CONTENT_DIR = ROOT / "app" / "adventurer-honors" / "content"
OUTPUT_DIR = ROOT / "public" / "adventurer-honors" / "pdf-pages"

DEFAULT_CHI_PDF = ROOT / "public" / "adventurer-honors" / "handbooks" / "hkmc-2023-zh.pdf"
DEFAULT_ENG_PDF = ROOT / "public" / "adventurer-honors" / "handbooks" / "award-book-2020-en.pdf"

CODE_RE = re.compile(r"(HKA\d{4}|YOU\d{4})", re.I)

NAME_ALIASES: dict[str, str] = {
    "My Community": "My Community Friends",
    "My Community Friends": "My Community",
    "Jigsaw Puzzles": "Jigsaw P uzzles",
    "My Picture Book": "My P icture Book",
    "Early Adventist": "Early Adventist P ioneer",
    "Pets": "P ets",
    "Potatoes": "P otatoes",
    "Parables of Jesus": "P arables of Jesus",
    "Zoo Animals": "Z oo Animals",
    "Jesus' Star": "Jesus' Star",
    "God's World": "God's World",
}

NEW_HONOR_REQ = re.compile(r"Requirements\s*\n\s*1\.", re.M)
UPDATED_MARKER = re.compile(r"Updated in:\s*\d{4}")
NON_HONOR_FOOTERS = {
    "supporting answers",
    "requirements",
}

CHI_CODE_ALIASES: dict[str, list[str]] = {
    "HKA4056": ["YOU4056"],
}


@dataclass(frozen=True)
class HonorRecord:
    code: str
    name_zh: str
    name_en: str
    aliases: list[str]


def parse_honors() -> list[HonorRecord]:
    honors: list[HonorRecord] = []
    for path in sorted(HONORS_CONTENT_DIR.rglob("*.md")):
        text = path.read_text(encoding="utf-8")
        frontmatter_match = re.match(r"^---\n(.*?)\n---", text, re.S)
        if not frontmatter_match:
            continue

        frontmatter = frontmatter_match.group(1)
        code_match = re.search(r"^code: (HKA\d+|YOU\d+)", frontmatter, re.M)
        name_zh_match = re.search(r'^nameZh: (?:"([^"]*)"|([^\n]+))', frontmatter, re.M)
        name_en_match = re.search(r'^nameEn: (?:"([^"]*)"|([^\n]+))', frontmatter, re.M)
        aliases_match = re.search(r"^aliases:\n((?:  - .+\n)*)", frontmatter, re.M)

        if not code_match or not name_zh_match:
            continue

        name_zh = (name_zh_match.group(1) or name_zh_match.group(2) or "").strip()
        name_en = (name_en_match.group(1) or name_en_match.group(2) or "").strip() if name_en_match else ""
        aliases_block = aliases_match.group(1) if aliases_match else ""
        aliases = re.findall(r'"([^"]+)"', aliases_block)

        honors.append(
            HonorRecord(
                code=code_match.group(1).upper(),
                name_zh=name_zh,
                name_en=name_en,
                aliases=aliases,
            )
        )

    return honors


def normalize_for_match(value: str) -> str:
    normalized = value.replace("\u2019", "'").replace("\u2018", "'")
    return re.sub(r"\s+", " ", normalized.strip().lower())


def honor_name_variants(honor_name: str) -> list[str]:
    alias = NAME_ALIASES.get(honor_name, honor_name)
    variants = {honor_name, alias}
    if " " in alias and "  " not in alias:
        parts = alias.split(" ", 1)
        if len(parts) == 2 and len(parts[0]) <= 2:
            variants.add(f"{parts[0]} {parts[1]}")
        if alias:
            variants.add(f"{alias[0]} {alias[1:]}")
    return list(variants)


def chi_lookup_codes(code: str) -> list[str]:
    codes = [code.upper()]
    codes.extend(CHI_CODE_ALIASES.get(code.upper(), []))
    return codes


def chi_title_matches(page_text: str, honor: HonorRecord) -> bool:
    name_compact = honor.name_zh.replace(" ", "")
    compact = page_text.replace(" ", "")
    if f"{name_compact}榮譽證" in compact:
        return True

    en_compact = re.sub(r"[^a-z0-9']", "", honor.name_en.lower())
    page_compact = re.sub(r"[^a-z0-9']", "", page_text.lower())
    return bool(en_compact and f"{en_compact}award" in page_compact)


def find_chi_page(pages: list[str], honor: HonorRecord) -> int | None:
    lookup_codes = chi_lookup_codes(honor.code)

    for index, page_text in enumerate(pages):
        if not re.search(r"要求[：:]", page_text):
            continue

        code_count = len(CODE_RE.findall(page_text))
        if code_count > 4:
            continue

        if any(lookup_code in page_text for lookup_code in lookup_codes):
            return index

    for index, page_text in enumerate(pages):
        if not re.search(r"要求[：:]", page_text):
            continue

        code_count = len(CODE_RE.findall(page_text))
        if code_count > 4:
            continue

        if chi_title_matches(page_text, honor):
            return index

    return None


def get_page_footer(page_text: str) -> str:
    lines = [line.strip() for line in page_text.split("\n") if line.strip()]
    for line in reversed(lines):
        if line.startswith("Page "):
            continue
        if line in ("Requirements", "Supporting Answers"):
            continue
        return line
    return lines[-1] if lines else ""


def is_blank_padding_page(page_text: str) -> bool:
    lines = [line.strip() for line in page_text.split("\n") if line.strip()]
    return len(lines) <= 1 and (not lines or lines[0].startswith("Page "))


def looks_like_honor_title(footer: str) -> bool:
    normalized = normalize_for_match(footer)
    if not normalized or normalized in NON_HONOR_FOOTERS:
        return False
    if normalized.startswith("updated in:"):
        return False
    if re.match(r"^\d+\.", normalized):
        return False
    return True


def find_eng_page(pages: list[str], honor_name: str) -> int | None:
    variants = {normalize_for_match(value) for value in honor_name_variants(honor_name)}

    for index, page_text in enumerate(pages):
        if "Requirements" not in page_text:
            continue
        footer = normalize_for_match(get_page_footer(page_text))
        if footer in variants:
            return index

    for index, page_text in enumerate(pages):
        if "Requirements" not in page_text:
            continue
        header = normalize_for_match(page_text[:400])
        if any(variant in header for variant in variants):
            return index

    for index, page_text in enumerate(pages):
        lines = [line.strip() for line in page_text.split("\n") if line.strip()]
        for line in lines[-4:]:
            if normalize_for_match(line) in variants:
                return index
        for line in lines:
            if normalize_for_match(line) in variants and "Formerly" not in line:
                if "Requirements" in page_text or line == lines[-1]:
                    return index
    return None


def find_eng_pages_to_extract(pages: list[str], honor_page: int) -> list[int]:
    page_indices = [honor_page]
    start_footer = normalize_for_match(get_page_footer(pages[honor_page]))
    i = honor_page + 1

    while i < len(pages):
        page_text = pages[i]

        if is_blank_padding_page(page_text):
            break

        footer = normalize_for_match(get_page_footer(page_text))

        if NEW_HONOR_REQ.search(page_text):
            break

        if (
            "Requirements" in page_text
            and footer != start_footer
            and looks_like_honor_title(footer)
        ):
            break

        page_indices.append(i)

        if i > honor_page and UPDATED_MARKER.search(page_text):
            break

        i += 1

    return page_indices


def extract_pages(reader: PdfReader, page_indices: list[int], output_path: Path) -> None:
    writer = PdfWriter()
    for page_index in page_indices:
        writer.add_page(reader.pages[page_index])
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("wb") as handle:
        writer.write(handle)


def extract_page(reader: PdfReader, page_index: int, output_path: Path) -> None:
    extract_pages(reader, [page_index], output_path)


def main() -> None:
    chi_pdf_path = Path(os.environ.get("CHI_HONOR_PDF", DEFAULT_CHI_PDF))
    eng_pdf_path = Path(os.environ.get("ENG_HONOR_PDF", DEFAULT_ENG_PDF))

    if not chi_pdf_path.is_file():
        raise SystemExit(f"Chinese handbook PDF not found: {chi_pdf_path}")
    if not eng_pdf_path.is_file():
        raise SystemExit(f"English handbook PDF not found: {eng_pdf_path}")

    honors = parse_honors()
    chi_reader = PdfReader(str(chi_pdf_path))
    eng_reader = PdfReader(str(eng_pdf_path))
    chi_pages = [(page.extract_text() or "") for page in chi_reader.pages]
    eng_pages = [(page.extract_text() or "") for page in eng_reader.pages]

    missing_chi: list[str] = []
    missing_eng: list[str] = []

    for honor in honors:
        chi_page = find_chi_page(chi_pages, honor)
        if chi_page is None:
            missing_chi.append(honor.code)
        else:
            chi_output = OUTPUT_DIR / f"{honor.code}-zh.pdf"
            extract_page(chi_reader, chi_page, chi_output)

        eng_page = find_eng_page(eng_pages, honor.name_en)
        if eng_page is None:
            missing_eng.append(honor.code)
        else:
            eng_page_indices = find_eng_pages_to_extract(eng_pages, eng_page)
            eng_output = OUTPUT_DIR / f"{honor.code}-en.pdf"
            extract_pages(eng_reader, eng_page_indices, eng_output)

    print(f"Processed {len(honors)} honors.")
    print(f"Chinese pages extracted: {len(honors) - len(missing_chi)} / {len(honors)}")
    print(f"English pages extracted: {len(honors) - len(missing_eng)} / {len(honors)}")
    if missing_chi:
        print("Missing Chinese pages:", ", ".join(missing_chi))
    if missing_eng:
        print("Missing English pages:", ", ".join(missing_eng))


if __name__ == "__main__":
    main()
