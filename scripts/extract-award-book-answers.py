#!/usr/bin/env python3
"""Extract Supporting Answers from Award Book 2020 PDF by honor name."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

from pypdf import PdfReader

PDF_PATH = Path("/Users/kalongchan/Downloads/Award Book 2020.pdf")
OUT_PATH = Path(__file__).resolve().parent / "award-book-answers-en.json"

PAGE_NOISE = re.compile(r"^Page \d+\s*$", re.M)
UPDATED_LINE = re.compile(r"^Updated in:.*$", re.M)
NUMBERED_ANSWER = re.compile(r"^(\d+)\.\s+", re.M)
HONOR_NAME = re.compile(r"^[A-Z][A-Za-z0-9][A-Za-z0-9 \-()/']{0,70}$")


def extract_full_text(pdf_path: Path) -> str:
    reader = PdfReader(str(pdf_path))
    parts: list[str] = []
    for page in reader.pages:
        parts.append(page.extract_text() or "")
    text = "\n".join(parts)
    return PAGE_NOISE.sub("", text)


def clean_block(text: str) -> str:
    text = UPDATED_LINE.sub("", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def is_honor_name(line: str) -> bool:
    line = line.strip()
    if not line or len(line) > 72:
        return False
    if line.startswith(("Requirements", "Supporting Answers", "Note:", "Teaching")):
        return False
    if re.match(r"^\d+\.", line):
        return False
    if re.match(r"^[a-z]", line):
        return False
    if line.endswith(".") and not line.endswith("etc.)"):
        return False
    return bool(HONOR_NAME.match(line))


def split_numbered_answers(body: str) -> list[str]:
    matches = list(NUMBERED_ANSWER.finditer(body))
    if not matches:
        bullets = []
        for line in body.split("\n"):
            stripped = line.strip()
            if not stripped:
                continue
            if stripped.startswith("•"):
                bullets.append(stripped.lstrip("• ").strip())
            elif stripped.startswith("- "):
                bullets.append(stripped[2:].strip())
        return bullets

    answers: list[str] = []
    for index, match in enumerate(matches):
        start = match.start()
        end = matches[index + 1].start() if index + 1 < len(matches) else len(body)
        chunk = body[start:end].strip()
        chunk = re.sub(r"^\d+\.\s+", "", chunk, count=1)
        answers.append(re.sub(r"\s+", " ", chunk).strip())
    return answers


def split_requirements(body: str) -> list[str]:
    lines = [line.strip() for line in body.split("\n") if line.strip()]
    joined = "\n".join(lines)
    parts = re.split(r"\n(?=\d+\.)", joined)
    requirements: list[str] = []
    for part in parts:
        part = part.strip()
        if re.match(r"^\d+\.", part):
            requirements.append(re.sub(r"\s+", " ", part))
    return requirements


def parse_honors(text: str) -> dict[str, dict]:
    honors: dict[str, dict] = {}
    markers = list(re.finditer(r"(?:^|\n)(Requirements|Supporting Answers)\s*", text))

    index = 0
    while index < len(markers):
        marker = markers[index]
        if marker.group(1) != "Requirements":
            index += 1
            continue

        req_start = marker.end()
        support_index = index + 1
        while support_index < len(markers) and markers[support_index].group(1) != "Supporting Answers":
            support_index += 1
        if support_index >= len(markers):
            break

        req_end = markers[support_index].start()
        support_start = markers[support_index].end()
        support_end = markers[support_index + 1].start() if support_index + 1 < len(markers) else len(text)

        requirements_block = text[req_start:req_end].strip()
        answers_block = clean_block(text[support_start:support_end])

        preface = text[max(0, marker.start() - 120) : marker.start()]
        preface_lines = [line.strip() for line in preface.split("\n") if line.strip()]
        honor_name = None
        for line in reversed(preface_lines[-4:]):
            if is_honor_name(line):
                honor_name = line
                break

        req_lines = [line.strip() for line in requirements_block.split("\n") if line.strip()]
        if not honor_name and req_lines:
            tail = req_lines[-1]
            if is_honor_name(tail):
                honor_name = tail
                req_lines = req_lines[:-1]

        if not honor_name:
            index = support_index + 1
            continue

        requirements_body = "\n".join(req_lines)
        requirements = split_requirements(requirements_body)
        answers = split_numbered_answers(answers_block)

        honors[honor_name] = {
            "nameEn": honor_name,
            "requirementsEn": requirements,
            "answersEn": answers,
        }
        index = support_index + 1

    return honors


def main() -> int:
    if not PDF_PATH.exists():
        print(f"Missing PDF: {PDF_PATH}", file=sys.stderr)
        return 1

    text = extract_full_text(PDF_PATH)
    honors = parse_honors(text)
    OUT_PATH.write_text(json.dumps(honors, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Extracted {len(honors)} honors -> {OUT_PATH}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
