import type { Metadata } from "next";
import Link from "next/link";
import { MarketDirectory } from "@/components/market/market-directory";
import { getMarketCompanies } from "@/lib/market/queries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Mercado | Esmeralda",
  description: "Acompanhe preços, variações e dados das empresas mais negociadas na B3.",
};

export default async function MarketPage() {
  const catalog = await getMarketCompanies();

  return (
    <main className="page-container market-directory-page">
      <Link className="back-link" href="/#mercado">← Voltar para o início</Link>
      <header className="page-intro market-directory-intro">
        <p className="eyebrow">B3 · Empresas</p>
        <h1>Visão de mercado</h1>
        <p>Consulte os ativos mais negociados, compare a variação do dia e encontre empresas por nome, código ou setor.</p>
      </header>

      <MarketDirectory catalog={catalog} />

      <footer className="market-disclaimer market-directory-disclaimer">
        <span>Fonte: <a href="https://brapi.dev" target="_blank" rel="noreferrer">brapi.dev ↗</a></span>
        <span>Cotações podem ter atraso. Conteúdo informativo, não constitui recomendação.</span>
      </footer>
    </main>
  );
}
