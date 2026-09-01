import Image from "next/image";
import Link from "next/link";
import { MarketOverview } from "@/components/market/market-overview";
import { ReportCard } from "@/components/reports/report-card";
import { getMarketSnapshot } from "@/lib/market/queries";
import { listPublishedReports } from "@/lib/reports/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [reports, marketSnapshot] = await Promise.all([
    listPublishedReports(3),
    getMarketSnapshot(),
  ]);

  return (
    <main>
      <section className="hero">
        <Image
          className="hero-background"
          src="/images/emerald-stone-hero.png"
          alt=""
          fill
          priority
          sizes="100vw"
        />
        <div className="hero-copy page-container">
          <h1>Esmeralda</h1>
          <p className="hero-tagline">Lapidando o conhecimento de Mercado</p>
          <Link className="primary-link" href="/relatorios">
            Explorar relatórios <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <section className="reports-section page-container" aria-labelledby="latest-title">
        <div className="section-heading">
          <div><p className="eyebrow"><span>01</span> Publicações</p><h2 id="latest-title">Relatórios recentes</h2></div>
          {reports.length > 0 ? <Link href="/relatorios">Ver todos</Link> : null}
        </div>
        {reports.length > 0 ? (
          <div className="report-grid home-report-grid">
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

      <MarketOverview initialSnapshot={marketSnapshot} />
    </main>
  );
}
