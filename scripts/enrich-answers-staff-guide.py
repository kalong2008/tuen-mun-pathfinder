#!/usr/bin/env python3
"""
Re-enrich new-honor answers with cleaner staff-guide structure.
Skips files already marked as handcrafted staff guides.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "scripts/new-honors-answers-source.json"

# Handcrafted — do not overwrite
SKIP = {"HKA4031", "HKA4032", "YOU4940"}

PURPOSE: dict[str, str] = {
    "YOU4525": "認識籃子的功用與簡單編織，透過親手製作培養耐心、創作力與完成作品的成就感。",
    "YOU4530": "認識珠飾材料與基本串珠技巧，完成可佩戴或送人的小作品，練習手眼協調。",
    "YOU4555": "了解飛行／風箏基本原理，動手製作並試飛，培養觀察、調整與戶外活動興趣。",
    "YOU4590": "認識基本木工工具與安全，完成簡單木工項目，建立動手實作與謹慎習慣。",
    "YOU4700": "認識不同黏合方式與正確用膠，完成整潔的黏貼作品，培養細心與整潔。",
    "YOU4720": "用雙手光影創作動物或故事角色，激發想像力，並可連繫聖經故事分享。",
    "YOU4730": "透過多種手工媒材創作，並把作品送給別人，學習付出與關懷。",
    "YOU4755": "認識磁鐵原理與日常用途，用實驗培養好奇心，並連繫親近上帝的經文。",
    "YOU4790": "在磁鐵樂 I 基礎上進階認識磁極、電磁鐵與指南針，強化實驗觀察能力。",
    "YOU4830": "認識明信片與郵政溝通，練習書寫與寄送，關心遠方的人。",
    "YOU4855": "練習觀察、訪問與簡單報道，培養表達與分享資訊的能力。",
    "YOU4890": "認識手語是溝通方式之一，學習基本詞彙，體會關懷聽障群體。",
    "YOU4940": "認識錫／罐裝的歷史與用途，動手做小發明，並練習分享與捐贈。",
    "HKA4017": "認識烘焙安全與基本詞語，親手烤製食品，並思想耶穌是生命的糧。",
    "HKA4018": "培養在家主動幫忙的態度，用經文與記錄鞏固「甘心服務」的習慣。",
    "HKA4031": "讓幼小隊員體驗分享的喜樂：聽故事、唱歌、遊戲與送禮，把愛付諸行動。",
    "HKA4032": "培養樂於助人的品格：透過故事、詩歌、遊戲、手工與一週家務實踐。",
    "YOU4595": "學習有系統地蒐集與整理，培養觀察、分類與分享收藏的興趣。",
    "YOU4600": "認識科技／電腦基本概念與安全使用，學習以負責任態度使用工具。",
    "YOU4605": "在成人監督下體驗簡單煮食，認識廚房安全與健康飲食。",
    "YOU4690": "認識植物生長與照顧，親手園藝，體會上帝創造與供應。",
    "YOU4735": "利用家居材料製作實用／美觀小物，學習惜物與創意再利用。",
    "YOU4885": "認識縫紉基本用具與針法，完成簡單縫製品，培養耐心與精細動作。",
    "YOU4950": "透過音樂／吟唱／表演認識遊唱文化，練習表達與分享才藝。",
    "HKA4039": "認識狗的特徵與照顧責任，學習仁慈對待動物。",
    "HKA4043": "認識食水安全與潔淨水源的重要，培養珍惜食水的習慣。",
    "HKA4045": "認識瀕危與絕種議題，激發保護上帝所造動物的心志與行動。",
    "HKA4048": "透過聖經、觀察與實驗認識種子，連繫信心成長與上帝的創造。",
    "HKA4050": "認識宇宙與銀河的宏大，讚嘆創造主，並以遊戲加深印象。",
    "YOU4515": "認識基本天文概念與觀星，培養對夜空與創造的敬畏。",
    "YOU4640": "認識環境問題與個人可做的保護行動，作大地的好管家。",
    "YOU4645": "觀察與認識鳥類，學習照顧與欣賞飛鳥。",
    "YOU4695": "認識岩石／地質基本概念，透過收集與觀察了解地球。",
    "YOU4715": "認識棲息地概念，實地觀察動植物，思想創造與新天新地。",
    "YOU4745": "認識蜜蜂社會與授粉角色，培養尊重與保護傳粉者的態度。",
    "YOU4750": "認識蜂蜜來源與養蜂，品嚐並連繫聖經中「蜜」的比喻。",
    "YOU4770": "認識瓢蟲特徵與益蟲角色，培養細心觀察昆蟲。",
    "YOU4780": "認識蜥蜴與爬蟲學，學習安全觀察與照顧知識。",
    "YOU4820": "培養戶外觀察與探索能力，安全地認識身邊自然。",
    "YOU4945": "認識樹木與葉子，收集製作標本，了解樹木對人的益處。",
    "YOU4980": "認識鯨類特徵與保育，透過故事（約拿）連繫聖經。",
    "HKA4057": "認識拍照器材與尊重他人，用攝影記錄生活並思想人按上帝形象被造。",
    "HKA4059": "認識雪鞋歷史與安全，在可行環境下體驗或替代認識冬季活動。",
    "HKA4895": "認識滑冰安全與基本技巧，培養平衡與運動習慣。",
    "YOU4505": "在合格導師下認識射箭安全與基本技巧，強調紀律與專注。",
    "YOU4575": "認識露營基本技能與安全，培養戶外生活能力。",
    "YOU4580": "在游泳基礎上學習獨木舟平衡與划行，強調救生衣與成人監督。",
    "YOU4710": "認識基本體操動作與安全落地，培養身體協調。",
    "YOU4765": "認識常用繩結名稱與用途，練習打結並展示，強調實用與安全。",
    "YOU4815": "認識奧運精神與公平競賽，用小運動會與經文思想屬靈賽跑。",
    "YOU4900": "認識滑雪裝備與基本技巧，在安全場地練習（或替代認識）。",
    "YOU4995": "在合格教練下認識馬術安全與基本騎乘，培養尊重動物與紀律。",
    "HKA4069": "學習選經文故事、掌握講故事技巧，並實際講述，培養靈修表達。",
    "HKA4070": "認識「生命的糧」真理，透過經文與活動思想倚靠耶穌。",
    "HKA4074": "認識好撒瑪利亞人精神，把憐憫化為實際關懷行動。",
    "HKA4075": "認識最後晚餐／聖餐意義，用適合年齡方式思想耶穌的愛與捨己。",
    "HKA4081": "認識身心純潔的重要，用適合年齡的方式建立健康界線與選擇。",
    "HKA4082": "認識會幕結構與屬靈預表，連繫耶穌是進到上帝面前的路。",
    "YOU4545": "認識聖經中的君王／王族故事，思想真正的王——耶穌。",
    "YOU4630": "認識門徒呼召與跟隨，鼓勵今日作耶穌的門徒。",
    "YOU4675": "透過經文與活動認識作耶穌的朋友，培養日常親近主。",
    "YOU4685": "認識聖靈的果子，選一項深入活出並用創作表達。",
    "YOU4805": "認識自己的教會與敬拜群體，建立歸屬與參與感。",
    "YOU4825": "關注並期待基督復臨與天國盼望，用比喻與經文建立盼望。",
    "YOU4835": "認識禱告是與上帝交談，建立簡單、真誠的禱告習慣。",
    "YOU4840": "進深認識代禱與恆切禱告，學習為別人代求。",
    "YOU4850": "認識彩虹之約與上帝信實，建立信靠應許的心。",
    "YOU4915": "用適合年齡的方式認識救恩步驟，鼓勵個人回應耶穌。",
}


def strip_auto_tips(body: str) -> str:
    """Remove previously auto-appended 帶領提示/注意 blocks; keep knowledge content."""
    # Cut from first auto-style 帶領提示 that starts with 按要求完成
    body = re.split(r"\n\n帶領提示：按要求完成", body, maxsplit=1)[0]
    # Also remove trailing 帶領提示／注意 that look generic if duplicated
    body = re.sub(r"\n\n帶領提示：.*$", "", body, flags=re.S)
    body = re.sub(r"\n\n注意：.*$", "", body, flags=re.S)
    body = re.sub(r"\n\n安全注意：.*$", "", body, flags=re.S)
    # Remove honor-level blocks if they leaked into a req
    body = re.sub(r"^榮譽證目的：.*?(?=\n\n|\Z)", "", body, count=1, flags=re.S)
    body = re.sub(r"^帶領建議：.*?(?=\n\n|\Z)", "", body, count=1, flags=re.S)
    return body.strip()


def tips_for(code: str, category: str, req_line: str, main: str) -> tuple[str, str | None]:
    """Return (帶領提示, optional 注意)."""
    tips: list[str] = []
    notes: list[str] = []

    tips.append("先簡短講解重點，再讓幼鋒動手／討論；結束時請用自己的話說出學到什麼。")

    if category == "arts-crafts":
        tips.append("預先備妥範例與材料；示範一次再分發。")
        notes.append("預留收拾時間；尖銳工具由成人操作。")
    elif category == "household":
        tips.append("鼓勵家長一同參與；強調甘心服務而非比較。")
    elif category == "nature":
        if any(k in req_line for k in ("戶外", "觀察", "種植", "捕捉", "實地", "遠足")):
            tips.append("戶外時注意天氣、水、防曬與結伴。")
            notes.append("尊重生物；不傷害、不隨意放生外來種。")
        else:
            tips.append("可用實物、圖片或短片輔助說明。")
    elif category == "recreation":
        tips.append("安全第一：說明規則後才開始活動。")
    elif category == "spiritual":
        tips.append("用語適合年齡；留給孩子發問的空間。")
        notes.append("鼓勵回應但不強迫公開決志或私密分享。")

    # Precise activity notes (avoid single-char false positives like 馬 in 馬太)
    if re.search(r"射箭|弓箭", req_line):
        notes.append("必須由合資格射箭導師帶領。")
    if re.search(r"騎馬|馬術|馬匹", req_line) or code == "YOU4995":
        notes.append("必須由合資格騎術教練帶領；佩戴頭盔。")
    if re.search(r"滑雪|雪橇", req_line) or code == "YOU4900":
        notes.append("在合格雪場／教練下進行；香港可輔以影片或室內場。")
    if re.search(r"雪鞋", req_line) or code == "HKA4059":
        notes.append("無雪地區可改為認識體驗＋替代健行，並註明條件。")
    if re.search(r"獨木舟|划船|泛舟", req_line) or code == "YOU4580":
        notes.append("必須穿救生衣；確認已達游泳要求。")
    if re.search(r"游泳|跳水|潛水", req_line):
        notes.append("成人監督；只在核准水域進行。")
    if re.search(r"烘焙|煮食|廚房|烤箱", req_line) or code in {"HKA4017", "YOU4605"}:
        notes.append("成人全程在場；注意燙傷與刀具。")
    if re.search(r"品嚐|食用|吃", req_line):
        notes.append("事先查詢過敏；準備清水與紙巾。")
    if re.search(r"背誦|經文", req_line):
        tips.append("可用動作、字卡或歌曲幫助記憶。")
    if re.search(r"捐|送出|分享給", req_line):
        tips.append("著重心意與尊重對方，避免比較數量。")
    if re.search(r"製作|手工|縫|拼貼|畫", req_line):
        tips.append("能力較弱者可二人一組或家長協助。")

    tip = " ".join(dict.fromkeys(tips))  # dedupe preserve order
    note = " ".join(dict.fromkeys(notes)) if notes else None
    return tip, note


def parse_answers(ans_section: str) -> dict[int, str]:
    return {
        int(m.group(1)): m.group(2).strip()
        for m in re.finditer(r"### 要求 (\d+)\n\n(.*?)(?=\n### 要求 |\Z)", ans_section, re.S)
    }


def main() -> None:
    honors = json.loads(SOURCE.read_text(encoding="utf-8"))
    for h in honors:
        code = h["code"]
        if code in SKIP:
            print("skip", code)
            continue
        path = ROOT / h["path"]
        text = path.read_text(encoding="utf-8")
        parts = text.split("---", 2)
        fm = parts[1].strip()
        body = parts[2].lstrip("\n")
        req_section = body.split("## 要求", 1)[1].split("## 答案", 1)[0].strip()
        ans_raw = body.split("## 答案", 1)[1]
        answers = parse_answers(ans_raw)
        cat_m = re.search(r"^category:\s*(\S+)", text, re.M)
        category = cat_m.group(1) if cat_m else "nature"
        purpose = PURPOSE.get(code, f"幫助幼鋒完成「{h.get('nameZh')}」各項要求，在知識、品格與實踐上成長。")

        req_blocks = {
            int(m.group(1)): re.sub(r"\s+", " ", m.group(0)).strip()
            for m in re.finditer(r"(?m)^(\d+)\.\s+(.+?)(?=\n\d+\.\s+|\Z)", req_section, re.S)
        }

        new_answers = {}
        for n, a in answers.items():
            main = strip_auto_tips(a)
            tip, note = tips_for(code, category, req_blocks.get(n, ""), main)
            pieces = [main, "", f"帶領提示：{tip}"]
            if note:
                pieces.append(f"注意：{note}")
            new_answers[n] = "\n".join(pieces)

        purpose_block = (
            f"榮譽證目的：{purpose}\n\n"
            "帶領建議：開始前用一句話說明今天為何考此證與安全規則；"
            "結束時用 1–2 分鐘覆述重點，並鼓勵回家與家人分享。\n"
        )
        blocks = [f"### 要求 {n}\n\n{new_answers[n]}" for n in sorted(new_answers)]
        new_body = f"## 要求\n\n{req_section}\n\n## 答案\n\n{purpose_block}\n" + "\n\n".join(blocks) + "\n"
        path.write_text("---\n" + fm + "\n---\n\n" + new_body, encoding="utf-8")
        print("ok", code)

    print("done")


if __name__ == "__main__":
    main()
