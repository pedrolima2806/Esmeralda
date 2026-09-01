import Link from "next/link";
import { database } from "@/lib/database/client";
import { formatReportDate } from "@/lib/reports/utils";

const statusLabel = { DRAFT: "Rascunho", PUBLISHED: "Publicado", ARCHIVED: "Arquivado" } as const;

export default async function AdminPage() {
  const reports = await database.report.findMany({ orderBy: { updatedAt: "desc" } });
  const published = reports.filter((report) => report.status === "PUBLISHED").length;
  const drafts = reports.filter((report) => report.status === "DRAFT").length;
  return (
    <main className="admin-page">
      <header className="admin-page-header">
        <div><p className="admin-kicker">VISÃO GERAL</p><h1>Relatórios</h1><p>Gerencie o ciclo editorial da análise à publicação.</p></div>
        <Link className="admin-primary-link" href="/admin/relatorios/novo">+ Novo relatório</Link>
      </header>
      <div className="admin-stats">
        <div><span>Total</span><strong>{String(reports.length).padStart(2, "0")}</strong></div>
        <div><span>Publicados</span><strong>{String(published).padStart(2, "0")}</strong></div>
        <div><span>Rascunhos</span><strong>{String(drafts).padStart(2, "0")}</strong></div>
      </div>
      <section className="admin-list" aria-labelledby="admin-list-title">
        <div className="admin-list-heading"><h2 id="admin-list-title">Todos os relatórios</h2><span>{reports.length} registros</span></div>
        {reports.length ? reports.map((report) => (
          <article className="admin-report-row" key={report.id}>
            <div className={`status-dot ${report.status.toLowerCase()}`} aria-hidden="true" />
            <div>
              <h3>{report.title}</h3>
              <p>{report.category ? `${report.category} · ` : ""}Atualizado em {formatReportDate(report.updatedAt)}</p>
            </div>
            <span className={`status-badge ${report.status.toLowerCase()}`}>{statusLabel[report.status]}</span>
            <div className="admin-row-actions">
              {report.status === "PUBLISHED" ? <Link href={`/relatorios/${report.slug}`} target="_blank">Visualizar ↗</Link> : null}
              <Link href={`/admin/relatorios/${report.id}`}>Editar →</Link>
            </div>
          </article>
        )) : <div className="admin-empty">Nenhum relatório criado.</div>}
      </section>
    </main>
  );
}
