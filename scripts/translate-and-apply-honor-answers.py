#!/usr/bin/env python3
"""Extract, translate, and apply Award Book answers to requirements-only honors."""

from __future__ import annotations

import json
import re
import sys
import time
from pathlib import Path

from deep_translator import GoogleTranslator
from deep_translator.exceptions import TranslationNotFound
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
PDF_PATH = Path("/Users/kalongchan/Downloads/Award Book 2020.pdf")
HONORS_DATA = ROOT / "app/adventurer-honors/honors-data.ts"
CACHE_EN = Path(__file__).resolve().parent / "honor-answers-en-by-id.json"
CACHE_ZH = Path(__file__).resolve().parent / "honor-answers-zh-by-id.json"

NAME_ALIASES: dict[str, str] = {
    "My Community": "My Community Friends",
    "Jigsaw Puzzles": "Jigsaw P uzzles",
    "My Picture Book": "My P icture Book",
    "Early Adventist": "Early Adventist P ioneer",
    "Pets": "P ets",
    "Potatoes": "P otatoes",
    "Parables of Jesus": "P arables of Jesus",
    "Zoo Animals": "Z oo Animals",
}


def load_pdf_pages() -> list[str]:
    reader = PdfReader(str(PDF_PATH))
    return [(page.extract_text() or "") for page in reader.pages]


def honor_name_variants(honor_name: str) -> list[str]:
    alias = NAME_ALIASES.get(honor_name, honor_name)
    variants = {honor_name, alias}
    if " " in alias and "  " not in alias:
        parts = alias.split(" ", 1)
        if len(parts) == 2 and len(parts[0]) <= 2:
            variants.add(f"{parts[0]} {parts[1]}")
        spaced = f"{alias[0]} {alias[1:]}" if alias else alias
        variants.add(spaced)
    return list(variants)


def normalize_for_match(value: str) -> str:
    return re.sub(r"\s+", " ", value.strip().lower())


def find_honor_page(pages: list[str], honor_name: str) -> int | None:
    variants = honor_name_variants(honor_name)
    normalized_variants = {normalize_for_match(value) for value in variants}

    for index, page_text in enumerate(pages):
        lines = [line.strip() for line in page_text.split("\n") if line.strip()]
        for line in lines[-4:]:
            if normalize_for_match(line) in normalized_variants:
                return index
        for line in lines:
            if normalize_for_match(line) in normalized_variants and "Formerly" not in line:
                if "Requirements" in page_text or line == lines[-1]:
                    return index
    return None


def supporting_answers_body(page_text: str) -> str | None:
    if "Supporting Answers" not in page_text:
        return None
    body = page_text.split("Supporting Answers", 1)[1]
    body = re.sub(r"^Page \d+\s*", "", body, flags=re.M)
    body = re.sub(r"^Updated in:.*$", "", body, flags=re.M)
    body = body.strip()
    if not body:
        return None
    if not re.search(r"(?:^|\n)\d+\.\s+", body) and "Teaching Idea" not in body and "•" not in body:
        if len(body) < 40:
            return None
    return body


def extract_answers_block(body: str) -> list[str]:
    if "Answers:" in body:
        answers_section = body.split("Answers:", 1)[1]
        answers: list[str] = []
        for match in re.finditer(r"Answers for #(\d+)\s*\n(.*?)(?=Answers for #|\nSuggestion for #|\nUpdated in:|\Z)", answers_section, re.S):
            answers.append(re.sub(r"\s+", " ", match.group(2)).strip())
        for match in re.finditer(r"Suggestion for #(\d+):\s*\n(.*?)(?=Answers for #|\nUpdated in:|\Z)", answers_section, re.S):
            answers.append(re.sub(r"\s+", " ", match.group(2)).strip())
        if answers:
            return answers
    return split_numbered_answers(body)


def extract_requirement_level_hints(page_text: str) -> list[tuple[int, str]]:
    if "Requirements" not in page_text:
        return []
    body = page_text.split("Requirements", 1)[1]
    body = re.sub(r"\nIdea for #.*", "", body, flags=re.S)
    parts = re.split(r"\n(?=\d+\.)", body)
    hints: list[tuple[int, str]] = []
    for part in parts:
        match = re.match(r"\s*(\d+)\.", part)
        if not match:
            continue
        requirement_index = int(match.group(1)) - 1
        parenthetical = extract_parenthetical_hints(part)
        if parenthetical:
            hints.append((requirement_index, " ".join(parenthetical)))
    return hints


def extract_inline_ideas(page_text: str) -> list[tuple[int, str]]:
    ideas: list[tuple[int, str]] = []
    for match in re.finditer(r"Idea for #(\d+):\s*\n(.*?)(?=\nIdea for #|\n[A-Z][a-z]+ [A-Z]|\nRequirements|\Z)", page_text, re.S):
        requirement_index = int(match.group(1)) - 1
        text = re.sub(r"\s+", " ", match.group(2)).strip()
        text = re.sub(r"\s+(Toys|P otatoes|P ets)$", "", text)
        if text:
            ideas.append((requirement_index, text))
    return ideas


