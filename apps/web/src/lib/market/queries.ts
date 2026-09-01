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
