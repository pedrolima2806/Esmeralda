import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReportContent } from "@/components/reports/report-content";
import { findPublishedReport } from "@/lib/reports/queries";
import { formatReportDate } from "@/lib/reports/utils";

export const dynamic = "force-dynamic";
type ReportPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: ReportPageProps): Promise<Metadata> {
  const report = await findPublishedReport((await params).slug);
  if (!report) return { title: "Relatório não encontrado | Esmeralda" };
  return { title: `${report.title} | Esmeralda`, description: report.summary };
}

export default async function ReportPage({ params }: ReportPageProps) {
  const report = await findPublishedReport((await params).slug);
  if (!report || !report.publishedAt) notFound();
  return (
    <main className="page-container article-page">
      <Link className="back-link" href="/relatorios">← Todos os relatórios</Link>
      <article>
        <header className="article-header">
          <p className="eyebrow">Relatório</p><h1>{report.title}</h1>
          {report.summary ? <p className="article-summary">{report.summary}</p> : null}
          <time dateTime={report.publishedAt.toISOString()}>{formatReportDate(report.publishedAt)}</time>
        </header>
        <div className="article-body">
          {report.sections.map((section) => (
            <section key={section.id}>
              {section.title ? <h2>{section.title}</h2> : null}
              <ReportContent content={section.content} />
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
