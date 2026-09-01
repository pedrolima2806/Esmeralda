import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReportContent } from "@/components/reports/report-content";
import { findPublishedReport } from "@/lib/reports/queries";
import { formatReferenceDate, formatReportDate } from "@/lib/reports/utils";

export const dynamic = "force-dynamic";
type ReportPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: ReportPageProps): Promise<Metadata> {
  const report = await findPublishedReport((await params).slug);
  if (!report) return { title: "Relatório não encontrado | Esmeralda" };
  return {
    title: `${report.title} | Esmeralda`,
    description: report.summary,
    authors: report.author ? [{ name: report.author }] : undefined,
    openGraph: report.coverImageUrl?.startsWith("http")
      ? { images: [{ url: report.coverImageUrl }] }
      : undefined,
  };
}

export default async function ReportPage({ params }: ReportPageProps) {
  const report = await findPublishedReport((await params).slug);
  if (!report || !report.publishedAt) notFound();
  return (
    <main className="page-container article-page">
      <Link className="back-link" href="/relatorios">← Todos os relatórios</Link>
      <article>
        <header className="article-header">
          <p className="eyebrow">{report.category || "Relatório"}</p><h1>{report.title}</h1>
          {report.summary ? <p className="article-summary">{report.summary}</p> : null}
          <div className="article-metadata">
            {report.author ? <span>Por {report.author}</span> : null}
            <span>Publicado em <time dateTime={report.publishedAt.toISOString()}>{formatReportDate(report.publishedAt)}</time></span>
            {report.referenceDate ? <span>Referência: <time dateTime={report.referenceDate.toISOString()}>{formatReferenceDate(report.referenceDate)}</time></span> : null}
          </div>
          {report.tags.length ? <div className="article-tags">{report.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div> : null}
        </header>
        {report.coverImageUrl ? (
          <div
            className="article-cover"
            role="img"
            aria-label={`Capa do relatório ${report.title}`}
            style={{ backgroundImage: `url(${JSON.stringify(report.coverImageUrl)})` }}
          />
        ) : null}
        <div className="article-body">
          {report.sections.map((section) => (
            <section key={section.id}>
              {section.title ? <h2>{section.title}</h2> : null}
              <ReportContent content={section.content} />
            </section>
          ))}
        </div>
        {report.sources.length ? (
          <footer className="article-sources">
            <p className="eyebrow">Referências</p>
            <h2>Fontes utilizadas</h2>
            <ol>
              {report.sources.map((source) => (
                <li key={source.id}><a href={source.url} target="_blank" rel="noreferrer">{source.title} <span aria-hidden="true">↗</span></a></li>
              ))}
            </ol>
          </footer>
        ) : null}
      </article>
    </main>
  );
}
