#!/usr/bin/env python3
"""
Enrich OLD (pre-existing) adventurer honors with staff-guide structure:
榮譽證目的 / 帶領建議 / per-req 帶領提示+注意 when content is thin.
Preserves existing 教學理念/材料/程序 blocks.
"""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "app/adventurer-honors/content"
NEW_SOURCE = ROOT / "scripts/new-honors-answers-source.json"

import json

NEW_CODES = {h["code"] for h in json.loads(NEW_SOURCE.read_text(encoding="utf-8"))}

# Curated purposes for old honors
PURPOSE: dict[str, str] = {
    "HKA4006": "認識顏色名稱與生活中的色彩，培養觀察與表達能力。",
    "HKA4007": "認識蠟筆與箱頭筆等繪畫工具，享受創作並練習手部控制。",
    "HKA4008": "透過手指遊戲發展精細動作、節奏與語言，連繫日常自理與敬拜。",
    "HKA4009": "在安全環境探索小工具與沙子，培養感官與想像遊戲。",
    "HKA4010": "透過拼圖練習觀察、耐心與完成任務的堅持。",
    "HKA4011": "認識簡單音樂元素與節奏，用歌聲／樂器讚美與表達情感。",
    "HKA4012": "認識基本形狀與大小比較，連繫生活物品與秩序感。",
    "HKA4013": "用海綿壓印創作，體驗質感與色彩混合的樂趣。",
    "HKA4014": "認識圖章基本用法，完成簡單蓋印作品。",
    "YOU4510": "認識藝術家與創作過程，動手完成藝術作品並欣賞美。",
    "YOU4560": "認識聖經與生活中的「建造」，動手搭建並討論穩固根基。",
    "YOU4570": "認識鈕扣種類與功用，練習扣鈕並完成鈕扣手工。",
    "YOU4795": "學習以基督徒價值審視媒體內容，培養明智選擇。",
    "YOU4800": "進深認識音樂元素與敬拜音樂，參與簡單演奏或歌唱。",
    "YOU4810": "製作相冊／圖文書，記錄家人朋友與感恩時刻。",
    "YOU4910": "進階圖章技巧與作品設計，完成更完整的蓋印創作。",
    "HKA4001": "認識社區公務員／服務人員，感謝他們的貢獻並學習求助。",
    "HKA4002": "認識合作的重要，透過遊戲與聖經故事練習同心同行。",
    "HKA4003": "認識防火安全與逃生要點，培養遇火警時的正確反應。",
    "HKA4004": "認識服務與幫助他人，動手實踐關懷行動。",
    "HKA4005": "認識社區朋友與鄰居，學習讓社區更好並分享耶穌的愛。",
    "YOU4615": "認識自己的國家／象徵與公民責任，培養愛國與感恩。",
    "YOU4860": "認識道路安全規則，養成過馬路與乘車的安全習慣。",
    "HKA4015": "認識字母，透過遊戲與感官活動建立語文興趣。",
    "HKA4016": "鞏固字母認識，進階配對與簡單拼讀遊戲。",
    "HKA4019": "認識健康生活習慣與醫護角色，學習照顧身體。",
    "HKA4020": "認識健康食物與食物分類，用遊戲與實作培養好飲食。",
    "HKA4021": "認識身體清潔與健康習慣，學習照顧牙齒與身體。",
    "HKA4022": "學習在家幫忙做適合年齡的家務，培養甘心服務。",
    "HKA4023": "認識身體主要部位與功用，感謝上帝奇妙的創造。",
    "HKA4024": "認識基本禮儀用語與態度，學習尊重別人。",
    "HKA4025": "認識家庭成員與愛家，用創作表達對家人的感恩。",
    "HKA4026": "認識數字與簡單數數，透過遊戲建立數感。",
    "HKA4027": "培養閱讀興趣與聽故事習慣，按程度選擇合適書籍。",
    "HKA4028": "延續閱讀習慣，擴展書籍類別與分享心得。",
    "HKA4029": "進階閱讀與記錄，鼓勵持續閱讀與討論。",
    "HKA4030": "鞏固長期閱讀習慣，完成更高階閱讀目標。",
    "HKA4033": "教導幼兒享受「被讀故事」的價值，並練習感恩回應。",
    "HKA4034": "延續故事聆聽習慣，擴展類別並表達感謝。",
    "HKA4064": "認識良善與仁慈的行為，透過故事與行動活出來。",
    "YOU4620": "認識禮貌用語與態度，在家／教會／社區實踐尊重。",
    "YOU4740": "進階家庭幫手角色，承擔更多適合的家務責任。",
    "YOU4760": "認識個人衛生習慣，學習清潔與健康生活。",
    "YOU4865": "認識居家與社區安全守則，培養預防意外的警覺。",
    "HKA4035": "認識動物特徵與照顧責任，學習仁慈對待上帝所造之物。",
    "HKA4036": "認識不同動物的家／棲息，觀察並感謝創造的多樣。",
    "HKA4037": "認識本地常見鳥類，透過觀察與活動欣賞飛鳥。",
    "HKA4038": "認識水的功用、形態與珍惜食水，連繫創造故事。",
    "HKA4040": "認識常見昆蟲，安全觀察並了解牠們的角色。",
    "HKA4041": "認識寵物照顧責任，學習愛護與尊重動物。",
    "HKA4042": "認識馬鈴薯／植物成長，動手觀察與簡單烹調體驗。",
    "HKA4044": "用沙土創作，體驗質感藝術並發揮想像。",
    "HKA4046": "透過尋寶遊戲培養觀察力，並連繫聖經故事物件。",
    "HKA4047": "認識四季變化與穿著／活動，體會「凡事都有定時」。",
    "HKA4049": "認識星星與夜空，讚嘆創造主的大能。",
    "HKA4051": "認識基本天氣現象，學習觀察與描述天氣。",
    "HKA4052": "進階認識天氣與記錄，培養持續觀察習慣。",
    "HKA4053": "認識綿羊特徵與聖經中的羊／牧人比喻。",
    "HKA4054": "認識動物園動物，學習觀察與保護野生動物。",
    "YOU4565": "認識蝴蝶生命週期與特徵，觀察並感謝創造。",
    "YOU4655": "認識魚類特徵與照顧／觀察，連繫創造中的水族。",
    "YOU4665": "認識花卉構造與欣賞，可用手工或種植加深印象。",
    "YOU4670": "認識如何作動物的朋友，學習仁慈與負責任的照顧。",
    "YOU4680": "認識自然環境與戶外禮儀，培養愛護大自然的心。",
    "HKA4055": "認識單車基本安全與裝備，培養安全騎行意識。",
    "HKA4056": "認識左右方向，透過遊戲建立空間方位感。",
    "HKA4058": "認識友誼與交友原則，用遊戲和手工實踐友善。",
    "HKA4060": "認識游泳安全與基本水感，在成人監督下建立親水信心。",
    "HKA4061": "認識玩具的分享與收拾，培養愛惜與輪流使用。",
    "HKA4062": "認識火車與卡車等交通工具，連繫社區與安全。",
    "HKA4063": "認識三輪車／單車安全騎行，練習平衡與規則。",
    "YOU4585": "認識關懷別人的具體行動，把愛實踐在日常。",
    "YOU4625": "進階單車安全與技巧，強化道路意識。",
    "YOU4650": "認識基本急救觀念與求助，強調成人主導與安全界線。",
    "YOU4660": "認識健身與運動安全，培養活躍健康的生活習慣。",
    "YOU4705": "認識領袖服事特質，練習帶領與服務而非轄管。",
    "YOU4905": "培養觀察力，認識制服團體與社區服務角色。",
    "YOU4920": "鞏固游泳安全與基本技巧，在淺水建立自信與能力。",
    "YOU4925": "進階游泳技巧與耐力，持續強調安全與成人監督。",
    "HKA4065": "認識聖經人物故事，建立對聖經的喜愛與熟悉。",
    "HKA4066": "延續聖經人物學習，擴展故事與品格應用。",
    "HKA4067": "進階聖經認識與經文記憶，培養靈修習慣。",
    "HKA4068": "鞏固聖經學習與分享，鼓勵把真理活出來。",
    "HKA4071": "認識創造七日，用活動慶祝上帝是創造主。",
    "HKA4072": "認識安息日的意義與喜樂，學習分別為聖的休息與敬拜。",
    "HKA4073": "認識上帝創造的世界，透過觀察自然讚美創造主。",
    "HKA4076": "認識耶穌之星／聖誕相關真理，思想上帝差遣救主。",
    "HKA4077": "認識聆聽的重要，練習專心聽上帝的話與別人說話。",
    "HKA4078": "認識孩童時期的耶穌，連繫成長、家庭與順服。",
    "HKA4079": "認識耶穌是最好的朋友，培養日常親近主。",
    "HKA4080": "認識耶穌的比喻，用適合年齡方式明白天國道理。",
    "YOU4535": "認識聖經基本結構與重要經文，建立讀經根基。",
    "YOU4540": "進階聖經知識與應用，鼓勵查考與分享。",
    "YOU4635": "認識早期復臨先鋒，學習信心、犧牲與使命。",
    "YOU4935": "認識節制與健康選擇，把身體當作聖靈的殿。",
    "YOU4985": "認識基督徒管家職分，學習忠心管理時間、才幹與資源。",
}

