"use client";

import { useEffect, useState } from "react";
import type { MarketAsset, MarketSnapshot } from "@/lib/market/queries";

function formatPrice(asset: MarketAsset) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: asset.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(asset.price);
}

function formatUpdateTime(value: string | null) {
  if (!value) return "sem atualização";
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(value));
}

function Sparkline({ values, positive, symbol }: { values: number[]; positive: boolean; symbol: string }) {
  if (values.length < 2) return <div className="market-chart-empty">Histórico indisponível</div>;
  const width = 320;
  const height = 100;
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  const range = maximum - minimum || 1;
  const points = values.map((value, index) => {
    const x = (index / (values.length - 1)) * width;
    const y = height - 8 - ((value - minimum) / range) * (height - 16);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(" ");

  return (
    <svg className={positive ? "market-chart positive" : "market-chart negative"} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Evolução de ${symbol} no último mês`} preserveAspectRatio="none">
      <line x1="0" y1={height - 1} x2={width} y2={height - 1} />
      <polyline points={points} fill="none" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function MarketOverview({ initialSnapshot }: { initialSnapshot: MarketSnapshot }) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const response = await fetch("/api/market", { cache: "no-store" });
        if (!response.ok) return;
        const nextSnapshot = await response.json() as MarketSnapshot;
        if (active) setSnapshot(nextSnapshot);
      } catch {
        // Mantém o último snapshot válido quando uma atualização pontual falha.
      }
    };
    const interval = window.setInterval(refresh, 60_000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  return (
    <section className="market-section" aria-labelledby="market-title">
      <div className="page-container">
        <header className="market-heading">
          <div>
            <p className="eyebrow"><span>02</span> Dados de mercado</p>
            <h2 id="market-title">Pulso do mercado</h2>
            <p>Cotações da B3 e a trajetória dos últimos pregões em uma leitura rápida.</p>
          </div>
          <div className={`market-status ${snapshot.status}`}>
            <i aria-hidden="true" />
            <span>{snapshot.status === "available" ? `Atualizado às ${formatUpdateTime(snapshot.updatedAt)}` : "Dados temporariamente indisponíveis"}</span>
          </div>
        </header>

        {snapshot.status === "available" ? (
          <div className="market-grid">
            {snapshot.assets.map((asset) => {
              const positive = asset.changePercent >= 0;
              return (
                <article className="market-card" key={asset.symbol}>
                  <header><div><span>{asset.symbol}</span><p>{asset.name}</p></div><b>B3</b></header>
                  <div className="market-price-row">
                    <strong>{formatPrice(asset)}</strong>
                    <span className={positive ? "positive" : "negative"}>{positive ? "+" : ""}{asset.changePercent.toFixed(2).replace(".", ",")}%</span>
                  </div>
                  <Sparkline values={asset.history} positive={positive} symbol={asset.symbol} />
                  <footer>Último mês · atualização automática</footer>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="market-unavailable">
            <div className="market-unavailable-grid" aria-hidden="true">
              {Array.from({ length: 4 }, (_, index) => <span key={index} />)}
            </div>
            <div><h3>Conexão de mercado em espera.</h3><p>O restante do site continua disponível enquanto tentamos uma nova atualização.</p></div>
          </div>
        )}

        <footer className="market-disclaimer">
          <span>Fonte: <a href="https://brapi.dev" target="_blank" rel="noreferrer">brapi.dev ↗</a></span>
          <span>Cotações podem ter atraso. Conteúdo informativo, não constitui recomendação.</span>
        </footer>
      </div>
    </section>
  );
}
