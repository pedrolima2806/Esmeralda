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
          <p className="eyebrow"><span>01</span> Inteligência de mercado</p>
          <h1>Mercado em dados.<br /><em>Decisões em contexto.</em></h1>
          <p className="summary">
            Análises semanais para entender os movimentos do mercado e tomar decisões
            com uma visão mais ampla do cenário econômico.
          </p>
          <Link className="primary-link" href="/relatorios">
            Explorar relatórios <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="signal-panel" aria-hidden="true">
          <div className="signal-header"><span>MARKET SIGNAL</span><span>LIVE_01</span></div>
          <div className="signal-value"><span>ESM_ANALYTICS</span><strong>ONLINE</strong></div>
          <svg viewBox="0 0 500 220" role="presentation">
            <defs>
              <linearGradient id="signal-fill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="#42f5a7" stopOpacity=".28" />
                <stop offset="1" stopColor="#42f5a7" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path className="signal-area" d="M0 185 L45 165 L85 174 L125 137 L165 149 L210 108 L250 125 L300 72 L344 93 L390 45 L435 61 L500 16 L500 220 L0 220 Z" />
            <path className="signal-line" d="M0 185 L45 165 L85 174 L125 137 L165 149 L210 108 L250 125 L300 72 L344 93 L390 45 L435 61 L500 16" />
          </svg>
          <div className="signal-footer"><span>ANÁLISE</span><span>MACRO</span><span>MERCADOS</span></div>
        </div>
      </section>

      <section className="reports-section page-container" aria-labelledby="latest-title">
        <div className="section-heading">
          <div><p className="eyebrow"><span>02</span> Publicações</p><h2 id="latest-title">Relatórios recentes</h2></div>
          {reports.length > 0 ? <Link href="/relatorios">Ver todos</Link> : null}
        </div>
        {reports.length > 0 ? (
          <div className="report-grid">
            {reports.map((report, index) => <ReportCard key={report.id} report={report} index={index} />)}
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