STRUCTURED_RE = re.compile(r"(教學理念|教學概念|教導概念|材料：|程序：|步驟：|帶領提示：)")


def extract_existing_purpose(ans: str) -> str | None:
    m = re.search(r"該獎項的目的是([^。\n]+。?)", ans)
    if m:
        return m.group(0).replace("該獎項的目的是", "").strip(" ：:")
    m = re.search(r"榮譽證目的：([^\n]+)", ans)
    if m:
        return m.group(1).strip()
    return None


def parse_answers(ans_section: str) -> dict[int, str]:
    return {
        int(m.group(1)): m.group(2).strip()
        for m in re.finditer(r"### 要求 (\d+)\n\n(.*?)(?=\n### 要求 |\Z)", ans_section, re.S)
    }


def tips_for(category: str, req_line: str, body: str) -> tuple[str, str | None]:
    tips = ["先講解重點，再讓幼鋒動手或討論；結束時請用自己的話說出學到什麼。"]
    notes: list[str] = []

    if STRUCTURED_RE.search(body):
        # Already has teaching blocks — light tip only
        return "按既有教學理念／材料／程序帶領；職員先讀一遍再帶領。", None

    if category == "arts-crafts":
        tips.append("預先備妥範例與材料；示範一次再分發。")
        notes.append("尖銳工具由成人操作；預留收拾時間。")
    elif category == "household":
        tips.append("鼓勵家長同行；強調甘心而非比較。")
    elif category == "community":
        tips.append("外出前徵求家長同意，並確保足夠成人比例。")
    elif category == "nature":
        if re.search(r"戶外|觀察|遠足|尋寶", req_line):
            tips.append("注意天氣、飲水、防曬與結伴。")
            notes.append("尊重生物；不傷害。")
        else:
            tips.append("可用實物、圖片或短片輔助。")
    elif category == "recreation":
        tips.append("先說明安全規則再開始。")
        if re.search(r"游泳|跳水|水", req_line):
            notes.append("成人監督；只在核准水域進行。")
        if re.search(r"單車|騎", req_line):
            notes.append("戴頭盔；選擇安全場地。")
        if re.search(r"急救", req_line):
            notes.append("示範為主；實際處理由成人負責。")
    elif category == "spiritual":
        tips.append("用語適合年齡；留給發問空間。")
        notes.append("鼓勵回應但不強迫公開決志。")

    if re.search(r"烘焙|煮食|廚房", req_line):
        notes.append("成人全程在場；防燙防刀。")
    if re.search(r"品嚐|食用", req_line):
        notes.append("查詢過敏。")
    if re.search(r"背誦|經文", req_line):
        tips.append("可用動作或字卡幫助記憶。")

    tip = " ".join(dict.fromkeys(tips))
    note = " ".join(dict.fromkeys(notes)) if notes else None
    return tip, note


