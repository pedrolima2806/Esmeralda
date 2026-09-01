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

const reportSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(3).max(180),
  slug: z.string().trim().max(180).optional(),
  summary: z.string().trim().max(500).optional(),
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
  error?: "fields" | "content" | "slug";
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
    status: formData.get("status"),
  });
  if (!parsed.success) {
    return { error: "fields", message: "Revise o título, o resumo e o status do relatório." };
  }

  const slug = slugify(parsed.data.slug || parsed.data.title);
  const sections = sectionsFromForm(formData);
  if (!slug || sections.length === 0) {
    return { error: "content", message: "Inclua conteúdo em pelo menos uma seção." };
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
    status: parsed.data.status,
    publishedAt: parsed.data.status === "PUBLISHED" ? existing?.publishedAt ?? new Date() : null,
  };

  let reportId: string;
  try {
    if (parsed.data.id) {
      const report = await database.report.update({
        where: { id: parsed.data.id },
        data: { ...reportData, sections: { deleteMany: {}, create: sectionData } },
      });
      reportId = report.id;
    } else {
      const report = await database.report.create({
        data: { ...reportData, sections: { create: sectionData } },
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
