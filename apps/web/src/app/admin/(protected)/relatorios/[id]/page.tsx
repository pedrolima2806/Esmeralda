import Link from "next/link";
import { notFound } from "next/navigation";
import { ReportForm } from "@/components/admin/report-form";
import { contentToText } from "@/lib/admin/report-content";
import { database } from "@/lib/database/client";

export default async function EditReportPage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ erro?: string; salvo?: string }>;
}) {
  const report = await database.report.findUnique({
    where: { id: (await params).id },
    include: { sections: { orderBy: { position: "asc" } } },
  });
  if (!report) notFound();
  const query = await searchParams;
  return (
    <main className="admin-page editor-page">
      <header className="admin-page-header">
        <div><p className="admin-kicker">EDITAR / RELATÓRIO</p><h1>Editar conteúdo</h1><p>Última atualização registrada em {report.updatedAt.toLocaleString("pt-BR")}.</p></div>
        {report.status === "PUBLISHED" ? <Link className="admin-secondary-link" href={`/relatorios/${report.slug}`} target="_blank">Visualizar ↗</Link> : null}
      </header>
      {query.salvo ? (
        <div className="admin-alert success">
          {report.status === "PUBLISHED"
            ? "Alterações salvas e disponíveis no site público."
            : "Relatório salvo como rascunho. Selecione “Publicado” para exibi-lo no site."}
        </div>
      ) : null}
      {query.erro ? <div className="admin-alert error">Não foi possível salvar. Revise os campos e confirme se o slug é único.</div> : null}
      <ReportForm report={{
        id: report.id,
        title: report.title,
        slug: report.slug,
        summary: report.summary ?? "",
        status: report.status,
        sections: report.sections.map((section) => ({ title: section.title ?? "", body: contentToText(section.content) })),
      }} />
    </main>
  );
}
