import {
  getAnswerListClassName,
  normalizeChineseQuotes,
  parseHonorAnswer,
  splitTextWithLinks,
  type AnswerBlock,
} from "@/app/adventurer-honors/honor-answer-format";

function FormattedAnswerText({ text }: { text: string }) {
  const segments = splitTextWithLinks(text);

  return (
    <>
      {segments.map((segment, index) =>
        segment.type === "link" ? (
          <a
            key={index}
            href={segment.href}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all text-blue-600 underline underline-offset-2 hover:text-blue-800"
          >
            {segment.value}
          </a>
        ) : (
          <span key={index}>{segment.value}</span>
        ),
      )}
    </>
  );
}

function AnswerBlockView({ block }: { block: AnswerBlock }) {
  switch (block.type) {
    case "heading":
      return (
        <p className="mt-3 first:mt-0 text-sm font-semibold text-gray-800">
          <FormattedAnswerText text={block.content} />
        </p>
      );
    case "list":
      return (
        <ul className={getAnswerListClassName()}>
          {block.items.map((item, index) => (
            <li key={index} className="pl-1 leading-relaxed">
              <FormattedAnswerText text={item} />
            </li>
          ))}
        </ul>
      );
    case "paragraph":
      return (
        <p className="leading-relaxed text-gray-900">
          <FormattedAnswerText text={block.content} />
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
