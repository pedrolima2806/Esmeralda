"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { Prisma } from "@esmeralda/database";
import { database } from "@/lib/database/client";
import { sectionsFromForm, slugify, textToContent } from "@/lib/admin/report-content";
import {
  createAdminSession,
  deleteAdminSession,
  requireAdmin,
  validateCredentials,
} from "@/lib/admin/session";

const loginSchema = z.object({
  identifier: z.string().trim().min(1),
  password: z.string().min(1),
});

function isHttpUrl(value: string) {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

function isCoverImageLocation(value: string) {
  return !value || (value.startsWith("/") && !value.startsWith("//")) || isHttpUrl(value);
}

function parseBrazilianDate(value: string) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return null;
  const [, day, month, year] = match;
  const date = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return null;
  return date.getUTCFullYear() === Number(year)
    && date.getUTCMonth() + 1 === Number(month)
    && date.getUTCDate() === Number(day)
    ? date
    : null;
}

function isBrazilianDate(value: string) {
  if (!value) return true;
  return parseBrazilianDate(value) !== null;
}

const reportSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(3).max(180),
  slug: z.string().trim().max(180).optional(),
  summary: z.string().trim().max(500).optional(),
  category: z.string().trim().max(80),
  author: z.string().trim().max(120),
  coverImageUrl: z.string().trim().max(2048).refine(isCoverImageLocation),
  tags: z.string().trim().max(600),
  referenceDate: z.string().trim().refine(isBrazilianDate),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
});

export async function login(formData: FormData) {
  const parsed = loginSchema.safeParse({ identifier: formData.get("identifier"), password: formData.get("password") });
  if (!parsed.success) redirect("/admin/login?erro=credenciais");
  const result = validateCredentials(parsed.data.identifier, parsed.data.password);
  if (!result.configured) redirect("/admin/login?erro=configuracao");
  if (!result.valid) redirect("/admin/login?erro=credenciais");
  await createAdminSession(result.email);
  redirect("/admin");
}

export async function logout() {
  await deleteAdminSession();
  redirect("/admin/login");
}

export type ReportActionState = {
  error?: "fields" | "content" | "slug" | "metadata";
  message?: string;
};

export async function saveReport(
  _previousState: ReportActionState,
  formData: FormData,
): Promise<ReportActionState> {
  await requireAdmin();
  const rawId = String(formData.get("id") ?? "").trim();
  const parsed = reportSchema.safeParse({
    id: rawId || undefined,
    title: formData.get("title"),
    slug: formData.get("slug"),
    summary: formData.get("summary"),
    category: formData.get("category"),
    author: formData.get("author"),
    coverImageUrl: formData.get("coverImageUrl"),
    tags: formData.get("tags"),
    referenceDate: formData.get("referenceDate"),
    status: formData.get("status"),
  });
  if (!parsed.success) {
    return { error: "fields", message: "Revise os campos, use a data no formato DD/MM/AAAA e confira a imagem de capa." };
  }

  const slug = slugify(parsed.data.slug || parsed.data.title);
  const sections = sectionsFromForm(formData);
  if (!slug || sections.length === 0) {
    return { error: "content", message: "Inclua conteúdo em pelo menos uma seção." };
  }

  const tags = Array.from(new Map(
    parsed.data.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
      .map((tag) => [tag.toLocaleLowerCase("pt-BR"), tag]),
  ).values());
  if (tags.length > 12 || tags.some((tag) => tag.length > 40)) {
    return { error: "metadata", message: "Use no máximo 12 tags, com até 40 caracteres cada." };
  }

  const sources = Array.from({ length: 10 }, (_, index) => ({
    title: String(formData.get(`source_${index}_title`) ?? "").trim(),
    url: String(formData.get(`source_${index}_url`) ?? "").trim(),
  })).filter((source) => source.title || source.url);
  if (sources.some((source) => !source.title || source.title.length > 180 || source.url.length > 2048 || !isHttpUrl(source.url))) {
    return { error: "metadata", message: "Cada fonte deve ter um título e um link HTTP ou HTTPS válido." };
  }

  const existing = parsed.data.id
    ? await database.report.findUnique({ where: { id: parsed.data.id }, select: { publishedAt: true } })
    : null;
  const sectionData = sections.map((section, position) => ({
    position: position + 1,
    title: section.title || null,
    content: textToContent(section.body),
  }));
  const reportData = {
    title: parsed.data.title,
    slug,
    summary: parsed.data.summary || null,
    category: parsed.data.category || null,
    author: parsed.data.author || null,
    coverImageUrl: parsed.data.coverImageUrl || null,
    tags,
    referenceDate: parsed.data.referenceDate ? parseBrazilianDate(parsed.data.referenceDate) : null,
    status: parsed.data.status,
    publishedAt: parsed.data.status === "PUBLISHED" ? existing?.publishedAt ?? new Date() : null,
  };
  const sourceData = sources.map((source, position) => ({ ...source, position: position + 1 }));

  let reportId: string;
  try {
    if (parsed.data.id) {
      const report = await database.report.update({
        where: { id: parsed.data.id },
        data: {
          ...reportData,
          sections: { deleteMany: {}, create: sectionData },
          sources: { deleteMany: {}, create: sourceData },
        },
      });
      reportId = report.id;
    } else {
      const report = await database.report.create({
        data: {
          ...reportData,
          sections: { create: sectionData },
          sources: { create: sourceData },
        },
      });
      reportId = report.id;
    }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "slug", message: "Esse slug já está em uso. Escolha outro endereço." };
    }
    return { error: "fields", message: "Não foi possível salvar o relatório. Tente novamente." };
  }

  revalidatePath("/");
  revalidatePath("/relatorios");
  redirect(`/admin/relatorios/${reportId}?salvo=1`);
}
