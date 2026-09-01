type BcbSeriesEntry = {
  data?: string;
  valor?: string;
};

type MacroSeries = {
  key: "selic" | "ipca-monthly" | "ipca-annual";
  code: number;
  label: string;
  period: string;
  description: string;
};

const macroSeries: MacroSeries[] = [
  {
    key: "selic",
    code: 432,
    label: "Selic",
    period: "ao ano",
    description: "Meta da taxa básica de juros definida pelo Copom.",
  },
  {
    key: "ipca-monthly",
    code: 433,
    label: "IPCA",
    period: "no mês",
    description: "Variação mensal do índice oficial de preços ao consumidor.",
  },
  {
    key: "ipca-annual",
    code: 13522,
    label: "Inflação",
    period: "em 12 meses",
    description: "IPCA acumulado nos últimos 12 meses.",
  },
];

export type MacroeconomicIndicator = Omit<MacroSeries, "code"> & {
  value: number;
  referenceDate: string;
  history: Array<{
    date: string;
    value: number;
  }>;
  lastChangeDate: string | null;
};

export type MacroeconomicSnapshot = {
  status: "available" | "partial" | "unavailable";
  indicators: MacroeconomicIndicator[];
};

function formatBcbDate(date: Date) {
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getUTCFullYear()}`;
}

function buildSeriesUrl(series: MacroSeries) {
  if (series.key !== "selic") {
    return `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${series.code}/dados/ultimos/12?formato=json`;
  }

  const endDate = new Date();
  endDate.setUTCMonth(endDate.getUTCMonth() + 1);
  const startDate = new Date(endDate);
  startDate.setUTCFullYear(startDate.getUTCFullYear() - 2);
  const parameters = new URLSearchParams({
    formato: "json",
    dataInicial: formatBcbDate(startDate),
    dataFinal: formatBcbDate(endDate),
  });
  return `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${series.code}/dados?${parameters}`;
}

async function getSeriesIndicator(series: MacroSeries): Promise<MacroeconomicIndicator | null> {
  try {
    const response = await fetch(buildSeriesUrl(series), {
      next: { revalidate: 3600 },
    });
    if (!response.ok) return null;

    const entries = (await response.json() as BcbSeriesEntry[]).flatMap((entry) => {
      const value = Number(entry.valor?.replace(",", "."));
      return entry.data && Number.isFinite(value) ? [{ date: entry.data, value }] : [];
    });
    const latest = entries.at(-1);
    const value = latest?.value;
    if (!latest?.date || typeof value !== "number" || !Number.isFinite(value)) return null;

    let lastChangeDate: string | null = null;
    if (series.key === "selic") {
      for (let index = entries.length - 1; index > 0; index -= 1) {
        if (entries[index].value !== entries[index - 1].value) {
          lastChangeDate = entries[index].date;
          break;
        }
      }
    }

    const history = series.key === "selic"
      ? entries.filter((entry, index) => index === 0 || entry.value !== entries[index - 1].value).slice(-12)
      : entries.slice(-12);

    return {
      key: series.key,
      label: series.label,
      period: series.period,
      description: series.description,
      value,
      referenceDate: latest.date,
      history,
      lastChangeDate,
    };
  } catch {
    return null;
  }
}

export async function getMacroeconomicSnapshot(): Promise<MacroeconomicSnapshot> {
  const results = await Promise.all(macroSeries.map(getSeriesIndicator));
  const indicators = results.flatMap((indicator) => indicator ? [indicator] : []);

  return {
    status: indicators.length === macroSeries.length ? "available" : indicators.length > 0 ? "partial" : "unavailable",
    indicators,
  };
}