def extract_parenthetical_hints(requirements_body: str) -> list[str]:
    hints: list[str] = []
    for match in re.finditer(r"\(([^)]+(?:\)[^)]*)*)\)", requirements_body):
        hint = re.sub(r"\s+", " ", match.group(1)).strip()
        if len(hint) > 15 and not hint.startswith("Formerly"):
            hints.append(hint)
    return hints


def extract_supporting_answers(pages: list[str], honor_name: str, requirements: list[str]) -> list[tuple[int, str]] | None:
    honor_page = find_honor_page(pages, honor_name)
    if honor_page is None:
        return None

    candidates: list[tuple[int, list[tuple[int, str]]]] = []
    requirements_page = pages[honor_page]

    for offset in (1,):
        page_index = honor_page + offset
        if page_index < 0 or page_index >= len(pages):
            continue
        page_text = pages[page_index]
        if re.search(r"\nRequirements\s*\n\s*\d+\.", page_text):
            continue
        body = supporting_answers_body(page_text)
        if not body:
            continue
        answers = extract_answers_block(body)
        if answers:
            sequential = [(index, answer) for index, answer in enumerate(answers)]
            score = 1000 - abs(len(answers) - len(requirements)) * 10
            candidates.append((score, sequential))

    inline_ideas = extract_inline_ideas(requirements_page)
    if inline_ideas:
        candidates.append((950, inline_ideas))

    if "Answers:" in requirements_page:
        answers_block = extract_answers_block(requirements_page)
        if answers_block:
            if re.search(r"Answers for #(\d+)", requirements_page):
                indexed: list[tuple[int, str]] = []
                for match in re.finditer(r"Answers for #(\d+)\s*\n(.*?)(?=Answers for #|\nSuggestion for #|\nUpdated in:|\Z)", requirements_page, re.S):
                    indexed.append((int(match.group(1)) - 1, re.sub(r"\s+", " ", match.group(2)).strip()))
                for match in re.finditer(r"Suggestion for #(\d+):\s*\n(.*?)(?=Answers for #|\nUpdated in:|\Z)", requirements_page, re.S):
                    indexed.append((int(match.group(1)) - 1, re.sub(r"\s+", " ", match.group(2)).strip()))
                if indexed:
                    candidates.append((980, indexed))
            else:
                sequential = [(index, answer) for index, answer in enumerate(answers_block)]
                candidates.append((980, sequential))

    if not candidates:
        requirement_hints = extract_requirement_level_hints(requirements_page)
        if requirement_hints:
            return requirement_hints

    if not candidates:
        return None

    candidates.sort(key=lambda item: item[0], reverse=True)
    return candidates[0][1]


def parse_requirements_only_honors() -> list[dict]:
    text = HONORS_DATA.read_text(encoding="utf-8")
    pattern = re.compile(
        r"\{\s*"
        r"id: \"(?P<id>[^\"]+)\"[\s\S]*?"
        r"code: \"(?P<code>[^\"]+)\"[\s\S]*?"
        r"nameZh: \"(?P<nameZh>[^\"]+)\"[\s\S]*?"
        r"nameEn: \"(?P<nameEn>[^\"]+)\"[\s\S]*?"
        r"requirements: \[(?P<requirements>[\s\S]*?)\][\s\S]*?"
        r"status: \"requirements-only\"",
        re.MULTILINE,
    )
    honors: list[dict] = []
    for match in pattern.finditer(text):
        req_raw = match.group("requirements")
        requirements = re.findall(r"\"((?:\\.|[^\"\\])*)\"", req_raw)
        requirements = [value.replace('\\"', '"') for value in requirements]
        honors.append(
            {
                "id": match.group("id"),
                "code": match.group("code"),
                "nameZh": match.group("nameZh"),
                "nameEn": match.group("nameEn"),
                "requirements": requirements,
            }
        )
    return honors


def split_numbered_answers(body: str) -> list[str]:
    body = re.sub(r"^Page \d+\s*", "", body, flags=re.M)
    body = re.sub(r"^Updated in:.*$", "", body, flags=re.M)
    body = re.sub(r"^NOTE:.*?(?=\n\d+\.|\n•|\Z)", "", body, flags=re.S | re.I)
    matches = list(re.finditer(r"(?:^|\n)(\d+)\.\s*", body))
    if not matches:
        bullets: list[str] = []
        for line in body.split("\n"):
            stripped = line.strip()
            if stripped.startswith("•"):
                bullets.append(stripped.lstrip("• ").strip())
            elif stripped.startswith("- "):
                bullets.append(stripped[2:].strip())
        return [item for item in bullets if len(item) > 2]

    answers: list[str] = []
    for index, match in enumerate(matches):
        start = match.start()
        end = matches[index + 1].start() if index + 1 < len(matches) else len(body)
        chunk = body[start:end].strip()
        chunk = re.sub(r"^\d+\.\s*", "", chunk, count=1)
        chunk = re.sub(r"\s+", " ", chunk).strip()
        if chunk:
            answers.append(chunk)
    return answers


