import Link from "next/link";
import type { PublishedReportSummary } from "@/lib/reports/queries";
import { formatReportDate } from "@/lib/reports/utils";

export function ReportCard({ report, index }: { report: PublishedReportSummary; index?: number }) {
  return (
    <article className="report-card">
      <div className="card-meta">
        <time dateTime={report.publishedAt.toISOString()}>{formatReportDate(report.publishedAt)}</time>
        {index !== undefined ? <span>RPT_{String(index + 1).padStart(2, "0")}</span> : null}
      </div>
      <h3><Link href={`/relatorios/${report.slug}`}>{report.title}</Link></h3>
      {report.summary ? <p>{report.summary}</p> : null}
      <Link className="text-link" href={`/relatorios/${report.slug}`}>
        Ler relatório <span aria-hidden="true">→</span>
      </Link>
    </article>
  );
}
