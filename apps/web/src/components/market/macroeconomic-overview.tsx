import type { MacroeconomicSnapshot } from "@/lib/market/macroeconomics";

function formatPercent(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function MacroSparkline({ values, label }: { values: number[]; label: string }) {
  if (values.length < 2) return null;

  const width = 180;
  const height = 58;
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  const range = maximum - minimum || 1;
  const points = values.map((value, index) => {
    const x = (index / (values.length - 1)) * width;
    const y = height - 6 - ((value - minimum) / range) * (height - 12);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(" ");

  return (
    <svg className="macro-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Evolução recente de ${label}`} preserveAspectRatio="none">
      <line x1="0" y1={height - 1} x2={width} y2={height - 1} />
      <polyline points={points} fill="none" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function MacroeconomicOverview({ snapshot }: { snapshot: MacroeconomicSnapshot }) {
  return (
    <div className="macro-panel" aria-labelledby="macro-title">
      <header className="dashboard-column-heading macro-heading">
        <div>
          <p className="eyebrow"><span>02</span> Indicadores</p>
          <h2 id="macro-title">Macroeconomia</h2>
        </div>
        <div
          className={`macro-status ${snapshot.status}`}
          title={snapshot.status === "available" ? "Dados oficiais atualizados" : snapshot.status === "partial" ? "Atualização parcial" : "Dados temporariamente indisponíveis"}
        >
          <i aria-hidden="true" />
          {/* <span>{snapshot.status === "available" ? "Atualizado" : snapshot.status === "partial" ? "Parcial" : "Indisponível"}</span> */}
        </div>
      </header>

      {snapshot.indicators.length > 0 ? (
        <div className="macro-grid">
          {snapshot.indicators.map((indicator) => (
            <article className="macro-card" key={indicator.key}>
              <div className="macro-card-content">
                <div>
                  <header>
                    <span>{indicator.label}</span>
                    <b>BCB</b>
                  </header>
                  <div className="macro-value">
                    <strong>{formatPercent(indicator.value)}</strong>
                    <span>%</span>
                  </div>
                </div>
                {indicator.key !== "ipca-monthly" ? (
                  <MacroSparkline values={indicator.history.map((point) => point.value)} label={indicator.label} />
                ) : null}
              </div>
              <p>{indicator.description}</p>
              <footer>
                {indicator.key === "selic" && indicator.lastChangeDate
                  ? `Última alteração em ${indicator.lastChangeDate}`
                  : `${indicator.period} · ref. ${indicator.referenceDate}`}
              </footer>
            </article>
          ))}
        </div>
      ) : (
        <div className="macro-unavailable">
          <h3>Indicadores em atualização.</h3>
          <p>O Banco Central não respondeu agora. Esta área será preenchida automaticamente em uma próxima visita.</p>
        </div>
      )}

      <footer className="macro-source">
        Fonte: <a href="https://dadosabertos.bcb.gov.br" target="_blank" rel="noreferrer">Banco Central do Brasil ↗</a>
      </footer>
    </div>
  );
}
