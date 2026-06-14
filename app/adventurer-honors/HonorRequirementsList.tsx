import { normalizeChineseQuotes } from "@/app/adventurer-honors/honor-answer-format";
import {
  buildRequirementTree,
  getRequirementListClassName,
  type RequirementListStyle,
  type RequirementNode,
} from "@/app/adventurer-honors/honor-requirements";

function RequirementList({
  nodes,
  style = "decimal",
  nested = false,
}: {
  nodes: RequirementNode[];
  style?: RequirementListStyle;
  nested?: boolean;
}) {
  const ListTag = style === "disc" ? "ul" : "ol";

  return (
    <ListTag className={getRequirementListClassName(style, nested)}>
      {nodes.map((node, index) => (
        <li key={index} className="pl-1 leading-relaxed">
          {normalizeChineseQuotes(node.text)}
          {node.children.length > 0 && node.childListStyle ? (
            <RequirementList nodes={node.children} style={node.childListStyle} nested />
          ) : null}
        </li>
      ))}
    </ListTag>
  );
}

export function HonorRequirementsList({ requirements }: { requirements: string[] }) {
  return <RequirementList nodes={buildRequirementTree(requirements)} />;
}
