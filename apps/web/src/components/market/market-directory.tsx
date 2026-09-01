"use client";

import { useMemo, useState } from "react";
import type { MarketCompany, MarketCompanyCatalog } from "@/lib/market/queries";

type SortOption = "volume" | "change" | "name";

function formatPrice(company: MarketCompany) {
  if (company.price === null) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: company.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(company.price);
}

function formatCompactNumber(value: number | null) {
  if (value === null) return "—";
  return new Intl.NumberFormat("pt-BR", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatChange(value: number | null) {
  if (value === null) return "—";
  return `${value >= 0 ? "+" : ""}${value.toFixed(2).replace(".", ",")}%`;
}

function formatUpdateTime(value: string | null) {
  if (!value) return "sem atualização";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(value));
}

export function MarketDirectory({ catalog }: { catalog: MarketCompanyCatalog }) {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("volume");

  const companies = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
    const filtered = catalog.companies.filter((company) => {
      if (!normalizedQuery) return true;
      return [company.symbol, company.name, company.sector, company.subsector]
        .some((value) => value?.toLocaleLowerCase("pt-BR").includes(normalizedQuery));
    });

    return filtered.toSorted((first, second) => {
      if (sortBy === "name") return first.name.localeCompare(second.name, "pt-BR");
      if (sortBy === "change") return (second.changePercent ?? Number.NEGATIVE_INFINITY) - (first.changePercent ?? Number.NEGATIVE_INFINITY);
      return (second.volume ?? Number.NEGATIVE_INFINITY) - (first.volume ?? Number.NEGATIVE_INFINITY);
    });
  }, [catalog.companies, query, sortBy]);

  if (catalog.status === "unavailable") {
    return (
      <div className="market-directory-unavailable">
        <p className="eyebrow">Conexão em espera</p>
        <h2>Não foi possível carregar as empresas agora.</h2>
        <p>Tente atualizar a página em alguns instantes. Os relatórios do site continuam disponíveis normalmente.</p>
      </div>
    );
  }

  return (
    <>
      <div className="market-directory-toolbar">
        <label className="market-search">
          <span>Buscar empresa</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Código, nome ou setor"
          />
        </label>
        <label className="market-sort">
          <span>Ordenar por</span>
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value as SortOption)}>
            <option value="volume">Mais negociadas</option>
            <option value="change">Maior variação</option>
            <option value="name">Nome da empresa</option>
          </select>
        </label>
      </div>

      <div className="market-directory-summary" aria-live="polite">
        <span>{companies.length} {companies.length === 1 ? "ativo encontrado" : "ativos encontrados"}</span>
        <span>Atualizado em {formatUpdateTime(catalog.updatedAt)}</span>
      </div>

      {companies.length > 0 ? (
        <div className="market-table-shell">
          <table className="market-table">
            <thead>
              <tr>
                <th>Empresa</th>
                <th>Setor</th>
                <th>Preço</th>
                <th>Variação</th>
                <th>Volume</th>
                <th>Valor de mercado</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => {
                const positive = (company.changePercent ?? 0) >= 0;
                return (
                  <tr key={company.symbol}>
                    <td data-label="Empresa">
                      <strong>{company.symbol}</strong>
                      <span>{company.name}</span>
                    </td>
                    <td data-label="Setor">
                      <span>{company.subsector || company.sector || "Não informado"}</span>
                    </td>
                    <td data-label="Preço"><strong>{formatPrice(company)}</strong></td>
                    <td data-label="Variação">
                      <strong className={company.changePercent === null ? "neutral" : positive ? "positive" : "negative"}>
                        {formatChange(company.changePercent)}
                      </strong>
                    </td>
                    <td data-label="Volume">{formatCompactNumber(company.volume)}</td>
                    <td data-label="Valor de mercado">{formatCompactNumber(company.marketCap)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="market-search-empty">
          <h2>Nenhuma empresa encontrada.</h2>
          <p>Tente buscar pelo código da ação, pelo nome da companhia ou pelo setor.</p>
        </div>
      )}
    </>
  );
}
