#!/usr/bin/env python3
"""Apply batch honor answer updates from cache and requirement drafts."""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HONORS_DATA = ROOT / "app/adventurer-honors/honors-data.ts"
CACHE = Path(__file__).resolve().parent / "honor-batch-update-cache.json"

DRAFT_SOURCE = "Requirement draft"
NO_SA = "答案按中文要求草擬（英文 Award Book 2020 未有 Supporting Answers）"
FROM_PDF = "答案由英文 Award Book 2020 整理/翻譯"
PARTIAL_PDF = "答案由英文 Award Book 2020 整理/翻譯（PDF 僅有部分 Supporting Answers）"


def ts(value: str) -> str:
    return json.dumps(value, ensure_ascii=False)


def fmt_answers(answers: list[dict]) -> str:
    if not answers:
        return "[]"
    parts = []
    for a in answers:
        source = a.get("source", "Award Book 2020")
        parts.append(
            f"{{ requirementIndex: {a['requirementIndex']}, text: {ts(a['text'])}, source: {ts(source)} }}"
        )
    return "[ " + ", ".join(parts) + " ]"


def draft(idx: int, text: str) -> dict:
    return {"requirementIndex": idx, "text": text, "source": DRAFT_SOURCE}


def pdf(idx: int, text: str) -> dict:
    return {"requirementIndex": idx, "text": text, "source": "Award Book 2020"}


def patch_block(text: str, honor_id: str, answers: list[dict], answer_source: str) -> str:
    pattern = re.compile(
        rf'(id: "{re.escape(honor_id)}"[\s\S]*?answers: )\[[\s\S]*?\]([\s\S]*?answerSource: ")([^"]*)(")',
        re.MULTILINE,
    )

    def repl(m: re.Match[str]) -> str:
        return f"{m.group(1)}{fmt_answers(answers)}{m.group(2)}{answer_source}{m.group(4)}"

    new_text, count = pattern.subn(repl, text, count=1)
    if count == 0:
        raise RuntimeError(f"Could not patch honor {honor_id}")
    return new_text


def seq_pdf(key: str, cache: dict, start: int = 0) -> list[dict]:
    items = cache[key]
    if items and isinstance(items[0], dict):
        return items
    return [pdf(start + i, t) for i, t in enumerate(items)]


