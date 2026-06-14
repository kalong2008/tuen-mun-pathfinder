import { describe, expect, test } from "vitest";

import {
  buildRequirementTree,
  formatRequirementForDisplay,
} from "@/app/adventurer-honors/honor-requirements";

describe("formatRequirementForDisplay", () => {
  test("removes a leading numeric list prefix", () => {
    expect(formatRequirementForDisplay("1. 聽一本關於字母的書")).toBe("聽一本關於字母的書");
    expect(formatRequirementForDisplay("12. 示範正確的刷牙方法。")).toBe("示範正確的刷牙方法。");
  });

  test("leaves text without a leading number unchanged", () => {
    expect(formatRequirementForDisplay("認識英文字母。")).toBe("認識英文字母。");
  });
});

describe("buildRequirementTree", () => {
  test("nests letter sub-requirements under a numbered item", () => {
    const tree = buildRequirementTree([
      "1. 授予幼鋒會會員閱讀或聆聽別人朗讀有關故事。",
      "a. 一本關於健康或安全的書",
      "b. 一本有關家庭，朋友或感受的事書",
      "c. 一本關於歷史或佈道的書",
      "d. 一本關於歷史或佈道的書",
    ]);

    expect(tree).toHaveLength(1);
    expect(tree[0].text).toBe("授予幼鋒會會員閱讀或聆聽別人朗讀有關故事。");
    expect(tree[0].childListStyle).toBe("lower-alpha");
    expect(tree[0].children.map((child) => child.text)).toEqual([
      "一本關於健康或安全的書",
      "一本有關家庭，朋友或感受的事書",
      "一本關於歷史或佈道的書",
      "一本關於歷史或佈道的書",
    ]);
  });

  test("nests bullet sub-requirements under the current parent", () => {
    const tree = buildRequirementTree([
      "1. 從以下類別中，選擇聆聽兩本適合程度並之前未閲讀過的書籍：",
      "◼ 聖經",
      "◼ 佈道",
      "2. 告訴為你講故事的人，在每個故事中，你最喜歡的部分。",
    ]);

    expect(tree).toHaveLength(2);
    expect(tree[0].childListStyle).toBe("disc");
    expect(tree[0].children.map((child) => child.text)).toEqual(["聖經", "佈道"]);
    expect(tree[1].children).toEqual([]);
  });

  test("keeps letter i as a sibling after letter h", () => {
    const tree = buildRequirementTree([
      "2. 辨別以下十種花卉 (或您所屬地區之同類花卉)。",
      "h. 康乃馨",
      "i. 劍蘭",
      "j. 百合",
    ]);

    expect(tree[0].children.map((child) => child.text)).toEqual(["康乃馨", "劍蘭", "百合"]);
  });

  test("nests roman sub-requirements under letter a", () => {
    const tree = buildRequirementTree([
      "3. 完成其中一項：",
      "a. 與一位醫生或護士、或其他成人談論以下的害處：",
      "i. 香煙 ii. 酒精 iii. 其他藥物",
      "b. 觀看一部有關使用以上這些危險物品的影片。",
    ]);

    expect(tree[0].children[0].childListStyle).toBe("lower-roman");
    expect(tree[0].children[0].children.map((child) => child.text)).toEqual([
      "香煙 ii. 酒精 iii. 其他藥物",
    ]);
    expect(tree[0].children[1].text).toBe("觀看一部有關使用以上這些危險物品的影片。");
  });

  test("nests bullets under a letter sub-requirement", () => {
    const tree = buildRequirementTree([
      "1. 完成以下其中一項：",
      "a. 照顧一種動物或鳥兒四個星期。",
      "◼ 餵飼牠並確保牠有清潔食水。",
      "◼ 保持籠子或休息地方清潔。",
      "b. 為你附近或學校的鳥兒或動物提供廚餘或種子。",
    ]);

    expect(tree[0].children[0].childListStyle).toBe("disc");
    expect(tree[0].children[0].children.map((child) => child.text)).toEqual([
      "餵飼牠並確保牠有清潔食水。",
      "保持籠子或休息地方清潔。",
    ]);
  });

  test("nests roman sub-requirements under letter b", () => {
    const tree = buildRequirementTree([
      "5. 完成以下其中一項:",
      "a. 在大自然中漫步並收集感興趣的物品",
      "i. 展示或講述你找到的物品",
      "b. 參觀以下其中一個地方，並說出你所看到的：",
      "i. 動物園",
    ]);

    expect(tree[0].children[0].children.map((child) => child.text)).toEqual([
      "展示或講述你找到的物品",
    ]);
    expect(tree[0].children[1].children.map((child) => child.text)).toEqual(["動物園"]);
  });
});
