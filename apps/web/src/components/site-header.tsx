import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="page-container header-inner">
        <Link className="brand" href="/" aria-label="Esmeralda — página inicial">
          <span className="brand-symbol" aria-hidden="true">E</span>Esmeralda
        </Link>
        <nav aria-label="Navegação principal"><Link href="/relatorios">Relatórios</Link></nav>
      </div>
    </header>
  );
}
