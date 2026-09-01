import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page-container not-found">
      <p className="eyebrow">Erro 404</p><h1>Página não encontrada.</h1>
      <p>O conteúdo pode ter mudado de endereço ou ainda não estar publicado.</p>
      <Link className="primary-link" href="/">Voltar ao início</Link>
    </main>
  );
}
