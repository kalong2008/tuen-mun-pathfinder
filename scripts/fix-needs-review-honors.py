#!/usr/bin/env python3
"""Fix honors marked needs-review: metadata corrections and PDF answer remapping."""

from __future__ import annotations

import json
import re
import sys
import time
from pathlib import Path

from deep_translator import GoogleTranslator
from deep_translator.exceptions import TranslationNotFound

ROOT = Path(__file__).resolve().parents[1]
HONORS_DATA = ROOT / "app/adventurer-honors/honors-data.ts"

GODS_WORLD_ANSWERS_EN = [
    "Do this in a question/answer format, with chanted or shouted group responses: a. Who made our world? God did! b. How do you know? The Bible tells me so. c. What does it say? \"In the beginning, God created the sky and the earth.\" (International Children's Bible) d. Where is that found? Genesis 1:1",
    "Read Gen. 1:1-2:3 in the International Children's Bible, or the creation story from the Bible Story books. Use descriptive motions or sign language symbols for words that recur throughout the story. For example: God–point to heaven; Saw–shade eyes with hand; Good–make circle with thumb/forefinger and raise other fingers; Earth–join arms to make a circle",
    "He's Got the Whole World in His Hands (Pathfinders Sing #118) (can change words: \"He made the whole world, Yes He did!\") God Made It So (SSTT #76) Jesus Makes Everything Good (Heaven is for Kids) If I Were a Butterfly (illustrated song available from AdventSource)",
    "Plastic inflatable globes are available from AdventSource.",
    "The things God made are all around us when we are outdoors. We bring some of those things indoors to enjoy. Surround the children with natural objects or go outside for this.",
    "Take a walk and collect natural objects (stones, leaves, flowers, bark, etc.) and make a picture or sculpture with them.",
]

SAFETY_ANSWERS_EN = [
    "Watch age-appropriate home safety videos or films with your parents and discuss what you learned. Local police or fire departments or your local library may have resources for your area.",
    "Encourage parents to help the Adventurers make a fire-safety plan. Discuss where fire extinguishers are kept and how to use them. People safety refers to refusing rides with strangers, etc.",
    "Draw a floor plan for your school, club, and/or church, and show where and how to go out of the area in case of emergency. Practice these drills at home, school, or church.",
    "Local police or fire departments or your local library will have information for your particular area. Discuss the kind of disasters that may appear so you can inform and prepare the children without frightening them.",
    "Make up a \"Safety Detective\" button or ribbon that the Adventurers may wear the week they are recording potential problems at home or school. They should look for hazards such as a broken latch on a cabinet that has cleaning fluids or medicine in it, frayed wires or broken electrical plugs, a rake lying face up, boards on the sidewalk, a broken water faucet, unlabeled containers holding paint thinner or gasoline, broken glass, etc.",
    "Ask permission to display the posters in a public place.",
    "Give the children safety situations in which they must answer, \"Yes,\" \"No,\" or \"I'll ask Mom and Dad.\" Start the game with a situation you have experienced, such as broken glass on the floor. Ask, \"Would you pick up the glass?\" \"Would you tell your mother?\" Encourage the children to share realistic situations and to think carefully before acting.",
]

GADGETS_ANSWER_EN = (
    "Use rice as an alternative for sand. Let kids measure, pour, and scoop as long as they like. "
    "This develops eye and hand coordination and manual dexterity, and children love playing in the sand."
)


def translate_text(text: str, translator: GoogleTranslator) -> str:
    try:
        return translator.translate(text)
    except TranslationNotFound:
        return f"（英文原文）{text}"
    except Exception as error:
        print(f"Translation warning: {error}", file=sys.stderr)
        return f"（英文原文）{text}"


def format_answers(answers: list[dict]) -> str:
    parts = []
    for answer in answers:
        parts.append(
            "{ requirementIndex: "
            + str(answer["requirementIndex"])
            + ", text: "
            + json.dumps(answer["text"], ensure_ascii=False)
            + ', source: "Award Book 2020" }'
        )
    return "[ " + ", ".join(parts) + " ]"


