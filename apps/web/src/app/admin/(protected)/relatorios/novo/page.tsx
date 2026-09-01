import { ReportForm } from "@/components/admin/report-form";

export default async function NewReportPage({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const hasError = Boolean((await searchParams).erro);
  return (
    <main className="admin-page editor-page">
      <header className="admin-page-header"><div><p className="admin-kicker">NOVO / RELATÓRIO</p><h1>Criar relatório</h1><p>Organize a análise em seções e salve como rascunho antes de publicar.</p></div></header>
      {hasError ? <div className="admin-alert error">Revise os campos. É necessário incluir conteúdo e usar um slug único.</div> : null}
      <ReportForm report={{ title: "", slug: "", summary: "", status: "DRAFT", sections: [] }} />
    </main>
  );
}
