#!/usr/bin/env python3
"""Download adventurer honor badge images from HKMC category pages."""

from __future__ import annotations

import re
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "public" / "adventurer-honors"

PAGES = [
    "https://youth.hkmcadventist.org/web/clubs/adventurer-2/honor/spiritual/",
    "https://youth.hkmcadventist.org/web/clubs/adventurer-2/honor/household/",
    "https://youth.hkmcadventist.org/web/clubs/adventurer-2/honor/recreation/",
    "https://youth.hkmcadventist.org/web/clubs/adventurer-2/honor/community/",
    "https://youth.hkmcadventist.org/web/clubs/adventurer-2/honor/nature/",
    "https://youth.hkmcadventist.org/web/clubs/adventurer-2/honor/artscrafts/",
]

CODE_RE = re.compile(r"(HKA\d{4}|YOU\d{4})", re.I)
IMG_RE = re.compile(
    r'<img[^>]+src="([^"]+wp-content/uploads[^"]+)"[^>]*srcset="([^"]+)"',
    re.I,
)
H4_CODE_RE = re.compile(
    r"<h4[^>]*>.*?<strong>(HKA\d{4}|YOU\d{4})</strong>",
    re.I | re.S,
)

# Site typos / alternate codes mapped to the honor code used in honor markdown frontmatter
MANUAL_ALIASES: dict[str, str] = {
    "HKA5058": "HKA4058",
}

MANUAL_URLS: dict[str, str] = {
    "HKA4033": "https://youth.hkmcadventist.org/web/wp-content/uploads/2024/01/HKA4033-%E6%95%85%E4%BA%8B%E8%81%86%E8%81%BD1-%E6%A6%AE%E8%AD%BD%E8%AD%89-1024x769.png",
    "HKA4034": "https://youth.hkmcadventist.org/web/wp-content/uploads/2024/01/HKA4033%E6%95%85%E4%BA%8B%E8%81%86%E8%81%BDII%E6%A6%AE%E8%AD%BD%E8%AD%89-1024x769.png",
    "HKA4009": "https://youth.hkmcadventist.org/web/wp-content/uploads/2024/01/YOU4655-%E5%B0%8F%E5%B7%A5%E5%85%B7%E5%92%8C%E6%B2%99%E5%AD%90%E6%A6%AE%E8%AD%BD%E8%AD%89-1024x769.png",
    "YOU4655": "https://youth.hkmcadventist.org/web/wp-content/uploads/2024/01/YOU4655-%E9%AD%9A%E9%A1%9E%E6%A6%AE%E8%AD%BD%E8%AD%89-1024x769.png",
    "HKA4029": "https://youth.hkmcadventist.org/web/wp-content/uploads/2024/01/HKA4028-閱讀III-榮譽證-1024x768.png",
    "HKA4028": "https://youth.hkmcadventist.org/web/wp-content/uploads/2024/01/HKA4028-閱讀II-榮譽證-1024x769.png",
    "HKA4079": "https://youth.hkmcadventist.org/web/wp-content/uploads/2024/01/圖片-1024x769.png",
}

# Honors with no HKMC badge image; keep the file already in public/adventurer-honors/
LOCAL_ONLY = frozenset({"YOU4925", "HKA4052", "YOU4625", "YOU4910"})


def pick_srcset_url(srcset: str) -> str:
    parts = [part.strip() for part in srcset.split(",")]
    for part in parts:
        if "1024w" in part:
            return part.split()[0]
    if parts:
        return parts[-1].split()[0]
    return ""


def extract_code_from_url(url: str) -> str | None:
    match = CODE_RE.search(url)
    return match.group(1).upper() if match else None


def scrape_page(url: str) -> dict[str, str]:
    html = urllib.request.urlopen(url).read().decode("utf-8", errors="replace")
    by_code: dict[str, str] = {}

    blocks = re.split(r'<div class="elementor-element[^"]*e-con-full e-flex e-con e-child"', html)
    for block in blocks:
        h4_match = H4_CODE_RE.search(block)
        if not h4_match:
            continue
        code = h4_match.group(1).upper()
        img_match = IMG_RE.search(block)
        if not img_match:
            continue
        image_url = pick_srcset_url(img_match.group(2)) or img_match.group(1)
        by_code[code] = image_url

    for img_match in IMG_RE.finditer(html):
        image_url = pick_srcset_url(img_match.group(2)) or img_match.group(1)
        code = extract_code_from_url(image_url)
        if code:
            by_code.setdefault(code, image_url)

    return by_code


def download(url: str, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    parsed = urllib.parse.urlsplit(url)
    encoded_path = urllib.parse.quote(parsed.path, safe="/%")
    encoded_url = urllib.parse.urlunsplit(
        (parsed.scheme, parsed.netloc, encoded_path, parsed.query, parsed.fragment)
    )
    request = urllib.request.Request(encoded_url, headers={"User-Agent": "tuen-mun-pathfinder/1.0"})
    with urllib.request.urlopen(request) as response:
        dest.write_bytes(response.read())


def main() -> None:
    scraped: dict[str, str] = {}
    for page in PAGES:
        scraped.update(scrape_page(page))

    for alias, target in MANUAL_ALIASES.items():
        if alias in scraped and target not in scraped:
            scraped[target] = scraped[alias]

    scraped.update(MANUAL_URLS)

    content_dir = ROOT / "app" / "adventurer-honors" / "content"
    honor_codes = [
        match.upper()
        for path in content_dir.rglob("*.md")
        for match in re.findall(r"^code: (HKA\d+|YOU\d+)", path.read_text(encoding="utf-8"), re.M)
    ]

    downloaded = 0
    missing: list[str] = []

    for code in honor_codes:
        source_url = scraped.get(code)
        if not source_url:
            if code in LOCAL_ONLY and (OUTPUT_DIR / f"{code}.png").exists():
                downloaded += 1
                continue
            missing.append(code)
            continue

        filename = f"{code}.png"
        dest = OUTPUT_DIR / filename
        print(f"Downloading {code} …")
        download(source_url, dest)
        downloaded += 1

    print(f"\nDownloaded {downloaded} / {len(honor_codes)} honor images.")
    if missing:
        print("Missing:", ", ".join(missing))


if __name__ == "__main__":
    main()
