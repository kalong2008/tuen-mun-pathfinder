#!/usr/bin/env python3
"""Apply requirement-based draft answers for requirements-only honors."""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HONORS_DATA = ROOT / "app/adventurer-honors/honors-data.ts"

ANSWER_SOURCE = "英文 Award Book 2020 未有 Supporting Answers；答案按中文要求由 AI 草擬"

DRAFT_ANSWERS: dict[str, list[tuple[int, str]]] = {
    "hka4016-alphabet-ii": [
        (0, "使用字母表掛圖、字母卡或唱字母歌，逐個認識 A 至 Z。"),
        (1, "用磁石字母、拼字卡或家長協助，逐字拼寫並寫出自己的名字。"),
        (2, "在家中或戶外散步，找以不同字母開頭的物品（如 B-書、C-椅），可記錄在紙上。"),
        (3, "看著字母表或字母卡，憑記憶寫出十個不同的字母。"),
        (4, "畫五個大階字母，從雜誌剪貼或手繪配合該字母的圖案（如 S-太陽、T-樹）。"),
        (5, "介紹象形文字、注音符號等其他書寫方式，可展示圖片或讓孩子試寫簡單符號。"),
    ],
    "hka4023-know-your-body": [
        (0, "背誦並討論哥林多前書 6:19：我們的身體是上帝的殿，要好好照顧。"),
        (1, "可指出：頭、頸、肩、手臂、手、胸、腹、背、腿、膝、腳、腳趾（共十二部分）。"),
        (2, "提供人形紙，讓孩子畫出身體並標示十二個部分名稱。"),
        (3, "膝蓋讓腿可以彎曲，幫助我們走路、跑跳、上下樓梯和坐下。"),
        (4, "樣貌幫助我們認識彼此、表達情緒；微笑和眼神可以關心別人。"),
        (5, "例如：拍手、寫字、畫畫、幫忙拿東西、舐手禱告、與人握手。"),
        (6, "用嘴巴唱詩、禱告、說鼓勵的話、向人見證耶穌，不說謊或傷害人的話。"),
    ],
    "hka4040-insects": [
        (0, "選一本適合幼兒的昆蟲繪本，由家長或導師朗讀；亦可到圖書館借閱。"),
        (1, "讀後請孩子說出三項所學，例如：昆蟲有六足、有些會變態、昆蟲對大自然有幫助等。"),
        (2, "可玩「昆蟲動作」遊戲：模仿蝴蝶、蜜蜂、螞蟻等動作，或做昆蟲配對卡遊戲。"),
        (3, "用紙盤、色紙或黏土製作昆蟲手工，例如蝴蝶、瓢蟲或蜜蜂。"),
    ],
    "hka4041-pets": [
        (0, "畫出或剪貼最喜歡的寵物圖片，並為牠填色。"),
        (1, "依寵物種類回答，例如：狗吃狗糧、貓吃貓糧、雀鳥吃穀物或飼料。"),
        (2, "描述寵物平常睡覺的位置，例如：狗窩、貓床、籠子或沙發。"),
        (3, "在家長陪同下，連續一週負責餵飼寵物（定時、適量、乾淨食水）。"),
        (4, "連續一週協助梳毛、清理籠舍、帶散步或換水等日常照顧。"),
        (5, "分享一件與寵物有關的親身經歷，例如第一次養寵物、寵物做的有趣事。"),
    ],
    "hka4044-sand-art": [
        (0, "閱讀馬太福音 7:24-27，討論聰明人把房子蓋在磐石上、愚拙人蓋在沙土上的意思。"),
        (1, "可查找例如：創世記 22:17、申命記 33:19、詩篇 139:18 等提及沙子的經文。"),
        (2, "用簡單道具或角色分配，重演聰明人和愚拙人蓋房子的故事。"),
        (3, "可唱《聰明人和愚拙人》或教會兒童詩歌中與建造、根基有關的歌曲。"),
        (4, "例如：建築用沙、玻璃、沙灘、沙畫、過濾器、沙漏、園藝混合土等。"),
        (5, "把食用色素或粉彩加入細沙，拌匀後晾乾，製成彩色沙。"),
        (6, "從下列項目中選做至少兩項；每項可獨立完成。"),
        (7, "在瓶內逐層倒入不同顏色彩沙，製作彩沙瓶。"),
        (8, "在相框底板塗膠，撒上彩沙固定，製作沙畫相框。"),
        (9, "在卡紙上塗膠，用彩沙或普通沙拼出圖案。"),
        (10, "在沙灘或沙池堆砌沙堡，談論穩固根基的重要。"),
        (11, "用衣夾加上彩沙和膠水，裝飾成蝴蝶造型。"),
    ],
    "hka4051-weather-i": [
        (0, "選一本天氣主題繪本，由家長或導師朗讀；圖書館或兒童讀物網站亦可找到。"),
        (1, "讀後請孩子說出三項所學，例如：下雨、出太陽、颳風、季節變化、要適當穿衣等。"),
        (2, "可玩「天氣動作」遊戲：導師說「落雨／出太陽／落雪」，孩子做相應動作。"),
        (3, "製作天氣手工，例如：紙碟太陽、棉花雲、雨點掛飾或天氣輪盤。"),
    ],
    "hka4007-crayons-and-markers": [
        (0, "蠟筆以石蠟、顏料等製成；八種主要顏色通常為：紅、橙、黃、綠、藍、紫、黑、白（或棕）。"),
        (1, "蠟筆主要由石蠟和顏料混合製成。"),
        (2, "遇熱會軟化或融化，顏色可能混色；因此不要長時間曝曬或靠近熱源。"),
        (3, "舊約聖經人物約瑟（創世記 37），他有一件彩色外衣。"),
        (4, "為約瑟和他的彩衣填色或繪畫，可參考創世記 37 章故事。"),
        (5, "用箱頭筆自由創作一幅圖畫，注意蓋回筆蓋。"),
        (6, "筆蓋防止墨水乾涸，也避免顏色弄污其他地方。"),
        (7, "應在紙上、畫板上使用；不應在牆壁、傢具、衣物或書本上使用。"),
        (8, "用厚紙或文件夾製作封面，貼上自己的照片，用蠟筆或箱頭筆裝飾。"),
        (9, "從下列 a-e 中選兩項，用蠟筆或箱頭筆完成填色或繪畫。"),
        (10, "可畫常見動物或雀鳥，例如：貓、狗、麻雀。"),
        (11, "可畫耶穌與孩子們一起的場景。"),
        (12, "用七色或漸層填色畫彩虹。"),
        (13, "把手放在紙上描邊，再為手形填色。"),
        (14, "畫出自己的房子外觀，可加門窗和家人。"),
        (15, "認識並說出九種顏色，例如：紅、橙、黃、綠、藍、紫、黑、白、粉。"),
    ],
    "hka4014-stamping-fun-i": [
        (0, "把蘋果、馬鈴薯或青瓜切半，蘸顏料或印泥在紙上蓋印。"),
        (1, "用布碎、皺紙、氣球或海綿蘸顏料，嘗試不同紋理的蓋印效果。"),
        (2, "用印章或自製圖章蓋出正方形、圓形和三角形圖案。"),
        (3, "收集貝殼、樹枝、樹葉等天然物件，蘸顏料後在紙上蓋印。"),
    ],
}


