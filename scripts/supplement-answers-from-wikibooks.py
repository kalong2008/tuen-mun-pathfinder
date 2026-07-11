#!/usr/bin/env python3
"""
Supplement new-honor Chinese answers using Wikibooks Adventurer Awards content.
Source: https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers
Only enriches thin/draft answers; keeps strong existing text.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# Curated Traditional Chinese supplements derived from Wikibooks pages.
# Keys: code -> {requirement_number: zh text}
# These REPLACE existing answers for listed numbers when marked replace,
# or APPEND as 「補充」 when existing answer is already substantial.

WIKI_SUPPLEMENTS: dict[str, dict[int, str]] = {
    "YOU4790": {  # Magnet Fun II
        1: "須先考取「磁鐵樂 I」（Wikibooks 稱 Invisible Force 1／Magnet Fun）。複習磁鐵能吸引什麼、南北極概念後再開始本級。",
        2: "用兩塊磁鐵玩相吸與相斥。填空：所有磁鐵都有**正／北**極與**負／南**極；異極相吸、同極相斥。（Wikibooks 用 positive／negative 描述兩極。）",
        3: "製作電磁鐵（成人監督）：鐵釘＋絕緣電線＋乾電池，電線單向緊密纏繞鐵釘後接電池。通電可吸迴紋針；斷電磁力消失。比較永久磁鐵與電磁鐵。",
        4: "用指南針找出八個方向（東、南、西、北、東北、東南、西南、西北），並畫在羅盤玫瑰圖（Compass Rose）上。",
        5: "自製指南針：磁鐵單向摩擦縫衣針→穿過軟木／蠟紙→浮於水盤；可滴蠟燭固定。針靜止後一端大致指北，再與真羅盤比對。",
        6: "磁鐵掉落或劇烈撞擊後，內部磁域可能混亂，磁力變弱甚至幾乎消失。教導輕放、妥善收藏。",
        7: "學習箴言 18:24（Wikibooks 引 KJV 概念：朋友須以友善待人；有一位朋友比弟兄更親密）。討論：耶穌是永遠願意親近我們的最好朋友；即使彼此不同，也可因同一目標（討主喜悅、天國）互相吸引。",
    },
    "HKA4031": {  # Sharing — rich Wikibooks Little Lamb material
        1: "聆聽／講述關於分享的故事。聖經常用例子：五餅二魚（約 6:1-14）——小男孩分享五個大麥餅和兩條小魚。可用圖卡分段、角色扮演或偶劇輔助。",
        2: "唱一首分享主題歌曲。活動建議：圍圈，每次唱完請一位幼鋒從玩具箱選一件玩具送給同伴，之後一起玩耍並練習分享。亦可搜尋兒童「sharing」詩歌。",
        3: "玩分享遊戲（類似「燙手山芋」）：圍圈傳球，邊傳邊念節奏短句，最後拿到球的人站到圈中再換人。重點是「不要握太久、快快傳給別人」，而非競爭輸贏。",
        4: "完成一件可愛到可以送人的手工並分享。示例（五餅二魚籃）：兩張紙盤（一張對半）、打孔後用毛線縫成籃；著色剪下五餅二魚放入籃中，送給家人或朋友並說祝福的話。",
    },
    "HKA4045": {  # Saving Animals
        1: "動物瀕危常見原因（可選數項深入討論）：過度捕獵、棲息地喪失、過度特化、污染、外來入侵種、人獸衝突、疾病、低繁殖率、基因脆弱、族群過小。用語配合幼鋒年齡，避免過度驚嚇。",
        2: "絕種＝世上再也沒有該物種。可能因盜獵、過度捕獵、天災、棲息地消失等。一旦絕種無法挽回，生態鏈也會受影響。",
        3: "認識至少 5 種已絕種動物示例：渡渡鳥（Dodo）、劍齒虎、中華鱘／白鲟相關物種、聖赫勒拿蠼螋、袋狼（Thylacine）、藍羚、猛獁象等（可依教材調整）。",
        4: "深入認識 5 種瀕危動物（示例）：大熊貓（中國山地、以竹為主食）、老虎（棲息地破壞與盜獵）、美洲鶴（曾極危、靠復育回升）、藍鯨（體型最大、曾遭過度捕鯨）、亞洲象（人象衝突與盜獵）。簡述住哪裡、為何危險、人可怎樣幫助。",
        5: "瀕危名單數量會隨時間更新，請查保育組織／IUCN 等可靠資料。收集至少 5 種瀕危動物照片並標名，例如：非洲象、孟加拉虎、黑犀、大熊貓、山地大猩猩、科摩多龍等。",
        6: "製作海報或小冊子鼓勵拯救瀕危動物，並展示給他人看。內容可含：為什麼重要、可採取的行動（減少即棄塑膠、支持保育、愛護動物）。",
        7: "背誦箴言 12:10：「義人顧惜他牲畜的命……」。討論：上帝關心動物，我們也要仁慈對待並保護牠們。",
    },
    "HKA4048": {  # Seeds
        1: "聆聽馬太福音 13:3-9 撒種的比喻。另讀至少兩節：創 1:11、可 4:31、太 17:20。重點：上帝使地長出植物；信心可以像芥菜種一樣成長。",
        2: "種子發芽需要適當溫度、水分與氧氣；良好土壤與光線也影響發芽。水與氧進入種子後，細胞開始膨脹生長。",
        3: "觀察發芽：種子吸水膨脹、種皮破裂；胚根先長出吸收水分並固定；之後胚軸伸長，胚芽／子葉出土（或不出土，視植物種類）。幼苗在能獨立光合作用前，靠種子儲存養分。可用豆子浸水＋棉花盒觀察。",
        4: "自然傳播方式：鳥類取食後排遺、風力（如蒲公英）、水流漂浮、依附動物皮毛等。可展示可可椰子（Coco de Mer）等特別例子。",
        5: "所見最大／最小種子：最大常舉塞舌爾雙椰子（可可椰子），可重達約 50 磅；最小多為蘭花種子，比鹽粒直徑還細。可用實物或圖片比較。",
        6: "品嚐多種可安全食用的種子／堅果（葵花籽、南瓜籽、芝麻、花生等），注意過敏與成人監督，享受探索新食物。",
        7: "每類至少收集並標示 2 種：樹種、水果種子、蔬菜種子、穀物／草籽、堅果。可用小袋或蛋格分類。",
        8: "用種子做拼貼畫或其他種子工藝。可選唱種子主題詩歌（如 Plant Your Seed），連繫「把信心種在主耶穌裡」。",
    },
    "HKA4057": {  # Photo Fun — align numbering with ZH (has extra Q3)
        1: "認識相機基本結構（手機／平板也有）：鏡片（鏡頭）、快門、變焦、屏幕／取景器、電池、電源按鈕。請幼鋒在實機上指出位置。",
        2: "討論／展示不同拍照設備，問：想用哪一種拍照？想和誰合照？鼓勵開放討論。",
        3: "開放分享：喜不喜歡拍照？喜歡拍什麼？沒有標準答案。",
        4: "保養：勿觸摸鏡頭、使用手腕／頸帶、保持乾燥清潔、勿摔、使用前先徵求許可、用完關機。",
        5: "拍攝並分享多種題材：家人、朋友、風景、動物、最愛的地方、常去的地方、少去的地方。目標是體驗多樣場景；指導穩妥持機、變焦等功能。",
        6: "趣味遊戲：照片尋寶；「這是什麼？」特寫猜物；「這在哪裡？」；擺出聖經人物姿勢拍照讓同伴猜。",
        7: "讀創 1:26-27。『照著上帝的形象』表示人按上帝樣式被造。可延伸：每個人都珍貴；拍照時先問准、尊重別人。",
    },
    "HKA4069": {  # Bible Storytelling
        1: "選五個聖經故事並說出經卷位置。建議兼顧新舊約、不一定只選最常見的。示例：路得記 1–4；以利亞被烏鴉供養（王上 17）；約拿（拿 1–2）；撒該（路 19:1-10）；五餅二魚（可 6:32-44）；耶穌醫治瞎子（可 8:22-26）。",
        2: "根據所選故事，討論人物言行如何顯出愛或不愛耶穌／上帝（聽從、勇敢、自私、悔改等）。可用該隱與亞伯對比。",
        3: "講故事三件要事：① 帶出重點並作屬靈應用；② 使用視覺輔助；③ 有熱忱、口齒清楚。",
        4: "向小組講述其中兩個故事（家庭崇拜、俱樂部聚會等均可）。給予鼓勵性回饋。",
        5: "用兩種不同方法呈現兩個故事，例如：繪畫、LEGO、手工、立體布景（diorama）、默劇／猜謎等。",
    },
    "YOU4730": {  # Handicraft
        6: "從下列完成六項（可全班同項或分組自選）：慰問卡（紙、蕾絲等裝飾，送給病人）、乾花／絲花插花、烘焙／黏土彩繪創作、貝殼畫、繩藝、活動吊飾（至少三種圖樣）、紙漿動物或車、蛋殼種子貝類拼畫、紀念冊／相簿封面、六種材料拼貼、活動海報、或自選完整作品。強調創意與完成度。",
        7: "至少送出兩件：給家人或朋友；給教會或社區長者。可安排親自送達（必要時協助交通），並說感謝或祝福的話。",
    },
    "HKA4032": {  # Special Helper
        1: "聆聽關於幫助人的故事／影片。可用好撒瑪利亞人等聖經故事（適合年齡的改編），或其他幫助主題繪本。",
        2: "唱幫助主題歌曲。示例：改編「Here We Go Round the Mulberry Bush」為「This Is the Way We Help at Home」（掃地、收拾玩具、除塵等動作）；或 Helping Hands 等詩歌，邊唱邊做動作。",
        3: "玩幫助遊戲。示例：清理接力——地上散置物品，親子接力收拾到籃中；重點是一起清理，而非過度競賽。之後討論：在家喜歡幫忙什麼？爸爸媽媽怎樣一起收拾？",
        4: "做一件提醒「幫助」的手工。示例：厚紙板形狀打孔，用毛線練習「縫」穿洞，帶回練習。",
        5: "連續一週幫家人做一項特別家務（如餵寵物、衣服放洗衣籃、整理床鋪、幫忙簡單備餐）。若聚會間隔較長，可改為「到下次聚會前多數日子都幫忙」。與家長一起計劃每天做什麼。",
    },
    "HKA4017": {  # Baking
        1: "烘焙定義：用乾熱（通常在烤箱中）烹調食物，不直接接觸火焰。液體成分在正確比例與溫度下經化學變化成為固體成品。",
        2: "廚房安全：先洗手；保持枱面與器具清潔；必須有成人在場；勿奔跑；立即擦乾溢漏；正確使用刀具；用完確認烤箱／電器已關；備急救包；穿合適衣履；注意寵物與其他孩子的位置。",
        3: "解釋詞語：麵糊 batter、攪打 beat、塗油烤盤 coating pan、奶油攪打 cream、麵團 dough、翻拌 fold、預熱 preheat、攪拌 stir。（可對照手冊中文用語。）",
        4: "說出至少 8 種常用烘焙器具：量杯／量匙、攪拌碗、木匙、橡膠刮刀、打蛋器、烤盤／烤紙、擀麵棍、冷卻架、篩粉器、攪拌機等。",
        5: "閱讀四段提到烘焙的經文，例如：出 12:39（無酵餅）、創 18:6（亞伯拉罕請撒拉做餅）、創 19:1-3、撒上 28:24；亦可參考利未記與列王紀相關經文、以利亞與寡婦的故事。",
        6: "約翰福音 6:35：耶穌說「我就是生命的糧」。討論：真正的飽足來自信靠耶穌，而不只是物質的餅。",
        7: "在成人監督下烤製兩樣自選食品。注意衛生、溫度與時間，完成後可與家人／俱樂部分享。",
    },
    "HKA4018": {  # Family Helper
        1: "讀並討論：腓 2:14（凡事不要發怨言）；約 15:12（彼此相愛）；詩 118:7（耶和華是幫助我的）；加 6:9（行善不可喪志）。",
        2: "誰是家庭幫手？——每一個人都可以是。",
        3: "討論我能做的幫忙：整理房間、收拾自己的東西、廚房幫忙、擺餐具、倒垃圾、整理床鋪等。",
        4: "連續三週記錄自己如何幫忙；每週與導師討論進度、最喜歡哪一項、還能怎樣做得更好。",
        5: "製作感謝卡／便條給父母或監護人，感謝他們為你所做的一切。",
    },
    "YOU4940": {  # Tin Can Fun — fill gaps from Wikibooks
        4: "耶穌時代食物保存與烹調：多用釜鍋半煮、陶鍋明火、熱石／硬土上煎、簡陋烤爐等。魚乾、鹽漬、乾果也很常見。",
        5: "聖經中錫出現於民 31:22、賽 1:25、結 22:18 等。更多提到青銅（銅＋錫合金），用於建造、裝飾、兵器與工具。",
        7: "帶三罐食品捐贈（注意到期日與完整包裝）。可與分享、關懷有需要的人連繫。",
    },
    "YOU4915": {  # Steps to Jesus — Wikibooks is very rich; ensure key reqs covered
        7: "用適合年齡的話講解救恩步驟：① 上帝是愛；② 我們都會犯錯（罪）並需要救恩；③ 耶穌為我們死而復活；④ 救恩是禮物，要邀請耶穌作個人救主；⑤ 禱告時上帝垂聽；⑥ 接受耶穌成為新造的人；⑦ 可以確信蒙赦免，若再犯錯就認罪求饒恕並盡力和好。配合約一 4:8、約 3:16、羅 3:23 等。",
        8: "與大人閱讀並討論：埃提阿伯太監（徒 8:26-40）、乃縵（王下 5）、耶穌愛小孩（太 19:13-15）、失錢／失羊／浪子（路 15）。可作兒童講道、靈修或家庭崇拜，強調上帝尋找並拯救我們。",
    },
}

# Honors where we APPEND wiki tip only if current answer looks thin
THIN_MARKERS = ("帶領提示", "引導冒險家", "指導冒險家", "保持實用和安全")


def parse_answers(ans_section: str) -> dict[int, str]:
    out: dict[int, str] = {}
    for m in re.finditer(r"### 要求 (\d+)\n\n(.*?)(?=\n### 要求 |\Z)", ans_section, re.S):
        out[int(m.group(1))] = m.group(2).strip()
    return out


def write_md(path: Path, fm: str, req: str, answers: dict[int, str]) -> None:
    blocks = [f"### 要求 {n}\n\n{answers[n]}" for n in sorted(answers)]
    body = f"## 要求\n\n{req}\n\n## 答案\n\n" + "\n\n".join(blocks) + "\n"
    path.write_text("---\n" + fm + "\n---\n\n" + body, encoding="utf-8")


def update_frontmatter(fm: str, note: str) -> str:
    lines = []
    saw_note = False
    for line in fm.splitlines():
        if line.startswith("answerSourceNote:"):
            # merge notes
            old = line.split(":", 1)[1].strip().strip('"')
            if "Wikibooks" in old or "wikibooks" in old:
                lines.append(line)
            else:
                merged = f'{old}；{note}' if old else note
                lines.append(f'answerSourceNote: "{merged}"')
            saw_note = True
        else:
            lines.append(line)
    if not saw_note:
        lines.append(f'answerSourceNote: "{note}"')
    # bump draft -> translated when we replaced with wiki-based content? keep draft if was draft, but note wiki
    return "\n".join(lines)


def main() -> None:
    src = json.loads((ROOT / "scripts/new-honors-answers-source.json").read_text(encoding="utf-8"))
    by_code = {h["code"]: h for h in src}
    note = "部分答案已依 Wikibooks Adventist Adventurer Awards and Answers 補充"
    updated = []

    for code, supp in WIKI_SUPPLEMENTS.items():
        h = by_code[code]
        path = ROOT / h["path"]
        text = path.read_text(encoding="utf-8")
        parts = text.split("---", 2)
        fm = parts[1].strip()
        body = parts[2].lstrip("\n")
        req = body.split("## 要求", 1)[1].split("## 答案", 1)[0].strip()
        answers = parse_answers(body.split("## 答案", 1)[1]) if "## 答案" in body else {}

        changed = False
        for n, zh in supp.items():
            old = answers.get(n, "")
            if not old or any(m in old for m in THIN_MARKERS) or len(old) < len(zh) * 0.55:
                answers[n] = zh
                changed = True
            elif "Wikibooks" not in old and len(zh) > len(old) + 80:
                # append supplement
                answers[n] = old.rstrip() + "\n\n補充（Wikibooks）：" + zh
                changed = True

        if not changed:
            continue

        # If was draft and we filled from wiki, keep draft|translated but add note
        fm2 = update_frontmatter(fm, note)
        # For fully wiki-backed drafts, mark translated if all answers look solid
        if "answerSource: draft" in fm2 and code in {
            "YOU4790", "HKA4031", "HKA4045", "HKA4048", "HKA4069", "HKA4032", "HKA4017", "HKA4018"
        }:
            fm2 = fm2.replace("answerSource: draft", "answerSource: translated")

        write_md(path, fm2, req, answers)
        updated.append(code)

    print("Supplemented:", ", ".join(updated))
    print("count", len(updated))


if __name__ == "__main__":
    main()