def translate_text(text: str, translator: GoogleTranslator) -> str:
    if not text.strip():
        return text
    try:
        if len(text) <= 4500:
            return translator.translate(text)
        chunks: list[str] = []
        current = text
        while current:
            piece = current[:4500]
            chunks.append(translator.translate(piece))
            current = current[4500:]
            time.sleep(0.2)
        return " ".join(chunks)
    except TranslationNotFound:
        return f"（英文原文）{text}"
    except Exception as error:
        print(f"Translation warning: {error}", file=sys.stderr)
        return f"（英文原文）{text}"


def translate_answers(answers_en: list[str]) -> list[str]:
    translator = GoogleTranslator(source="en", target="zh-TW")
    translated: list[str] = []
    for answer in answers_en:
        translated.append(translate_text(answer, translator))
        time.sleep(0.15)
    return translated


def map_indexed_answers(indexed_answers: list[tuple[int, str]], translated: list[str]) -> list[dict]:
    mapped: list[dict] = []
    for (requirement_index, _answer_en), text in zip(indexed_answers, translated, strict=False):
        mapped.append({"requirementIndex": requirement_index, "text": text, "source": "Award Book 2020"})
    return mapped


def map_answers_to_requirements(
    requirements: list[str],
    indexed_answers: list[tuple[int, str]],
    answers_zh: list[str],
) -> list[dict]:
    if all(index == position for position, (index, _text) in enumerate(indexed_answers)):
        if len(indexed_answers) == len(requirements):
            return map_indexed_answers(indexed_answers, answers_zh)

    mapped: list[dict] = []
    for (requirement_index, _answer_en), text in zip(indexed_answers, answers_zh, strict=False):
        mapped.append(
            {
                "requirementIndex": min(requirement_index, len(requirements) - 1),
                "text": text,
                "source": "Award Book 2020",
            }
        )
    return mapped


def ts_string(value: str) -> str:
    return json.dumps(value, ensure_ascii=False)


def format_answers(answers: list[dict]) -> str:
    if not answers:
        return "[]"
    parts = []
    for answer in answers:
        parts.append(
            "{ requirementIndex: "
            + str(answer["requirementIndex"])
            + ", text: "
            + ts_string(answer["text"])
            + ', source: "Award Book 2020" }'
        )
    return "[ " + ", ".join(parts) + " ]"


def apply_updates(updates: dict[str, dict]) -> None:
    text = HONORS_DATA.read_text(encoding="utf-8")
    for honor_id, payload in updates.items():
        block_pattern = re.compile(
            rf"(\{{\s*id: \"{re.escape(honor_id)}\"[\s\S]*?answers: )\[[\s\S]*?\]([\s\S]*?answerSource: \")([^\"]*)(\"[\s\S]*?status: \")requirements-only(\")",
            re.MULTILINE,
        )

        def repl(match: re.Match[str]) -> str:
            return (
                f"{match.group(1)}{format_answers(payload['answers'])}"
                f"{match.group(2)}答案由英文 Award Book 2020 整理/翻譯"
                f"{match.group(4)}complete{match.group(5)}"
            )

        new_text, count = block_pattern.subn(repl, text, count=1)
        if count == 0:
            print(f"Warning: could not patch honor {honor_id}", file=sys.stderr)
        else:
            text = new_text
    HONORS_DATA.write_text(text, encoding="utf-8")


def main() -> int:
    if not PDF_PATH.exists():
        print(f"Missing PDF: {PDF_PATH}", file=sys.stderr)
        return 1

    pages = load_pdf_pages()
    honors = parse_requirements_only_honors()
    extracted: dict[str, dict] = {}
    missing: list[str] = []
    pending_ids = {honor["id"] for honor in honors}

    for honor in honors:
        indexed_answers = extract_supporting_answers(pages, honor["nameEn"], honor["requirements"])
        if not indexed_answers:
            missing.append(honor["nameEn"])
            continue
        extracted[honor["id"]] = {**honor, "indexedAnswersEn": indexed_answers}

    CACHE_EN.write_text(json.dumps(extracted, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Extracted English answers for {len(extracted)}/{len(honors)} honors", flush=True)

    updates: dict[str, dict] = {}
    if CACHE_ZH.exists():
        cached = json.loads(CACHE_ZH.read_text(encoding="utf-8"))
        updates = {honor_id: payload for honor_id, payload in cached.items() if honor_id not in pending_ids}

    new_updates: dict[str, dict] = {}
    for honor_id, payload in extracted.items():
        answers_en = [answer for _index, answer in payload["indexedAnswersEn"]]
        answers_zh = translate_answers(answers_en)
        answers = map_answers_to_requirements(payload["requirements"], payload["indexedAnswersEn"], answers_zh)
        new_updates[honor_id] = {"answers": answers}
        print(f"Translated {payload['nameZh']} ({payload['code']})", flush=True)

    updates.update(new_updates)
    CACHE_ZH.write_text(json.dumps(updates, ensure_ascii=False, indent=2), encoding="utf-8")
    apply_updates(new_updates)

    if missing:
        print("Still missing:")
        for name in missing:
            print(f"  - {name}")
    print(f"Updated {len(updates)} honors in {HONORS_DATA}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
