import { splitTextWithLinks, type TextSegment } from "@/app/adventurer-honors/honor-answer-format";

export function FormattedHonorText({ text }: { text: string }) {
  const segments = splitTextWithLinks(text);

  return (
    <>
      {segments.map((segment, index) => (
        <HonorTextSegment key={index} segment={segment} />
      ))}
    </>
  );
}

function HonorTextSegment({ segment }: { segment: TextSegment }) {
  if (segment.type === "link") {
    return (
      <a
        href={segment.href}
        target="_blank"
        rel="noopener noreferrer"
        className="break-all text-blue-600 underline underline-offset-2 hover:text-blue-800"
      >
        {segment.value}
      </a>
    );
  }

  return <span>{segment.value}</span>;
}
