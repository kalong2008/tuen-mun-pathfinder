#!/usr/bin/env python3
"""Scrape Word download links for adventurer honors from HKMC category pages."""

from __future__ import annotations

import re
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

PAGES = [
    "https://youth.hkmcadventist.org/web/clubs/adventurer-2/honor/spiritual/",
    "https://youth.hkmcadventist.org/web/clubs/adventurer-2/honor/household/",
    "https://youth.hkmcadventist.org/web/clubs/adventurer-2/honor/recreation/",
    "https://youth.hkmcadventist.org/web/clubs/adventurer-2/honor/community/",
    "https://youth.hkmcadventist.org/web/clubs/adventurer-2/honor/nature/",
    "https://youth.hkmcadventist.org/web/clubs/adventurer-2/honor/artscrafts/",
]

CODE_RE = re.compile(r"(HKA\d{4}|YOU\d{4})", re.I)
DOCX_RE = re.compile(
    r'href="(https://youth\.hkmcadventist\.org/web/wp-content/uploads/[^"]+\.docx)"',
    re.I,
)
H4_CODE_RE = re.compile(
    r"<h4[^>]*>.*?<strong>(HKA\d{4}|YOU\d{4})</strong>",
    re.I | re.S,
)

MANUAL_ALIASES: dict[str, str] = {
    "HKA5058": "HKA4058",
}

MANUAL_URLS: dict[str, str] = {
    "HKA4033": "https://youth.hkmcadventist.org/web/wp-content/uploads/2024/01/HKA4033-%E6%95%85%E4%BA%8B%E8%81%86%E8%81%BD1-%E6%A6%AE%E8%AD%BD%E8%AD%89.docx",
    "HKA4034": "https://youth.hkmcadventist.org/web/wp-content/uploads/2024/01/HKA4033%E6%95%85%E4%BA%8B%E8%81%86%E8%81%BDII%E6%A6%AE%E8%AD%BD%E8%AD%89.docx",
    "HKA4009": "https://youth.hkmcadventist.org/web/wp-content/uploads/2024/01/YOU4655-%E5%B0%8F%E5%B7%A5%E5%85%B7%E5%92%8C%E6%B2%99%E5%AD%90%E6%A6%AE%E8%AD%BD%E8%AD%89.docx",
    "YOU4655": "https://youth.hkmcadventist.org/web/wp-content/uploads/2024/01/YOU4655-%E9%AD%9A%E9%A1%9E%E6%A6%AE%E8%AD%BD%E8%AD%89.docx",
}


def scrape_page(url: str) -> dict[str, str]:
    html = urllib.request.urlopen(url).read().decode("utf-8", errors="replace")
    by_code: dict[str, str] = {}

    blocks = re.split(r'<div class="elementor-element[^"]*e-con-full e-flex e-con e-child"', html)
    for block in blocks:
        h4_match = H4_CODE_RE.search(block)
        if not h4_match:
            continue
        code = h4_match.group(1).upper()
        docx_match = DOCX_RE.search(block)
        if docx_match:
            by_code[code] = docx_match.group(1)

    for docx_match in DOCX_RE.finditer(html):
        docx_url = docx_match.group(1)
        code_match = CODE_RE.search(docx_url)
        if code_match:
            by_code.setdefault(code_match.group(1).upper(), docx_url)

    return by_code


def main() -> None:
    scraped: dict[str, str] = {}
    for page in PAGES:
        scraped.update(scrape_page(page))

    for alias, target in MANUAL_ALIASES.items():
        if alias in scraped and target not in scraped:
            scraped[target] = scraped[alias]

    scraped.update(MANUAL_URLS)

    content_dir = ROOT / "app" / "adventurer-honors" / "content"
    honor_codes = sorted(
        {
            match.upper()
            for path in content_dir.rglob("*.md")
            for match in re.findall(r"^code: (HKA\d+|YOU\d+)", path.read_text(encoding="utf-8"), re.M)
        }
    )

    found = 0
    missing: list[str] = []

    for code in honor_codes:
        if scraped.get(code):
            found += 1
        else:
            missing.append(code)

    print(f"Found {found} / {len(honor_codes)} Word download links on HKMC.")
    if missing:
        print("Missing:", ", ".join(missing))


if __name__ == "__main__":
    main()
