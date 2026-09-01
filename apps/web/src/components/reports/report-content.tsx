import type { Prisma } from "@esmeralda/database";

type ContentBlock =
  | { type: "paragraph" | "heading" | "quote"; text: string }
  | { type: "list"; items: string[] };

function parseContent(content: Prisma.JsonValue): ContentBlock[] {
  if (typeof content === "string") return [{ type: "paragraph", text: content }];
  if (!Array.isArray(content)) return [];
  return content.flatMap((block): ContentBlock[] => {
    if (!block || typeof block !== "object" || Array.isArray(block)) return [];
    const type = block.type;
    if ((type === "paragraph" || type === "heading" || type === "quote") && typeof block.text === "string") {
      return [{ type, text: block.text }];
    }
    if (type === "list" && Array.isArray(block.items) && block.items.every((item) => typeof item === "string")) {
      return [{ type, items: block.items }];
    }
    return [];
  });
}

export function ReportContent({ content }: { content: Prisma.JsonValue }) {
  return parseContent(content).map((block, index) => {
    const key = `${block.type}-${index}`;
    if (block.type === "heading") return <h3 key={key}>{block.text}</h3>;
    if (block.type === "quote") return <blockquote key={key}>{block.text}</blockquote>;
    if (block.type === "list") return <ul key={key}>{block.items.map((item) => <li key={item}>{item}</li>)}</ul>;
    return <p key={key}>{block.text}</p>;
  });
}
