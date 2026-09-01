const marketSymbols = ["PETR4", "VALE3", "ITUB4", "MGLU3"] as const;

type BrapiQuoteResponse = {
  requestedAt?: string;
  results?: Array<{
    symbol?: string;
    data?: {
      shortName?: string | null;
      currency?: string | null;
      regularMarketPrice?: number | null;
      regularMarketChangePercent?: number | null;
      regularMarketTime?: string | null;
    };
  }>;
};

type BrapiHistoryResponse = {
  results?: Array<{
    symbol?: string;
    data?: {
      historicalDataPrice?: Array<{
        date?: number | null;
        close?: number | null;
      }>;
    };
  }>;
};

type BrapiTickersResponse = {
  requestedAt?: string;
  results?: Array<{
    symbol?: string;
    name?: string | null;
    assetType?: string | null;
    exchange?: string | null;
    currency?: string | null;
    sector?: string | null;
    subsector?: string | null;
    isActive?: boolean | null;
    quote?: {
      lastPrice?: number | null;
      changePercent?: number | null;
      volume?: number | null;
      marketCap?: number | null;
    } | null;
  }>;
};

export type MarketAsset = {
  symbol: string;
  name: string;
  currency: string;
  price: number;
  changePercent: number;
  marketTime: string | null;
  history: number[];
};

export type MarketSnapshot = {
  status: "available" | "unavailable";
  updatedAt: string | null;
  assets: MarketAsset[];
};

export type MarketCompany = {
  symbol: string;
  name: string;
  exchange: string;
  currency: string;
  sector: string | null;
  subsector: string | null;
  price: number | null;
  changePercent: number | null;
  volume: number | null;
  marketCap: number | null;
};

export type MarketCompanyCatalog = {
  status: "available" | "unavailable";
  updatedAt: string | null;
  companies: MarketCompany[];
};

function buildHeaders() {
  const token = process.env.BRAPI_TOKEN;
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

export async function getMarketSnapshot(): Promise<MarketSnapshot> {
  const symbols = marketSymbols.join(",");
  const headers = buildHeaders();

  try {
    const [quoteResponse, historyResponse] = await Promise.all([
      fetch(`https://brapi.dev/api/v2/stocks/quote?symbols=${symbols}`, {
        headers,
        next: { revalidate: 60 },
      }),
      fetch(`https://brapi.dev/api/v2/stocks/historical?symbols=${symbols}&range=1mo&interval=1d&sortOrder=asc`, {
        headers,
        next: { revalidate: 300 },
      }),
    ]);

    if (!quoteResponse.ok || !historyResponse.ok) throw new Error("Market provider unavailable");

    const quotes = await quoteResponse.json() as BrapiQuoteResponse;
    const histories = await historyResponse.json() as BrapiHistoryResponse;
    const historyBySymbol = new Map(
      histories.results?.map((result) => [
        result.symbol,
        result.data?.historicalDataPrice
          ?.flatMap((point) => typeof point.close === "number" ? [point.close] : [])
          ?? [],
      ]) ?? [],
    );

    const assets = quotes.results?.flatMap((result): MarketAsset[] => {
      const data = result.data;
      if (!result.symbol || !data || typeof data.regularMarketPrice !== "number" || typeof data.regularMarketChangePercent !== "number") return [];
      return [{
        symbol: result.symbol,
        name: data.shortName?.trim() || result.symbol,
        currency: data.currency || "BRL",
        price: data.regularMarketPrice,
        changePercent: data.regularMarketChangePercent,
        marketTime: data.regularMarketTime || null,
        history: historyBySymbol.get(result.symbol) ?? [],
      }];
    }) ?? [];

    if (!assets.length) throw new Error("Market provider returned no assets");
    return { status: "available", updatedAt: quotes.requestedAt ?? new Date().toISOString(), assets };
  } catch {
    return { status: "unavailable", updatedAt: null, assets: [] };
  }
}

export async function getMarketCompanies(): Promise<MarketCompanyCatalog> {
  try {
    const response = await fetch("https://brapi.dev/api/v2/tickers?type=stock&sortBy=volume&sortOrder=desc&page=1&limit=40", {
      headers: buildHeaders(),
      next: { revalidate: 300 },
    });

    if (!response.ok) throw new Error("Market catalog unavailable");

    const payload = await response.json() as BrapiTickersResponse;
    const companies = payload.results?.flatMap((result): MarketCompany[] => {
      if (!result.symbol || result.assetType !== "stock" || result.isActive === false) return [];

      return [{
        symbol: result.symbol,
        name: result.name?.trim() || result.symbol,
        exchange: result.exchange || "B3",
        currency: result.currency || "BRL",
        sector: result.sector?.trim() || null,
        subsector: result.subsector?.trim() || null,
        price: typeof result.quote?.lastPrice === "number" ? result.quote.lastPrice : null,
        changePercent: typeof result.quote?.changePercent === "number" ? result.quote.changePercent : null,
        volume: typeof result.quote?.volume === "number" ? result.quote.volume : null,
        marketCap: typeof result.quote?.marketCap === "number" ? result.quote.marketCap : null,
      }];
    }) ?? [];

    if (!companies.length) throw new Error("Market catalog returned no companies");
    return {
      status: "available",
      updatedAt: payload.requestedAt ?? new Date().toISOString(),
      companies,
    };
  } catch {
    return { status: "unavailable", updatedAt: null, companies: [] };
  }
}