def patch_honor(
    text: str,
    honor_id: str,
    *,
    answers: list[dict] | None = None,
    name_en: str | None = None,
    requirements: list[str] | None = None,
    aliases: list[str] | None = None,
    answer_source: str | None = None,
    status: str = "complete",
) -> str:
    block_pattern = re.compile(
        rf"(\{{\s*id: \"{re.escape(honor_id)}\"[\s\S]*?)(status: \")[^\"]+(\")",
        re.MULTILINE,
    )
    match = block_pattern.search(text)
    if not match:
        raise ValueError(f"Honor block not found: {honor_id}")

    updated = match.group(0)
    if name_en is not None:
        updated = re.sub(r'nameEn: "[^"]*"', f'nameEn: "{name_en}"', updated, count=1)
    if requirements is not None:
        req_parts = ", ".join(json.dumps(value, ensure_ascii=False) for value in requirements)
        updated = re.sub(r"requirements: \[[\s\S]*?\]", f"requirements: [{req_parts}]", updated, count=1)
    if aliases is not None:
        alias_parts = ", ".join(json.dumps(value, ensure_ascii=False) for value in aliases)
        updated = re.sub(r"aliases: \[[^\]]*\]", f"aliases: [{alias_parts}]", updated, count=1)
    if answers is not None:
        updated = re.sub(r"answers: \[[\s\S]*?\]", f"answers: {format_answers(answers)}", updated, count=1)
    if answer_source is not None:
        updated = re.sub(r'answerSource: "[^"]*"', f'answerSource: "{answer_source}"', updated, count=1)
    updated = re.sub(r'status: "[^"]+"', f'status: "{status}"', updated, count=1)
    return text[: match.start()] + updated + text[match.end() :]


def main() -> int:
    translator = GoogleTranslator(source="en", target="zh-TW")
    text = HONORS_DATA.read_text(encoding="utf-8")

    gods_world_zh = [translate_text(item, translator) for item in GODS_WORLD_ANSWERS_EN]
    time.sleep(0.2)
    safety_zh = [translate_text(item, translator) for item in SAFETY_ANSWERS_EN]
    time.sleep(0.2)
    gadgets_zh = translate_text(GADGETS_ANSWER_EN, translator)

    text = patch_honor(text, "hka4034-story-listening-ii", status="complete", answer_source="答案由英文 Award Book 2020 整理/翻譯（網站代碼 HKA4033 與 PDF HKA4034 不一致）")
    text = patch_honor(
        text,
        "you4865-safety-specialist",
        answers=[{"requirementIndex": index, "text": value} for index, value in enumerate(safety_zh)],
        status="complete",
        answer_source="答案由英文 Award Book 2020 整理/翻譯（網站要求與 PDF 編號略有不同，已按中文要求對照）",
    )
    text = patch_honor(text, "hka4058-playing-with-friends", status="complete", answer_source="答案由英文 Award Book 2020 整理/翻譯（網站代碼 HKA5058 為筆誤）")
    text = patch_honor(text, "hka4056-left-and-right", status="complete", answer_source="答案由英文 Award Book 2020 整理/翻譯（網站代碼 YOU4056 與 PDF 不一致）")
    text = patch_honor(
        text,
        "hka4073-good-samaritan",
        name_en="God's World",
        requirements=[
            "1. 誰創造這世界？（創世記 1:1）",
            "2. 當有人朗讀或講述創造天地的故事時，請試用動作表演出來。",
            "3. 唱一首關於這世界的歌曲。",
            "4. 查看地球儀或地圖，並指出你所居住的地方。",
            "5. 請列出你最喜歡上帝為你創造的五項東西。",
            "6. 製作一幅拼貼畫並將上帝的聖言填上顏色，或到戶外走走，找出上帝創造的東西。",
        ],
        aliases=["HKA4073", "Good Samaritan"],
        answers=[{"requirementIndex": index, "text": value} for index, value in enumerate(gods_world_zh)],
        status="complete",
        answer_source="答案由英文 Award Book 2020 整理/翻譯（原誤配 Good Samaritan，已改為 God's World）",
    )
    text = patch_honor(
        text,
        "hka4009-gadgets-and-sand",
        answers=[{"requirementIndex": 0, "text": gadgets_zh}],
        status="complete",
        answer_source="答案由英文 Award Book 2020 整理/翻譯（PDF 僅有第 1 項 Supporting Answers）",
    )

    HONORS_DATA.write_text(text, encoding="utf-8")
    print("Updated 6 needs-review honors")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