def enrich_path(path: Path) -> bool:
    text = path.read_text(encoding="utf-8")
    if "## 答案" not in text or "## 要求" not in text:
        return False
    if "榮譽證目的：" in text.split("## 答案", 1)[1][:200]:
        # already enriched at top
        return False

    code_m = re.search(r"^code:\s*(\S+)", text, re.M)
    cat_m = re.search(r"^category:\s*(\S+)", text, re.M)
    name_m = re.search(r'^nameZh:\s*"?([^"\n]+)"?', text, re.M)
    if not code_m:
        return False
    code = code_m.group(1)
    if code in NEW_CODES:
        return False

    category = cat_m.group(1) if cat_m else "nature"
    name = name_m.group(1).strip() if name_m else code

    parts = text.split("---", 2)
    fm = parts[1].strip()
    body = parts[2].lstrip("\n")
    req_section = body.split("## 要求", 1)[1].split("## 答案", 1)[0].strip()
    ans_section = body.split("## 答案", 1)[1]

    answers = parse_answers(ans_section)
    if not answers:
        # Some old files may use different answer heading format — skip safely
        return False

    purpose = PURPOSE.get(code) or extract_existing_purpose(ans_section) or (
        f"幫助幼鋒完成「{name}」各項要求，在知識、品格與實踐上成長。"
    )

    req_blocks = {
        int(m.group(1)): re.sub(r"\s+", " ", m.group(0)).strip()
        for m in re.finditer(r"(?m)^(\d+)\.\s+(.+?)(?=\n\d+\.\s+|\Z)", req_section, re.S)
    }

    new_answers: dict[int, str] = {}
    for n, a in answers.items():
        tip, note = tips_for(category, req_blocks.get(n, ""), a)
        # Avoid duplicating if already has 帶領提示
        if "帶領提示：" in a:
            new_answers[n] = a.strip()
            continue
        pieces = [a.strip(), "", f"帶領提示：{tip}"]
        if note:
            pieces.append(f"注意：{note}")
        new_answers[n] = "\n".join(pieces)

    purpose_block = (
        f"榮譽證目的：{purpose}\n\n"
        "帶領建議：開始前用一句話說明今天為何考此證與注意事項；"
        "結束時用 1–2 分鐘覆述重點，並鼓勵回家與家人分享。\n"
    )
    blocks = [f"### 要求 {n}\n\n{new_answers[n]}" for n in sorted(new_answers)]
    new_body = f"## 要求\n\n{req_section}\n\n## 答案\n\n{purpose_block}\n" + "\n\n".join(blocks) + "\n"
    path.write_text("---\n" + fm + "\n---\n\n" + new_body, encoding="utf-8")
    return True


def main() -> None:
    enriched = 0
    skipped = 0
    for path in sorted(CONTENT.rglob("*.md")):
        if "test0000" in path.name or path.name.startswith("NEW-"):
            continue
        text = path.read_text(encoding="utf-8")
        code_m = re.search(r"^code:\s*(\S+)", text, re.M)
        if not code_m or code_m.group(1) in NEW_CODES:
            continue
        if enrich_path(path):
            enriched += 1
            print("enriched", code_m.group(1), path.name)
        else:
            skipped += 1
    print(f"Done enriched={enriched} skipped={skipped}")


if __name__ == "__main__":
    main()
