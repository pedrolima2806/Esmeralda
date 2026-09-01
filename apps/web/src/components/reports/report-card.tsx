import Link from "next/link";
import type { PublishedReportSummary } from "@/lib/reports/queries";
import { formatReferenceDate, formatReportDate } from "@/lib/reports/utils";

export function ReportCard({ report, index }: { report: PublishedReportSummary; index?: number }) {
  const displayedDate = report.referenceDate ?? report.publishedAt;
  return (
    <Link className="report-card-link" href={`/relatorios/${report.slug}`}>
      <article className="report-card">
        {report.coverImageUrl ? (
          <div
            className="report-card-cover"
            role="img"
            aria-label={`Capa do relatório ${report.title}`}
            style={{ backgroundImage: `url(${JSON.stringify(report.coverImageUrl)})` }}
          />
        ) : null}
        <div className="card-meta">
          <span>{report.category || "Relatório"}</span>
          <time dateTime={displayedDate.toISOString()}>
            {report.referenceDate ? formatReferenceDate(displayedDate) : formatReportDate(displayedDate)}
          </time>
        </div>
        <h3>{report.title}</h3>
        {report.summary ? <p>{report.summary}</p> : null}
        {report.tags.length ? <div className="report-card-tags">{report.tags.slice(0, 3).map((tag) => <span key={tag}>#{tag}</span>)}</div> : null}
        <span className="text-link">
          Ler relatório{index !== undefined ? ` · RPT_${String(index + 1).padStart(2, "0")}` : ""} <span aria-hidden="true">→</span>
        </span>
      </article>
    </Link>
  );
}
