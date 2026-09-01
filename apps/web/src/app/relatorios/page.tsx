import type { Metadata } from "next";
import { ReportCard } from "@/components/reports/report-card";
import { listPublishedReports } from "@/lib/reports/queries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Relatórios | Esmeralda",
  description: "Análises financeiras e econômicas publicadas pela Esmeralda.",
};

export default async function ReportsPage() {
  const reports = await listPublishedReports();
  return (
    <main className="page-container archive-page">
      <header className="page-intro">
        <p className="eyebrow">Arquivo</p><h1>Relatórios</h1>
        <p>Consulte análises recentes e acompanhe a evolução do cenário financeiro e econômico.</p>
      </header>
      {reports.length > 0 ? (
        <div className="report-grid">{reports.map((report, index) => <ReportCard key={report.id} report={report} index={index} />)}</div>
      ) : (
        <div className="empty-state"><h2>Nenhum relatório publicado ainda.</h2><p>As próximas análises aparecerão aqui.</p></div>
      )}
    </main>
  );
}
