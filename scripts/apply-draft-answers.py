#!/usr/bin/env python3
"""Apply curated Traditional Chinese teaching answers for new honors with weak/filler drafts."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# Curated answers: code -> {n: zh text}. Only replaces ## 答案; keeps requirements.
CURATED: dict[str, dict[int, str]] = {
    "YOU4790": {  # Magnet Fun II
        1: "確認幼鋒已考取「磁鐵樂 I」。可請他們簡單重溫磁鐵能吸引什麼、南北極等概念，再開始本級活動。",
        2: "發給每位（或每組）兩塊磁鐵，讓他們自由試「吸」與「推」。引導填空：所有磁鐵都有**北**極和**南**極；異極相吸、同極相斥。可在磁鐵兩端貼 N／S 標籤幫助觀察。",
        3: "電磁鐵做法（成人監督）：取大鐵釘、絕緣電線、乾電池。電線單向緊密纏繞鐵釘，兩端接電池正負極。通電後鐵釘可吸起迴紋針；斷電後磁力消失。提醒：電池勿短路、纏線時勿拉扯過緊；比較永久磁鐵與電磁鐵的不同。",
        4: "帶幼鋒到戶外或空曠處，用指南針找出東、南、西、北，以及東北、東南、西南、西北共八個方向。在紙上畫出羅盤刻度盤，標示八個方向。",
        5: "自製指南針：將縫衣針用磁鐵單向摩擦數十下磁化；穿過軟木片（或蠟紙）浮在水盤中央；針靜止後一端大致指向北方。可用蠟燭滴蠟固定針。再與真正的羅盤比對方向。",
        6: "磁鐵若從高處摔落或劇烈撞擊，內部磁域可能混亂，磁力會變弱甚至幾乎消失。教導幼鋒輕放、妥善收藏磁鐵。",
        7: "一起讀並背誦箴言 18:24。可討論：真正的朋友像「比弟兄更親密」；也可以連繫到與耶穌的友誼——祂永遠願意親近我們。",
    },
    "HKA4031": {  # Sharing — EN PDF answers are misbound (scrapbook)
        1: "選一本適合年齡、主題為分享／幫助別人的故事書（教會圖書館、圖書館或家長自備均可）。讀完後請幼鋒用一句話說出「誰分享了什麼、結果如何」。",
        2: "選唱一首關於分享、愛心或給予的詩歌（例如兒童詩歌中的分享主題）。可邊唱邊做簡單動作，加深印象。",
        3: "設計一個分享遊戲，例如：輪流把小零食／貼紙分給同伴；或「傳球說出一件今天願意分享的事」。強調輪流、感謝對方，而非比賽輸贏。",
        4: "完成一件簡單手工（書籤、卡片、小裝飾），親自送給家人、朋友、教會長者或鄰居。鼓勵幼鋒說出祝福的話，體會「給予比接受更有福」。",
    },
    "HKA4045": {  # Saving Animals
        1: "引導討論瀕危原因：棲息地被破壞、過度捕獵、污染、氣候改變、外來物種等。可用圖片或短片輔助，用語要適合幼鋒年齡，避免過度驚嚇。",
        2: "說明「絕種」是指世上再也沒有該物種存活。一旦絕種就無法挽回，食物鏈與生態平衡也會受影響。強調我們有責任照顧上帝所造的萬物。",
        3: "一起認識至少 5 種已絕種動物（例如渡渡鳥、袋狼、大海牛、旅鴿、西非黑犀等——可依本地教材調整）。請幼鋒記住中英文名稱與大致外貌特徵。",
        4: "選 5 種仍列為瀕危的動物（如大熊貓、雪豹、藍鯨、紅猩猩、海龜等），簡述牠們住在哪裡、為什麼危險、人們可以怎樣幫助。",
        5: "查閱可靠資料（保育組織、百科全書、家長協助上網）了解目前瀕危物種大約數量級（實際數字會更新）。收集至少 5 種瀕危動物照片並標註名稱，可做成牆報或卡片。",
        6: "製作海報或小冊子，標題清楚（例如「一起拯救瀕危動物」），內容包含：為什麼重要、可採取的行動（少用即棄塑膠、支持保育、愛護動物等）。可在俱樂部或教會展示。",
        7: "一起背誦箴言 12:10（義人顧惜他牲畜的命）。討論：上帝關心動物，我們也要仁慈對待並保護牠們。",
    },
    "HKA4048": {  # Seeds
        1: "一起聆聽／閱讀馬太福音 13:3-9（撒種的比喻）。再選讀創世記 1:11、馬可福音 4:31、馬太福音 17:20 中至少兩節。用簡單話解釋：上帝讓大地長出植物；信心可以像芥菜種一樣成長。",
        2: "種子發芽需要：水分、適當溫度、空氣（有些還需要光）。可做對照實驗：一顆種子加水／不加水，觀察差別。",
        3: "浸泡豆子 1–2 天後剝開觀察，或用棉花／紙巾發芽盒看根芽長出。討論：先長根再長芽、向上向光等現象，連繫到生命來自上帝。",
        4: "自然傳播方式例如：風吹（蒲公英）、動物帶走／排便、水漂、果實爆開彈射、依附衣物皮毛等。請幼鋒各舉一例。",
        5: "討論所見最大／最小的種子（例如椰子很大；蘭花種子極細）。可用實物或圖片比較，強調上帝創造的多樣。",
        6: "品嚐可安全食用的種子／堅果（葵花籽、南瓜籽、芝麻、花生等——注意過敏）。洗手、成人監督；討論種子也是食物。",
        7: "收集並標示每類至少 2 種：樹種、水果種子、蔬菜種子、穀物／草籽、堅果。可用小袋或蛋格分類展示。",
        8: "用收集的種子做拼貼畫或簡單工藝（種子相框、種子動物圖案）。完成後分享作品並清潔場地。",
    },
    "HKA4057": {  # Photo Fun — remap EN supporting answers to ZH numbering
        1: "即使用手機、平板也能找到這些部分：鏡片（鏡頭）、快門（拍照鍵）、變焦（捏合螢幕或按鈕）、屏幕／取景器、電池、電源按鈕。請幼鋒在實機上指出位置（成人協助）。",
        2: "展示不同拍照設備：手機、數位相機、平板、一次成像相機等。討論各自優缺點。問幼鋒：最想和誰合照？為什麼？",
        3: "開放分享：喜不喜歡拍照？喜歡拍什麼？沒有「標準答案」，鼓勵每個孩子說出感受即可。",
        4: "保養要點：勿觸摸鏡頭、使用手腕／頸帶防掉、保持乾燥清潔、勿摔落、使用前先徵求許可、用完關機。練習正確拿持姿勢。",
        5: "鼓勵拍攝多種題材並與家人朋友分享：家人、朋友、風景、動物、最愛的地方、常去的地方、少去的地方。目標是體驗不同場景，不必追求專業。指導穩妥持機、必要時變焦。",
        6: "趣味遊戲建議：照片尋寶；「這是什麼？」特寫猜物；「這在哪裡？」猜地點；擺出聖經人物姿勢拍照讓同伴猜。選一項適合場地與人數的玩法。",
        7: "閱讀創世記 1:26-27。說明「照著上帝的形象」表示人按上帝的樣式被造，有尊嚴、能愛人、能選擇。可延伸：每個人都珍貴，拍照時也要尊重別人（先問准）。",
    },
    "YOU4505": {  # Archer
        1: "本榮譽證必須由合資格導師帶領。安全守則示例：只能在指定場地向靶射擊；聽口令才拉弓；不對人指向；檢查器材完好；取箭時等全部射完並獲准；戴護臂／護指（如需要）。請幼鋒複述守則。",
        2: "認識箭的主要部分：箭頭、箭桿、箭羽（尾羽）、箭尾凹槽（nock）。可用圖卡編號請幼鋒配對。",
        3: "認識弓的部分：弓把、弓臂、弦、瞄準相關配件（依器材而定）。示範正確站姿與握弓方式。",
        4: "逐步練習：上弦安全、搭箭、拉弦、瞄準、撒放、收勢。強調動作流暢與聽從指令，勿急於求遠。",
        5: "在導師監督下，於約 120 厘米距離按要求完成各靶徑與箭數練習。以安全、姿勢正確為先，命中率其次；記錄練習次數作為完成證明。",
    },
    "YOU4580": {  # Canoer
        1: "先確認已取得「游泳 I」榮譽證。未達游泳要求者不得進行本項水上活動。",
        2: "在安全水域、穿著救生衣、成人監督下練習：划行約 50 公尺；學會左轉／右轉；並練習只在船的同一側划行仍能前進與轉向。",
        3: "學習落水與回船：跳入水中時盡量保持船內乾燥；從水中爬回船上時重心要低、動作要穩，避免大量進水。必須穿救生衣並有成人在旁。",
        4: "認識船首（前端）與船尾（後端）。在輕微搖晃中練習平衡：坐穩、勿突然站起、槳出入水要協調。",
        5: "出發前準備：穿著適合水域與天氣的衣服（可濕、防曬、防寒層）；帶備用衣物；注意日照、風、雨、溫度變化；檢查救生衣、槳、船況與天氣是否適合出船。",
    },
    "YOU4765": {  # Basic Knots
        1: "簡介繩結類型與用途概念：停止結、連接結、繫泊結、環結等。強調：選對繩結、打緊、檢查尾端長度；錯誤繩結可能鬆脫造成危險。",
        2: "逐一示範並讓幼鋒練習（名稱以手冊為準，可對照英文常用名）：雙套結、滑結、漁夫結、繩環、平結、繫帆結、稱人結、珍珠結、醫生結、瓶口結、八字結等。每打一種就說一次用途（例如平結連接同粗細繩；稱人結做安全環；八字結作止索結）。重複「雙套結」若手冊列出兩次，以實際示範確認是否為同一結或不同變體。",
        3: "把學會的約 12 種繩結樣品固定在木板或厚紙板上，旁邊寫名稱與用途。可作為展覽或複習教具。",
    },
    "YOU4995": {  # Horsemanship — EN answers misbound to Photo Fun
        1: "提供馬體簡圖，請幼鋒標出至少五個部位（例如：頭、頸、背、腹部、腿／蹄、鬃、尾等）。可用實物模型或圖卡輔助。",
        2: "介紹五種馬品種及其用途（示例：阿拉伯馬—耐力；夸特馬—牧場／短跑；純種馬—賽跑；謝德蘭小馬—兒童／展示；重挽馬—拉車農務）。可依本地常見品種調整。",
        3: "在合格教練指導下說明並示範正確上馬、坐姿、持韁與下馬。強調安全頭盔、合適鞋履、聽從指令。",
        4: "說明並示範小跑（trot）要領：節奏、坐姿或輕快步、與馬背配合。僅在教練認為安全時進行。",
        5: "說明快跑／慢跑（canter 或依教練術語）的正確要領與何時適合練習；初學以穩妥為先，不可強迫加速。",
        6: (
            "情境處理（務必由教練示範講解）：\n"
            "a. 馬受驚：保持冷靜、說話安撫、勿突然拉扯，按教練指示減速或下馬。\n"
            "b. 馬拒絕指令：檢查是否不適／害怕／指令不清，重新溫和給清楚指令。\n"
            "c. 馬跑掉：勿追趕尖叫；通知教練／場地人員，依場地程序處理。"
        ),
        7: "說明韁繩是主要溝通工具：輕接觸、左右引導、停止與減速訊號。強調「輕柔清楚」比用力拉更重要；粗暴拉韁會傷害馬嘴並失去信任。",
        8: "長時間運動後防過熱：放慢腳步逐漸緩和、提供蔭涼、適量飲水（依教練指導）、鬆開裝備散熱、觀察呼吸與出汗；切勿立刻餵大量冰水或劇烈沖冷水而不緩和。",
    },
    "HKA4069": {  # Bible Storytelling
        1: "請每位幼鋒選五個聖經故事，並寫下／說出經卷與章節位置（例如：但以理在獅子坑—但以理書 6 章）。領袖可提供故事清單協助選擇。",
        2: "針對所選故事，討論人物的選擇如何顯出愛或不愛耶穌／上帝（聽從、勇敢、自私、悔改等）。用年齡適合的語言，連繫到我們今天的選擇。",
        3: "講故事三件要事建議：① 先熟悉內容與經文；② 用語簡單、有表情與適當動作；③ 有清楚重點（上帝是怎樣的、我們可以怎樣回應）。可再加：與聽眾眼神接觸、控制時間。",
        4: "在小組中實際講述其中兩個故事。領袖給予鼓勵性回饋（聲音、表情、重點是否清楚）。",
        5: "用兩種不同方式再說那兩個故事，例如：普通口述、布偶、圖卡、角色扮演、繪畫順序卡等。讓幼鋒體驗「同一故事可以有不同表達」。",
    },
    "YOU4730": {  # Handicraft — ZH only lists 6–7; EN answers map to those
        6: "從下列項目中完成六項（可全班做同一項或分組自選）：慰問卡、乾花／絲花插花、麵團或黏土作品、貝殼畫、繩結／繩藝雕塑、活動吊飾、紙漿作品、蛋殼種子貝類拼畫、紀念冊或相簿封面、六種材料拼貼、活動海報、或自選一件完整美麗的作品。強調創意、整潔與完成度；慰問卡記得寫祝福並可送給病人。",
        7: "把至少兩件作品送出：一件給家人或朋友；一件給教會或社區長者。可安排拜訪或請家長協助運送；鼓勵幼鋒親自送上並說感謝或祝福的話。",
    },
}

# Also fix common weak fills on otherwise-translated honors (code -> n -> text)
WEAK_FIXES: dict[str, dict[int, str]] = {
    "YOU4940": {
        7: "請幼鋒各帶三種罐裝食品（注意到期日與完整包裝）與大家分享。可一起讀標籤：內容物、原產地、保存方式；也可品嚐（注意過敏）。連繫到現代保存食物的方便，並感謝供應食物的人與上帝。",
    },
    "YOU4915": {
        6: "若手冊另有要求 1–6（如經文記憶、詩歌、決志討論等），請對照 ZH／EN 手冊補齊帶領。重點是用適合年齡的方式幫助孩子認識救恩，而非考試式問答。",
        7: "用最簡單的話講解救恩步驟：上帝是愛；我們都會犯錯（罪）；耶穌為我們死而復活；救恩是禮物，要邀請耶穌作救主；禱告時上帝垂聽；接受耶穌成為新造的人；可以確信蒙赦免。可配合約翰一書 4:8、約翰 3:16、羅馬書 3:23 等經文，讓孩子用自己的話說一遍。",
        8: "與大人一起閱讀並討論四個故事：埃提阿伯太監（徒 8:26-40）、乃縵得潔淨（王下 5）、耶穌愛小孩（太 19:13-15）、失錢／失羊／浪子（路 15）。可作成兒童講道、靈修或家庭崇拜，強調上帝尋找並拯救我們。",
    },
}


def replace_answers(md_text: str, answers: dict[int, str], source: str, note: str | None = None) -> str:
    if not md_text.startswith("---"):
        raise ValueError("no frontmatter")
    parts = md_text.split("---", 2)
    fm = parts[1].strip()
    body = parts[2].lstrip("\n")
    if "## 要求" not in body:
        raise ValueError("no requirements")
    req_section = body.split("## 要求", 1)[1]
    if "## 答案" in req_section:
        req_section = req_section.split("## 答案", 1)[0]
    req_section = req_section.strip()

    # existing answers to merge
    existing: dict[int, str] = {}
    if "## 答案" in body:
        ans = body.split("## 答案", 1)[1]
        for m in re.finditer(r"### 要求 (\d+)\n\n(.*?)(?=\n### 要求 |\Z)", ans, re.S):
            existing[int(m.group(1))] = m.group(2).strip()
    existing.update(answers)

    n_req = max([int(x) for x in re.findall(r"(?m)^(\d+)\.\s+", req_section)] or [0])
    blocks = []
    for n in range(1, max(n_req, max(existing or [0])) + 1):
        if n_req and n > n_req and n not in answers:
            continue
        if n not in existing:
            continue
        blocks.append(f"### 要求 {n}\n\n{existing[n]}")

    fm_lines = []
    saw_source = False
    for line in fm.splitlines():
        if line.startswith("answerSource:"):
            fm_lines.append(f"answerSource: {source}")
            saw_source = True
        elif line.startswith("answerSourceNote:"):
            continue
        else:
            fm_lines.append(line)
    if not saw_source:
        fm_lines.append(f"answerSource: {source}")
    if note:
        fm_lines.append(f'answerSourceNote: "{note}"')

    new_body = f"## 要求\n\n{req_section}\n\n## 答案\n\n" + "\n\n".join(blocks) + "\n"
    return "---\n" + "\n".join(fm_lines) + "\n---\n\n" + new_body


def main() -> None:
    source = json.loads((ROOT / "scripts/new-honors-answers-source.json").read_text(encoding="utf-8"))
    by_code = {h["code"]: h for h in source}
    updated = []

    notes = {
        "YOU4995": "HKMC 手冊編號與磁鐵樂 I 重複，本站用 YOU4995；英文 Supporting Answers 頁錯置為攝影樂，答案按中文要求草擬",
        "HKA4031": "英文 Award Book Supporting Answers 內容與「分享」要求不符（疑似錯置），答案按中文要求草擬",
        "YOU4790": "英文 Supporting Answers 頁面空白，答案按中文要求草擬",
        "HKA4045": "英文 Supporting Answers 頁面空白，答案按中文要求草擬",
        "YOU4505": "英文 Supporting Answers 頁面空白，答案按中文要求草擬",
        "YOU4580": "英文 Supporting Answers 頁面空白，答案按中文要求草擬",
        "YOU4765": "英文 Supporting Answers 頁面空白，答案按中文要求草擬",
        "HKA4069": "英文 Supporting Answers 頁面空白，答案按中文要求草擬",
        "HKA4048": "英文 Supporting Answers 不完整，答案按中文要求草擬並補齊",
    }

    for code, answers in CURATED.items():
        h = by_code[code]
        path = ROOT / h["path"]
        text = path.read_text(encoding="utf-8")
        source_tag = "translated" if code in {"HKA4057", "YOU4730"} else "draft"
        note = notes.get(code)
        if code == "HKA4057":
            note = None  # proper remap from EN
            source_tag = "translated"
        if code == "YOU4730":
            source_tag = "translated"
            note = None
        new_text = replace_answers(text, answers, source_tag, note)
        path.write_text(new_text, encoding="utf-8")
        updated.append(f"{code} curated ({source_tag})")

    for code, answers in WEAK_FIXES.items():
        h = by_code[code]
        path = ROOT / h["path"]
        text = path.read_text(encoding="utf-8")
        # keep existing answerSource
        src_m = re.search(r"answerSource:\s*(\w+)", text)
        source_tag = src_m.group(1) if src_m else "translated"
        new_text = replace_answers(text, answers, source_tag, None)
        path.write_text(new_text, encoding="utf-8")
        updated.append(f"{code} weak-fix ({source_tag})")

    print("Updated:")
    for u in updated:
        print(" ", u)


if __name__ == "__main__":
    main()