def format_answers(answers: list[tuple[int, str]]) -> str:
    parts = []
    for requirement_index, text in answers:
        parts.append(
            "{ requirementIndex: "
            + str(requirement_index)
            + ", text: "
            + json.dumps(text, ensure_ascii=False)
            + ', source: "Requirement draft" }'
        )
    return "[ " + ", ".join(parts) + " ]"


def patch_honor(text: str, honor_id: str, answers: list[tuple[int, str]]) -> str:
    block_pattern = re.compile(
        rf"(\{{\s*id: \"{re.escape(honor_id)}\"[\s\S]*?answers: )\[[\s\S]*?\]"
        rf"([\s\S]*?answerSource: \")[^\"]*(\"[\s\S]*?status: \")requirements-only(\")",
        re.MULTILINE,
    )

    def repl(match: re.Match[str]) -> str:
        return (
            f"{match.group(1)}{format_answers(answers)}"
            f"{match.group(2)}{ANSWER_SOURCE}"
            f"{match.group(3)}complete{match.group(4)}"
        )

    new_text, count = block_pattern.subn(repl, text, count=1)
    if count == 0:
        raise ValueError(f"Could not patch honor {honor_id}")
    return new_text


def main() -> int:
    text = HONORS_DATA.read_text(encoding="utf-8")
    for honor_id, answers in DRAFT_ANSWERS.items():
        text = patch_honor(text, honor_id, answers)
        print(f"Patched {honor_id} ({len(answers)} answers)")
    HONORS_DATA.write_text(text, encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
