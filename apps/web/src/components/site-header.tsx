import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="page-container header-inner">
        <Link className="brand" href="/" aria-label="Esmeralda — página inicial">
          <span className="brand-symbol" aria-hidden="true"><i /><i /><i /></span>
          <span>ESMERALDA<span className="brand-suffix">.FIN</span></span>
        </Link>
        <nav aria-label="Navegação principal">
          <span className="system-status"><i /> Sistema online</span>
          <Link href="/relatorios">Relatórios</Link>
        </nav>
      </div>
    </header>
  );
}
