"use client";

import { useActionState, useState } from "react";
import { saveReport, type ReportActionState } from "@/app/admin/actions";
import { slugify } from "@/lib/admin/report-content";

type ReportFormData = {
  id?: string;
  title: string;
  slug: string;
  summary: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  sections: { title: string; body: string }[];
};

const emptySection = { title: "", body: "" };

export function ReportForm({ report }: { report: ReportFormData }) {
  const initialActionState: ReportActionState = {};
  const [actionState, formAction, pending] = useActionState(saveReport, initialActionState);
  const [title, setTitle] = useState(report.title);
  const [slug, setSlug] = useState(report.slug);
  const [summary, setSummary] = useState(report.summary);
  const [status, setStatus] = useState(report.status);
  const [slugEdited, setSlugEdited] = useState(Boolean(report.slug));
  const [sections, setSections] = useState(
    Array.from({ length: 4 }, (_, index) => report.sections[index] ?? emptySection),
  );

  const updateSection = (index: number, field: "title" | "body", value: string) => {
    setSections((current) => current.map((section, sectionIndex) =>
      sectionIndex === index ? { ...section, [field]: value } : section,
    ));
  };

  return (
    <form action={formAction} className="admin-form">
      {report.id ? <input type="hidden" name="id" value={report.id} /> : null}
      <div className="admin-form-grid">
        <div className="admin-form-main">
          <div className="field-group">
            <label htmlFor="title">Título</label>
            <input
              id="title"
              name="title"
              value={title}
              onChange={(event) => {
                const value = event.target.value;
                setTitle(value);
                if (!slugEdited) setSlug(slugify(value));
              }}
              maxLength={180}
              required
            />
          </div>
          <div className="field-group">
            <label htmlFor="summary">Resumo</label>
            <textarea id="summary" name="summary" value={summary} onChange={(event) => setSummary(event.target.value)} rows={3} maxLength={500} />
            <small>Uma introdução curta exibida nos cartões e no início do relatório.</small>
          </div>
          <div className="section-editor-heading">
            <div><span>CONTEÚDO</span><h2>Seções do relatório</h2></div>
            <p>Até quatro seções neste primeiro editor.</p>
          </div>
          {sections.map((section, index) => (
            <fieldset className="section-editor" key={index}>
              <legend>Seção {String(index + 1).padStart(2, "0")}</legend>
              <div className="field-group">
                <label htmlFor={`section_${index}_title`}>Título da seção</label>
                <input id={`section_${index}_title`} name={`section_${index}_title`} value={section.title} onChange={(event) => updateSection(index, "title", event.target.value)} />
              </div>
              <div className="field-group">
                <label htmlFor={`section_${index}_body`}>Conteúdo</label>
                <textarea id={`section_${index}_body`} name={`section_${index}_body`} value={section.body} onChange={(event) => updateSection(index, "body", event.target.value)} rows={9} />
                <small>Use ## para subtítulo, &gt; para citação e - para itens de lista.</small>
              </div>
            </fieldset>
          ))}
        </div>
        <aside className="admin-form-sidebar">
          {actionState.message ? <div className="admin-alert error" role="alert">{actionState.message} Seu progresso foi mantido.</div> : null}
          <div className="field-group">
            <label htmlFor="status">Status</label>
            <select id="status" name="status" value={status} onChange={(event) => setStatus(event.target.value as ReportFormData["status"])}>
              <option value="DRAFT">Rascunho</option>
              <option value="PUBLISHED">Publicado</option>
              <option value="ARCHIVED">Arquivado</option>
            </select>
          </div>
          <div className="field-group">
            <label htmlFor="slug">Slug</label>
            <input
              id="slug"
              name="slug"
              value={slug}
              onChange={(event) => { setSlugEdited(true); setSlug(slugify(event.target.value)); }}
              maxLength={180}
              required
            />
            <small>/relatorios/{slug || "endereco-do-relatorio"}</small>
          </div>
          <button className="admin-submit" type="submit" disabled={pending}>
            {pending ? "Salvando..." : "Salvar relatório"} <span>{pending ? "···" : "→"}</span>
          </button>
          <p className="admin-form-note">Ao selecionar “Publicado”, o conteúdo ficará disponível nas páginas públicas.</p>
        </aside>
      </div>
    </form>
  );
}
