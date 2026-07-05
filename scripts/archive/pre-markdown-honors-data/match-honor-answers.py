#!/usr/bin/env python3
"""Match requirements-only honors to Award Book 2020 supporting answers."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
PDF_PATH = Path("/Users/kalongchan/Downloads/Award Book 2020.pdf")
HONORS_DATA = ROOT / "app/adventurer-honors/honors-data.ts"
OUT_EN = Path(__file__).resolve().parent / "honor-answers-en-by-id.json"

NAME_ALIASES: dict[str, str] = {
    "My Community": "My Community Friends",
    "Swimmer II": "Swimmer II",
    "Swimmer I": "Swimmer I",
    "Home Helper II": "Home Helper II",
    "Safety Specialist": "Safety Specialist",
    "Jigsaw Puzzles": "Jigsaw P uzzles",
    "My Picture Book": "My P icture Book",
    "Early Adventist": "Early Adventist P ioneer",
    "Manners Fun": "Manners Fun",
    "Left and Right": "Left and Right",
    "Trains and Trucks": "Trains and Trucks",
    "Acts of Kindness": "Acts of Kindness",
    "Guide": "Guide",
    "Delightful Sabbath": "Delightful Sabbath",
    "Listening": "Listening",
    "Parables of Jesus": "Parables of Jesus",
    "Animals": "Animals",
    "Animal Homes": "Animal Homes",
    "Pets": "Pets",
    "Potatoes": "Potatoes",
    "Scavenger Hunt": "Scavenger Hunt",
    "Zoo Animals": "Zoo Animals",
    "Butterflies": "Butterflies",
    "Colors": "Colors",
    "Crayons and Markers": "Crayons and Markers",
    "Finger Play": "Finger Play",
    "Music I": "Music I",
    "Music II": "Music II",
    "Shapes and Sizes": "Shapes and Sizes",
    "Sponge Art": "Sponge Art",
    "Stamping Fun I": "Stamping Fun I",
    "Artist": "Artist",
    "Building Blocks": "Building Blocks",
    "Buttons": "Buttons",
    "Gadgets and Sand": "Gadgets and Sand",
}


def load_pdf_text() -> str:
    reader = PdfReader(str(PDF_PATH))
    return "\n".join((page.extract_text() or "") for page in reader.pages)


def parse_requirements_only_honors() -> list[dict]:
    text = HONORS_DATA.read_text(encoding="utf-8")
    pattern = re.compile(
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
    matches = list(re.finditer(r"(?:^|\n)(\d+)\.\s+", body))
    if not matches:
        bullets: list[str] = []
        for line in body.split("\n"):
            stripped = line.strip()
            if stripped.startswith("•"):
                bullets.append(stripped.lstrip("• ").strip())
        return bullets

    answers: list[str] = []
    for index, match in enumerate(matches):
        start = match.start()
        end = matches[index + 1].start() if index + 1 < len(matches) else len(body)
        chunk = body[start:end].strip()
        chunk = re.sub(r"^\d+\.\s+", "", chunk, count=1)
        answers.append(re.sub(r"\s+", " ", chunk).strip())
    return answers


def extract_supporting_answers(full_text: str, honor_name: str) -> list[str] | None:
    search_name = NAME_ALIASES.get(honor_name, honor_name)
    patterns = [
        f"\n{search_name}\nRequirements",
        f"\n{search_name}\r\nRequirements",
        f"Requirements",
    ]

    for pattern in patterns[:2]:
        start = full_text.find(pattern)
        if start == -1:
            continue
        segment = full_text[start : start + 12000]
        support_index = segment.find("Supporting Answers")
        if support_index == -1:
            continue
        answers_text = segment[support_index + len("Supporting Answers") :]
        next_req = answers_text.find("\nRequirements")
        if next_req != -1:
            answers_text = answers_text[:next_req]
        return split_numbered_answers(answers_text.strip())

    # Name after requirements variant
    marker = "Requirements"
    cursor = 0
    while True:
        req_index = full_text.find(marker, cursor)
        if req_index == -1:
            break
        window = full_text[req_index : req_index + 2500]
        if re.search(rf"\n{re.escape(search_name)}\s*(?:\n|$)", window):
            segment = full_text[req_index : req_index + 12000]
            support_index = segment.find("Supporting Answers")
            if support_index != -1:
                answers_text = segment[support_index + len("Supporting Answers") :]
                next_req = answers_text.find("\nRequirements")
                if next_req != -1:
                    answers_text = answers_text[:next_req]
                return split_numbered_answers(answers_text.strip())
        cursor = req_index + len(marker)
    return None


def main() -> int:
    if not PDF_PATH.exists():
        print(f"Missing PDF: {PDF_PATH}", file=sys.stderr)
        return 1

    full_text = load_pdf_text()
    honors = parse_requirements_only_honors()
    output: dict[str, dict] = {}
    missing: list[str] = []

    for honor in honors:
        answers = extract_supporting_answers(full_text, honor["nameEn"])
        if not answers:
            missing.append(honor["nameEn"])
            continue
        output[honor["id"]] = {
            **honor,
            "answersEn": answers,
        }

    OUT_EN.write_text(json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Matched {len(output)}/{len(honors)} honors")
    if missing:
        print("Missing:")
        for name in missing:
            print(f"  - {name}")
    print(f"Wrote {OUT_EN}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
