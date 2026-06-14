import { FormattedHonorText } from "@/app/adventurer-honors/FormattedHonorText";
import {
  getAnswerListClassName,
  normalizeChineseQuotes,
  parseHonorAnswer,
  type AnswerBlock,
} from "@/app/adventurer-honors/honor-answer-format";

function AnswerBlockView({ block }: { block: AnswerBlock }) {
  switch (block.type) {
    case "heading":
      return (
        <p className="mt-3 first:mt-0 text-sm font-semibold text-gray-800">
          <FormattedHonorText text={block.content} />
        </p>
      );
    case "list":
      return (
        <ul className={getAnswerListClassName()}>
          {block.items.map((item, index) => (
            <li key={index} className="pl-1 leading-relaxed">
              <FormattedHonorText text={item} />
            </li>
          ))}
        </ul>
      );
    case "paragraph":
      return (
        <p className="leading-relaxed text-gray-900">
          <FormattedHonorText text={block.content} />
        </p>
      );
    default: {
      const unreachable: never = block;
      return unreachable;
    }
  }
}

export function HonorAnswerContent({ text }: { text: string }) {
  const blocks = parseHonorAnswer(normalizeChineseQuotes(text));

  return (
    <div className="space-y-2">
      {blocks.map((block, index) => (
        <AnswerBlockView key={index} block={block} />
      ))}
    </div>
  );
}
