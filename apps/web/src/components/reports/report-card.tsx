import Link from "next/link";
import type { PublishedReportSummary } from "@/lib/reports/queries";
import { formatReportDate } from "@/lib/reports/utils";

export function ReportCard({ report }: { report: PublishedReportSummary }) {
  return (
    <article className="report-card">
      <time dateTime={report.publishedAt.toISOString()}>{formatReportDate(report.publishedAt)}</time>
      <h3><Link href={`/relatorios/${report.slug}`}>{report.title}</Link></h3>
      {report.summary ? <p>{report.summary}</p> : null}
      <Link className="text-link" href={`/relatorios/${report.slug}`}>
        Ler relatório <span aria-hidden="true">→</span>
      </Link>
    </article>
  );
}
