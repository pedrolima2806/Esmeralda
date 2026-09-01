"use client";

import { useActionState, useState } from "react";
import { saveReport, type ReportActionState } from "@/app/admin/actions";
import { slugify } from "@/lib/admin/report-content";

type ReportFormData = {
  id?: string;
  title: string;
  slug: string;
  summary: string;
  category: string;
  author: string;
  coverImageUrl: string;
  tags: string;
  referenceDate: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  sections: { title: string; body: string }[];
  sources: { title: string; url: string }[];
};

const emptySection = { title: "", body: "" };
const emptySource = { title: "", url: "" };

function formatDateInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function ReportForm({ report }: { report: ReportFormData }) {
  const initialActionState: ReportActionState = {};
  const [actionState, formAction, pending] = useActionState(saveReport, initialActionState);
  const [title, setTitle] = useState(report.title);
  const [slug, setSlug] = useState(report.slug);
  const [summary, setSummary] = useState(report.summary);
  const [category, setCategory] = useState(report.category);
  const [author, setAuthor] = useState(report.author);
  const [coverImageUrl, setCoverImageUrl] = useState(report.coverImageUrl);
  const [tags, setTags] = useState(report.tags);
  const [referenceDate, setReferenceDate] = useState(report.referenceDate);
  const [status, setStatus] = useState(report.status);
  const [slugEdited, setSlugEdited] = useState(Boolean(report.slug));
  const [sections, setSections] = useState(
    Array.from({ length: 4 }, (_, index) => report.sections[index] ?? emptySection),
  );
  const [sources, setSources] = useState(report.sources.length ? report.sources : []);

  const updateSection = (index: number, field: "title" | "body", value: string) => {
    setSections((current) => current.map((section, sectionIndex) =>
      sectionIndex === index ? { ...section, [field]: value } : section,
    ));
  };

  const updateSource = (index: number, field: "title" | "url", value: string) => {
    setSources((current) => current.map((source, sourceIndex) =>
      sourceIndex === index ? { ...source, [field]: value } : source,
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
          <div className="section-editor-heading metadata-heading">
            <div><span>IDENTIFICAÇÃO</span><h2>Informações editoriais</h2></div>
            <p>Dados usados para organizar e contextualizar a publicação.</p>
          </div>
          <section className="admin-metadata-panel" aria-label="Informações editoriais">
            <div className="admin-metadata-grid">
              <div className="field-group">
                <label htmlFor="category">Categoria</label>
                <input id="category" name="category" list="report-categories" value={category} onChange={(event) => setCategory(event.target.value)} maxLength={80} placeholder="Ex.: Macroeconomia" />
                <datalist id="report-categories">
                  <option value="Panorama semanal" />
                  <option value="Macroeconomia" />
                  <option value="Ações" />
                  <option value="Renda fixa" />
                  <option value="Mercados globais" />
                </datalist>
              </div>
              <div className="field-group">
                <label htmlFor="author">Autor</label>
                <input id="author" name="author" value={author} onChange={(event) => setAuthor(event.target.value)} maxLength={120} placeholder="Nome do autor ou equipe" />
              </div>
              <div className="field-group">
                <label htmlFor="referenceDate">Data de referência</label>
                <input
                  id="referenceDate"
                  name="referenceDate"
                  type="text"
                  inputMode="numeric"
                  value={referenceDate}
                  onChange={(event) => setReferenceDate(event.target.value.slice(0, 10))}
                  onBlur={() => setReferenceDate((current) => formatDateInput(current))}
                  maxLength={10}
                  pattern="[0-9]{2}/[0-9]{2}/[0-9]{4}"
                  placeholder="DD/MM/AAAA"
                />
                <small>Período ao qual os dados e conclusões se referem.</small>
              </div>
              <div className="field-group">
                <label htmlFor="tags">Tags</label>
                <input id="tags" name="tags" value={tags} onChange={(event) => setTags(event.target.value)} maxLength={600} placeholder="juros, inflação, bolsa" />
                <small>Separe por vírgulas. Máximo de 12 tags.</small>
              </div>
            </div>
            <div className="field-group">
              <label htmlFor="coverImageUrl">Imagem de capa</label>
              <input id="coverImageUrl" name="coverImageUrl" value={coverImageUrl} onChange={(event) => setCoverImageUrl(event.target.value)} maxLength={2048} placeholder="https://... ou /images/capa.png" />
              <small>Cole uma URL HTTP/HTTPS ou use o caminho de uma imagem da pasta pública.</small>
            </div>
            {coverImageUrl ? (
              <div
                className="admin-cover-preview"
                role="img"
                aria-label="Prévia da imagem de capa"
                style={{ backgroundImage: `url(${JSON.stringify(coverImageUrl)})` }}
              />
            ) : null}
            <div className="sources-editor">
              <div className="sources-editor-heading">
                <div><h3>Fontes e links</h3><p>Referências consultadas para produzir o relatório.</p></div>
                <button type="button" onClick={() => setSources((current) => current.length < 10 ? [...current, emptySource] : current)} disabled={sources.length >= 10}>+ Adicionar fonte</button>
              </div>
              {sources.length ? sources.map((source, index) => (
                <div className="source-row" key={index}>
                  <div className="field-group">
                    <label htmlFor={`source_${index}_title`}>Título da fonte {index + 1}</label>
                    <input id={`source_${index}_title`} name={`source_${index}_title`} value={source.title} onChange={(event) => updateSource(index, "title", event.target.value)} maxLength={180} placeholder="Ex.: Relatório Focus" />
                  </div>
                  <div className="field-group">
                    <label htmlFor={`source_${index}_url`}>Link</label>
                    <input id={`source_${index}_url`} name={`source_${index}_url`} type="url" value={source.url} onChange={(event) => updateSource(index, "url", event.target.value)} maxLength={2048} placeholder="https://..." />
                  </div>
                  <button className="source-remove" type="button" onClick={() => setSources((current) => current.filter((_, sourceIndex) => sourceIndex !== index))} aria-label={`Remover fonte ${index + 1}`}>Remover</button>
                </div>
              )) : <p className="sources-empty">Nenhuma fonte adicionada.</p>}
            </div>
          </section>
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
