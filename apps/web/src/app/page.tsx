import Link from "next/link";
import { ReportCard } from "@/components/reports/report-card";
import { listPublishedReports } from "@/lib/reports/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const reports = await listPublishedReports(3);

  return (
    <main>
      <section className="hero page-container">
        <div className="hero-copy">
          <p className="eyebrow">Esmeralda</p>
          <h1>Informação financeira com contexto e clareza.</h1>
          <p className="summary">
            Análises semanais para entender os movimentos do mercado e tomar decisões
            com uma visão mais ampla do cenário econômico.
          </p>
          <Link className="primary-link" href="/relatorios">
            Explorar relatórios <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="hero-mark" aria-hidden="true"><span>E</span></div>
      </section>

      <section className="reports-section page-container" aria-labelledby="latest-title">
        <div className="section-heading">
          <div><p className="eyebrow">Publicações</p><h2 id="latest-title">Relatórios recentes</h2></div>
          {reports.length > 0 ? <Link href="/relatorios">Ver todos</Link> : null}
        </div>
        {reports.length > 0 ? (
          <div className="report-grid">
            {reports.map((report) => <ReportCard key={report.id} report={report} />)}
          </div>
        ) : (
          <div className="empty-state">
            <p className="eyebrow">Em preparação</p>
            <h3>O primeiro relatório está a caminho.</h3>
            <p>Em breve, novas análises estarão disponíveis para consulta.</p>
          </div>
        )}
      </section>
    </main>
  );
}
