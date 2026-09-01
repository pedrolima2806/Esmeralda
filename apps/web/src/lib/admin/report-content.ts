import type { Prisma } from "@esmeralda/database";

type EditableSection = { title: string; body: string };

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function textToContent(text: string): Prisma.InputJsonValue[] {
  const lines = text.split("\n");
  const blocks: Prisma.InputJsonValue[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length) blocks.push({ type: "paragraph", text: paragraph.join(" ") });
    paragraph = [];
  };
  const flushList = () => {
    if (list.length) blocks.push({ type: "list", items: list });
    list = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushParagraph();
      flushList();
    } else if (line.startsWith("## ")) {
      flushParagraph(); flushList();
      blocks.push({ type: "heading", text: line.slice(3) });
    } else if (line.startsWith("> ")) {
      flushParagraph(); flushList();
      blocks.push({ type: "quote", text: line.slice(2) });
    } else if (line.startsWith("- ")) {
      flushParagraph();
      list.push(line.slice(2));
    } else {
      flushList();
      paragraph.push(line);
    }
  }
  flushParagraph(); flushList();
  return blocks;
}

export function contentToText(content: Prisma.JsonValue): string {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content.flatMap((block): string[] => {
    if (!block || typeof block !== "object" || Array.isArray(block)) return [];
    if (block.type === "heading" && typeof block.text === "string") return [`## ${block.text}`];
    if (block.type === "quote" && typeof block.text === "string") return [`> ${block.text}`];
    if (block.type === "paragraph" && typeof block.text === "string") return [block.text];
    if (block.type === "list" && Array.isArray(block.items)) {
      return [block.items.filter((item): item is string => typeof item === "string").map((item) => `- ${item}`).join("\n")];
    }
    return [];
  }).join("\n\n");
}

export function sectionsFromForm(formData: FormData): EditableSection[] {
  return Array.from({ length: 4 }, (_, index) => ({
    title: String(formData.get(`section_${index}_title`) ?? "").trim(),
    body: String(formData.get(`section_${index}_body`) ?? "").trim(),
  })).filter((section) => section.title || section.body);
}