def main() -> None:
    cache = json.loads(CACHE.read_text(encoding="utf-8"))
    text = HONORS_DATA.read_text(encoding="utf-8")

    updates: list[tuple[str, list[dict], str]] = [
        (
            "hka4015-alphabet-i",
            [
                draft(0, "可選讀一本字母主題繪本，並與孩子討論書中出現的字母。"),
                draft(1, "可唱《Alphabet Song》或《B-I-N-G-O》等字母歌曲。"),
                draft(2, "可玩字母配對、字母尋寶或字母卡遊戲。"),
                draft(3, "可用紙張、貼紙或顏色筆製作字母手工，例如字母拼貼或字母卡。"),
            ],
            NO_SA,
        ),
        (
            "hka4022-home-helper-i",
            [
                draft(0, "可以用雙手、雙腳、眼睛和嘴巴幫忙，例如拿東西、打掃、整理和說鼓勵的話。"),
                draft(1, "例如：整理床鋪、幫忙掃地、吸塵、收拾房間、協助分類回收、幫忙擺放餐具。"),
                pdf(2, "從第 2 項中選一項，連續一週每天在家練習，例如「整理床鋪」「幫忙打掃」「吸塵」「收拾房間」或「廢物分類」。"),
                draft(3, "可學唱《Helpers Are We》或教會兒童詩歌中關於幫助他人的歌曲。"),
                draft(4, "例如：路得幫助拿俄米、馬太跟從耶穌、馬大招待客人，或任何孩子能理解的聖經幫手人物。"),
            ],
            PARTIAL_PDF,
        ),
        (
            "hka4024-manners-fun",
            [
                draft(0, "閱讀並討論馬太福音 7:12（黃金法則）：你希望別人怎樣待你，也要怎樣待人。"),
                pdf(1, cache["Manners Fun"][0]),
                draft(2, "用繪畫或剪貼圖片表達「請」「謝謝」「對不起」等禮貌用語的場景。"),
                pdf(3, cache["Manners Fun"][1]),
            ],
            FROM_PDF,
        ),
        (
            "hka4026-numbers",
            [
                draft(0, "選一本 1 至 20 的數字繪本，由家長或導師朗讀。"),
                draft(1, "可唱《Ten Little Indians》《One, Two, Buckle My Shoe》或《數字歌》。"),
                draft(2, "可玩數字配對、數數遊戲、擲骰子走格或數字尋寶。"),
                draft(3, "用色紙、貼紙或拼貼製作 1 至 20 的數字手工，例如數字串或數字卡。"),
            ],
            NO_SA,
        ),
        (
            "you4620-courtesy",
            [pdf(i, t) for i, t in enumerate(cache["Courtesy"])],
            FROM_PDF,
        ),
        (
            "you4585-caring-friend",
            seq_pdf("Caring Friend", cache),
            FROM_PDF,
        ),
        (
            "hka4064-acts-of-kindness",
            [
                pdf(0, "閱讀/已經閱讀聖經經文。將它們以大字體印在影印紙上，可以讓閱讀能力好的孩子自願為小組大聲朗讀。"),
                pdf(1, "這是一個集體集思廣益的好時機，也許是在做手工時或作為準備短劇/猜謎遊戲的一部分——想法發起者：父母善待並愛他們的孩子；朋友們在一起玩耍、吃飯、一起工作時彼此友善；神如此愛我們，甚至派他的兒子從天上來到地上與人同住，然後為我們而死，使我們可以永遠如此與他一起在天上生活。"),
                pdf(2, "舊約中最好的例子是路得的故事；新約中最好的例子是好撒瑪利亞人的比喻。"),
                pdf(3, "如果您閱讀了要求 3 中的聖經故事，您只需要一個額外的故事。目標是發現現代的善良故事。兒童故事書和線上兒童影片書都是很好的資源。家長成年人應該預覽線上資源。教學概念：猜字謎——材料：預先寫好的卡片（「幫助女士打掃廚房」「幫助媽媽洗碗」等）；程序：小組每人獲得一張卡片，練習動作後表演，觀眾猜測善舉。"),
                draft(4, "在短劇中表演不同的善良行為，例如幫助同學、分享玩具或安慰傷心的朋友。"),
                draft(5, "以班級或幼鋒會形式計劃並實踐一件善事，例如為長者送關懷、整理教會或捐贈物品。"),
            ],
            FROM_PDF,
        ),
        (
            "hka4063-trikes-and-bikes",
            [
                draft(0, "選一本關於三輪車或單車的繪本，由家長或導師朗讀。"),
                draft(1, "可唱《I Have a Little Bicycle》或《The Wheels on the Bike》等歌曲。"),
                draft(2, "可玩紅綠燈、單車障礙賽或三輪車環遊遊戲。"),
                draft(3, "用紙板、色紙或回收物料製作三輪車或單車手工。"),
            ],
            NO_SA,
        ),
        (
            "hka4062-trains-and-trucks",
            [
                draft(0, "選一本關於火車或卡車的繪本，由家長或導師朗讀。"),
                draft(1, "例如：火車在軌道上行駛、卡車運載貨物、火車有車廂、司機駕駛車輛。"),
                draft(2, "可玩火車排隊、卡車運貨或角色扮演司機遊戲。"),
                draft(3, "假裝啟動汽車引擎、鳴笛，或模仿乘坐火車/卡車的動作和聲音。"),
            ],
            NO_SA,
        ),
        (
            "hka4061-toys",
            [
                draft(0, "與孩子分享最喜歡的玩具名稱，並說明為什麼喜歡它。"),
                draft(1, "畫出或為最喜歡的玩具填色，也可從雜誌剪貼圖片。"),
                draft(2, "一次只拿一至兩件玩具，較容易整理、分享，也不易弄亂房間；玩完應立即收拾。"),
                draft(3, "在家長陪同下，連續一週每天收拾自己的玩具。"),
                draft(4, "與朋友或兄弟姐妹樂意分享玩具，練習輪流和禮貌用語。"),
                draft(5, "唱《Share Your Toys》或《Magic Penny》等分享歌曲，邊唱邊練習。"),
                draft(6, "送一件玩具給沒有玩具的人，或收集玩具捐贈給慈善機構。"),
                pdf(7, cache["Toys"][0]["text"]),
                draft(8, "從雜誌剪貼或手繪四種想要的玩具，製作生日或聖誕願望清單。"),
            ],
            PARTIAL_PDF,
        ),
        (
            "hka4060-swimmer-i",
            [
                draft(0, "在成人陪同下，於淺水區練習狗爬式（狗仔式）的基本手腳動作。"),
                draft(1, "練習將臉放入水中並在水中呼氣，再抬頭吸氣，逐步延長時間。"),
                draft(2, "在成人監督下，跳入水中並游向台階、梯子或池邊。"),
                pdf(3, "總是有成人陪伴；切勿在泳池周圍奔跑；切勿跳到他人身上；入水前先確保該位置無人。"),
                draft(4, "不要自己下水救人；立即呼叫父母或成人幫忙，並向池邊的大人求助。"),
                draft(5, "香港緊急電話為 999；也可教導孩子記住住所電話及地址以便求助。"),
            ],
            PARTIAL_PDF,
        ),
        (
            "hka4056-left-and-right",
            seq_pdf("Left and Right", cache),
            FROM_PDF,
        ),
        (
            "hka4055-cyclist-i",
            [
                draft(0, "在成人陪同下，於安全地方練習不用輔助輪踏單車。"),
                draft(1, "在社區或公園安全路段，由成人陪同完成約三幢大廈距離的骑行。"),
                pdf(2, "單車安全守則：a. 駛出馬路前必須查看；b. 不可載人；c. 雙手緊握車把；d. 注意行人及其他騎士；e. 必須佩戴安全頭盔。"),
                draft(3, "為單車圖填色，並指出車把、鏈條和護蓋、輻條、座墊和車架。"),
                draft(4, "使用氣泵或打氣筒為輪胎充氣；氣嘴需對準，並由成人協助檢查胎壓。"),
            ],
            PARTIAL_PDF,
        ),
        (
            "hka4002-cooperation",
            [pdf(i, t) for i, t in enumerate(cache["Cooperation"][:4])]
            + [
                pdf(4, cache["Cooperation"][4]),
                pdf(5, cache["Cooperation"][5]),
                draft(6, "與組員合作完成一件手工，例如拼貼、模型或集體海報。"),
            ],
            FROM_PDF,
        ),
        (
            "hka4004-hands-of-service",
            [
                draft(0, "逐段朗讀使徒行傳 20:35、彼得前書 4:10-11、加拉太書 5:13-14、馬太福音 20:28、馬可福音 10:44-45、腓立比書 2:1-11，討論每段如何談及服事。"),
                draft(1, "討論馬太福音 25:31-46 的比喻：綿羊代表願意服事的人；山羊代表忽略他人需要的人；王所稱許的是餵餓、探訪、接待等行動。"),
                draft(2, "與孩子一起列出至少 10 項可服事家庭、教會、學校、社區和有需要人士的行動。"),
                draft(3, "與導師計劃並完成一項社區或關懷有需要人士的服務，並在聚會中分享感受和改變。"),
            ],
            NO_SA,
        ),
        (
            "you4615-country-fun",
            [
                draft(0, "選擇一個國家作研究，可從家庭背景、教會宣教地或孩子感興趣的國家開始。"),
                draft(1, "在世界地圖上找出該國位置，並說出所在大洲。"),
                draft(2, "繪畫、描摹或剪貼該國地圖和國旗。"),
                draft(3, "從 a-g 中選六項了解該國，例如民族服飾、歌曲、國歌、遊戲、宗教、郵票或傳說。"),
                draft(4, "製作該國的一道簡單食物或手工，例如折紙、黏土或傳統小物。"),
                draft(5, "閱讀創世記 11:1-9，討論巴別塔與不同語言的由來。"),
            ],
            NO_SA,
        ),
        (
            "hka4005-my-community",
            (lambda mc: [
                pdf(0, mc[0]),
                pdf(1, mc[1] + " " + mc[2] + " " + mc[3] + " " + mc[4]),
                pdf(2, mc[5] + " " + mc[6]),
                pdf(3, mc[7] + " " + mc[8] + " " + mc[9] + " " + mc[10]),
                pdf(4, mc[11] + " " + mc[12] + " " + mc[13] + " " + mc[14]),
                pdf(5, mc[15] + " " + mc[16]),
            ])(json.loads((Path(__file__).resolve().parent / "my-community-zh.json").read_text(encoding="utf-8"))),
            FROM_PDF,
        ),
        (
            "hka4073-good-samaritan",
            [
                pdf(0, "以問答形式進行：誰創造了我們的世界？上帝！聖經怎樣說？「起初，上帝創造天地。」（創 1:1）"),
                pdf(1, "閱讀創世記 1:1-2:3 或創造故事書，並用動作或手語配合重複字詞。"),
                pdf(2, "可唱《He’s Got the Whole World》《God Made It So》或《If I Were a Butterfly》等歌曲。"),
                pdf(3, "使用地球儀或地圖，指出自己所居住的地方。"),
                pdf(4, "列出五項最喜歡上帝創造的事物，例如陽光、花朵、動物、家人和食物。"),
                pdf(5, "到戶外收集樹葉、石頭等自然物製作拼貼，或為相關經文填色。"),
            ],
            FROM_PDF,
        ),
        (
            "hka4076-listening",
            [pdf(i, t) for i, t in enumerate(cache["Jesus' Star"])]
            + [
                draft(3, "用紙張、色紙或閃粉製作星星手工，可做成掛飾或聖誕星星。"),
                draft(4, "在天晴晚上觀察星空，找出北極星；如有機會可參觀太空館。"),
            ],
            FROM_PDF,
        ),
        (
            "hka4077-listening",
            [
                pdf(0, cache["Listening"][0]["text"]),
                pdf(1, cache["Listening"][1]["text"]),
                draft(2, "討論並示範聆聽上帝、隨時準備、耐心、順從、善待、尊重和留心等原則。"),
                draft(3, "製作與聆聽有關的手工，例如紙杯「電話」或「傾聽耳朵」卡片。"),
                draft(4, "參與電話遊戲、西蒙說或盲人引路遊戲，練習專心聆聽和遵循指示。"),
            ],
            FROM_PDF,
        ),
        (
            "hka4080-parables-of-jesus",
            seq_pdf("Parables of Jesus", cache),
            FROM_PDF,
        ),
        (
            "you4535-bible-i",
            [
                draft(0, "確保每位孩子有自己的聖經或可使用的兒童聖經；教導如何輕拿、翻閱和標記經文。"),
                draft(1, "解釋要尊重聖經：潔淨雙手、輕放、不塗鴉、放在安全乾爽處，並以敬虔態度閱讀。"),
                pdf(2, cache["Bible I"][0]),
                pdf(3, cache["Bible I"][1]),
                pdf(4, cache["Bible I"][2]),
                pdf(5, cache["Bible I"][3]),
            ],
            FROM_PDF,
        ),
        (
            "hka4035-animals",
            [
                draft(0, "參觀動物園或看影片後，說出五種動物，例如獅子、大象、長頸鹿、企鵝、猴子。"),
                draft(1, "選兩種動物畫圖並填色。"),
                draft(2, "從雜誌剪下三隻動物圖片，製成立體拼貼。"),
                draft(3, "用黏土或彩泥製作最喜歡的動物園動物。"),
                draft(4, "例如：挪亞方舟的動物、鯨魚、鴿子、驢子、獅子等。"),
            ],
            NO_SA,
        ),
        (
            "hka4038-bodies-of-water",
            [
                draft(0, "選一本關於湖泊、溪流、河流或海洋的繪本，由家長或導師朗讀。"),
                draft(1, "可唱《Down by the Bay》《My Bonnie Lies Over the Ocean》或中文兒歌《小河流水》。"),
                draft(2, "可玩「河流接力」或用水桶/藍色布條模仿河流、海浪的遊戲。"),
                draft(3, "用色紙、棉花和箔紙製作湖泊、河流或海洋手工。"),
            ],
            NO_SA,
        ),
        (
            "hka4049-stars",
            [
                draft(0, "選一本星星主題繪本，由家長或導師朗讀。"),
                draft(1, "讀後說出三項所學，例如：星星在夜間發光、太陽也是星、北極星幫助辨方向。"),
                draft(2, "可玩「找星星」配對或星座模仿遊戲。"),
                draft(3, "用色紙、閃粉或夜光貼紙製作星星手工。"),
                draft(4, "可唱《Twinkle, Twinkle, Little Star》或《Star Light, Star Bright》。"),
            ],
            NO_SA,
        ),
        (
            "hka4054-zoo-animals",
            [
                draft(0, "參觀動物園，或觀看動物園/自然紀錄片。"),
                draft(1, "分享看見的動物名稱和特徵。"),
                draft(2, "說明不同動物的食物，例如草食、肉食或雜食。"),
                draft(3, "描述看見的鳥類名稱、顏色和叫聲。"),
                draft(4, "畫出兩種在動物園看到的動物並填色。"),
                draft(5, "一切受造之物都是上帝所造；可引用創世記 1:20-25。"),
            ],
            NO_SA,
        ),
        (
            "hka4006-colors",
            [
                draft(0, "選一本顏色主題繪本，由家長或導師朗讀。"),
                draft(1, "可唱《Rainbow Song》或《Colors All Around》。"),
                draft(2, "可玩顏色尋寶、顏色配對或「紅色去」遊戲。"),
                draft(3, "用不同顏色紙張、顏料或拼貼製作彩虹或顏色手工。"),
            ],
            NO_SA,
        ),
        (
            "hka4010-jigsaw-puzzles",
            [
                pdf(0, "從雜誌剪下大圖，貼於厚卡紙後剪成不同形狀的三片拼圖。"),
                draft(1, "與同伴或家人一起完成拼圖遊戲，練習耐心與合作。"),
                draft(2, "購買或借用較大的拼圖，與成人一起完成。"),
                draft(3, "畫一幅圖填色，裱褙後剪成較大塊的拼圖。"),
            ],
            PARTIAL_PDF,
        ),
        (
            "hka4011-music-i",
            [
                draft(0, "選一本關於音樂家或樂器的繪本，由家長或導師朗讀。"),
                draft(1, "用紙碟、豆或橡皮筋製作簡單樂器或音樂主題手工。"),
                draft(2, "參與拍手或節奏遊戲，例如模仿節奏、輪流拍子。"),
                draft(3, "跟著音樂做動作，例如隨歌曲節拍拍球或踏步。"),
            ],
            NO_SA,
        ),
        (
            "hka4012-shapes-and-sizes",
            [
                draft(0, "製作剪貼簿，在封面畫出不同大小的形狀。"),
                draft(1, "長方形、正方形、圓形、橢圓形、菱形和三角形。"),
                draft(2, "用不同形狀紙張拼成圖案，放入剪貼簿。"),
                draft(3, "到户内外尋找不同形狀，記錄哪些形狀最常見。"),
                draft(4, "用積木或物品比較小、中、大，並用實物排序。"),
                draft(5, "用積木玩比大小遊戲，問「哪個更大/最大/更小/最小？」"),
                draft(6, "畫出含不同大小物件的圖畫並填色。"),
            ],
            NO_SA,
        ),
        (
            "hka4013-sponge-art",
            [
                draft(0, "用塑料海綿剪成不同形狀，蘸顏料在厚卡紙上印畫。"),
                draft(1, "測試海綿能否站立、堆疊，並按顏色或形狀分類。"),
                draft(2, "用海綿和工藝膠製作動物或物件。"),
                draft(3, "用海綿蘸顏料創作自己的海綿畫。"),
                draft(4, "選 a-c 其中一項：為名字周圍印畫裝飾、印動物或印最喜歡的玩具。"),
            ],
            NO_SA,
        ),
        (
            "you4795-media-critic",
            [pdf(i, t.rstrip("音樂我")) for i, t in enumerate(cache["Media Critic"])],
            FROM_PDF,
        ),
        (
            "hka4053-wooly-lamb",
            seq_pdf("Wooly Lamb", cache)
            + [
                draft(2, "可玩「小羊找媽媽」或模仿綿羊叫聲的遊戲。"),
                draft(3, "用棉花、毛球和紙板製作綿羊手工。"),
            ],
            PARTIAL_PDF,
        ),
        (
            "hka4008-finger-play",
            seq_pdf("Finger Play", cache)
            + [
                draft(3, "用手指畫、手掌畫或指印製作與手有關的手工。"),
                draft(4, "用積木、揉麵團或串珠等手指活動完成一項任務。"),
            ],
            PARTIAL_PDF,
        ),
        (
            "hka4064-acts-of-kindness-spiritual",
            [
                pdf(0, "閱讀/已經閱讀聖經經文。將它們以大字體印在影印紙上，可以讓閱讀能力好的孩子自願為小組大聲朗讀。"),
                pdf(1, "這是一個集體集思廣益的好時機——想法：父母善待並愛他們的孩子；朋友彼此友善；神派兒子為我們而死。"),
                pdf(2, "舊約中最好的例子是路得的故事；新約中最好的例子是好撒瑪利亞人的比喻。"),
                pdf(3, "若已讀要求 3 的聖經故事，只需再讀一個現代善良故事；可進行猜字謎活動。"),
                draft(4, "在短劇中表演不同的善良行為。"),
                draft(5, "以班級或幼鋒會形式計劃並實踐一件善事。"),
            ],
            FROM_PDF,
        ),
    ]

    for honor_id, answers, answer_source in updates:
        text = patch_block(text, honor_id, answers, answer_source)

    # Fix Jesus' Star metadata
    text = text.replace(
        'id: "hka4076-listening",\n    code: "HKA4076",\n    nameZh: "耶穌之星",\n    nameEn: "Listening",',
        'id: "hka4076-jesus-star",\n    code: "HKA4076",\n    nameZh: "耶穌之星",\n    nameEn: "Jesus\' Star",',
        1,
    )

    # Fix My Community nameEn
    text = text.replace(
        'nameZh: "社區朋友",\n    nameEn: "My Community",',
        'nameZh: "社區朋友",\n    nameEn: "My Community Friends",',
        1,
    )

    # Add Swimmer III if missing
    if "you4925-swimmer-iii" not in text:
        swimmer_iii = """
  {
    id: "you4925-swimmer-iii",
    code: "YOU4925",
    nameZh: "游泳 III",
    nameEn: "Swimmer III",
    aliases: ["游泳III"],
    category: "recreation",
    requirements: ["1. 已完成並獲取初級游泳榮譽證。", "2. 複習安全守則，並加以討論游泳或戲水時的安全行為。", "3. 仰臥飄浮 30 秒。", "4. 俯臥飄浮 30 秒。", "5. 跳入水深過頭的地方，並撿取水底的兩塊石頭。", "6. 以自由式游 10 公尺。", "7. 以背泳式游 10 公尺。", "8. 只用雙腳游 5 公尺，再只用雙手游 5 公尺。", "9. 請說出只有你單獨一人時可以救溺水者的 3 種方法。"],
    answers: """ + fmt_answers([pdf(i, t) for i, t in enumerate(cache["Swimmer III"])]) + """,
    sourceUrls: ["https://youth.hkmcadventist.org/web/clubs/adventurer-2/honor/recreation/"],
    answerSource: \"""" + FROM_PDF + """\",
    status: "complete",
  },"""
        text = text.replace(
            'id: "hka4060-swimmer-i",',
            swimmer_iii + '\n  {\n    id: "hka4060-swimmer-i",',
            1,
        )

    HONORS_DATA.write_text(text, encoding="utf-8")
    print(f"Updated {len(updates)} honors in {HONORS_DATA}")


if __name__ == "__main__":
    main()
