/**
 * Server-side Financial Modeling Prep API client.
 * All functions here run only in API route handlers.
 * Swap this file to change data providers.
 */

import { StockData, StockSearchResult } from "./types";

const BASE_URL = "https://financialmodelingprep.com/api/v3";

function apiKey(): string {
  const key = process.env.FMP_API_KEY;
  if (!key) throw new Error("FMP_API_KEY environment variable is not set");
  return key;
}

async function fmpFetch<T>(path: string): Promise<T> {
  const separator = path.includes("?") ? "&" : "?";
  const url = `${BASE_URL}${path}${separator}apikey=${apiKey()}`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) {
    throw new Error(`FMP API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

// --- Raw FMP response types (only what we use) ---

interface FMPSearchResult {
  symbol: string;
  name: string;
  currency: string;
  exchangeShortName: string;
  stockExchange: string;
}

interface FMPProfile {
  symbol: string;
  companyName: string;
  price: number;
  mktCap: number;
  range: string; // "123.45-234.56"
  sector: string;
  industry: string;
}

interface FMPRatiosTTM {
  peRatioTTM: number | null;
  pegRatioTTM: number | null;
  priceToCashFlowRatioTTM: number | null; // was priceToOperatingCashFlowsRatioTTM
  operatingProfitMarginTTM: number | null;
  netProfitMarginTTM: number | null;
  debtEquityRatioTTM: number | null;
  priceToOperatingCashFlowsRatioTTM: number | null;
}

interface FMPKeyMetricsTTM {
  freeCashFlowPerShareTTM: number | null;
  marketCapTTM: number | null;
  freeCashFlowYieldTTM: number | null; // may not exist
}

interface FMPIncomeStatement {
  date: string;
  revenue: number;
  epsdiluted: number;
}

// --- Public functions ---

export async function searchCompanies(
  query: string
): Promise<StockSearchResult[]> {
  const results = await fmpFetch<FMPSearchResult[]>(
    `/search?query=${encodeURIComponent(query)}&limit=10`
  );
  return results
    .filter(
      (r) =>
        r.exchangeShortName === "NYSE" ||
        r.exchangeShortName === "NASDAQ" ||
        r.exchangeShortName === "AMEX"
    )
    .slice(0, 8)
    .map((r) => ({
      symbol: r.symbol,
      name: r.name,
      currency: r.currency,
      exchangeShortName: r.exchangeShortName,
    }));
}

export async function getFullStockData(ticker: string): Promise<StockData> {
  const upperTicker = ticker.toUpperCase();

  // Fetch all endpoints in parallel
  const [profiles, ratiosArr, metricsArr, incomeStatements] = await Promise.all(
    [
      fmpFetch<FMPProfile[]>(`/profile/${upperTicker}`),
      fmpFetch<FMPRatiosTTM[]>(`/ratios-ttm/${upperTicker}`),
      fmpFetch<FMPKeyMetricsTTM[]>(`/key-metrics-ttm/${upperTicker}`),
      fmpFetch<FMPIncomeStatement[]>(
        `/income-statement/${upperTicker}?limit=4`
      ),
    ]
  );

  const profile = profiles[0];
  if (!profile) throw new Error(`No data found for ticker: ${upperTicker}`);

  const ratios = ratiosArr[0] || ({} as FMPRatiosTTM);
  const metrics = metricsArr[0] || ({} as FMPKeyMetricsTTM);

  // Parse 52-week high from range string "low-high"
  let week52High = 0;
  if (profile.range) {
    const parts = profile.range.split("-");
    week52High = parseFloat(parts[parts.length - 1]) || 0;
  }

  // Calculate 3-year revenue and EPS CAGR
  let revenueGrowth3Y: number | null = null;
  let epsGrowth3Y: number | null = null;

  if (incomeStatements.length >= 4) {
    const newest = incomeStatements[0];
    const oldest = incomeStatements[3];

    if (oldest.revenue > 0 && newest.revenue > 0) {
      revenueGrowth3Y =
        (Math.pow(newest.revenue / oldest.revenue, 1 / 3) - 1) * 100;
    }

    if (oldest.epsdiluted > 0 && newest.epsdiluted > 0) {
      epsGrowth3Y =
        (Math.pow(newest.epsdiluted / oldest.epsdiluted, 1 / 3) - 1) * 100;
    }
  }

  // FCF: use per-share * (marketCap / price) as approximation, or key metrics
  const fcfPerShare = metrics.freeCashFlowPerShareTTM || 0;
  const sharesApprox =
    profile.price > 0 ? profile.mktCap / profile.price : 0;
  const freeCashFlow = fcfPerShare * sharesApprox;

  const fcfYield =
    profile.mktCap > 0 ? (freeCashFlow / profile.mktCap) * 100 : null;

  // Price to cash flow — try both field names
  const priceToCashFlow =
    ratios.priceToCashFlowRatioTTM ??
    ratios.priceToOperatingCashFlowsRatioTTM ??
    null;

  return {
    ticker: upperTicker,
    name: profile.companyName,
    price: profile.price,
    marketCap: profile.mktCap,
    week52High,
    priceToWeek52High: week52High > 0 ? (profile.price / week52High) * 100 : 0,
    peRatio: sanitizeNumber(ratios.peRatioTTM),
    pegRatio: sanitizeNumber(ratios.pegRatioTTM),
    priceToCashFlow: sanitizeNumber(priceToCashFlow),
    revenueGrowth3Y: sanitizeNumber(revenueGrowth3Y),
    epsGrowth3Y: sanitizeNumber(epsGrowth3Y),
    operatingMargin: sanitizeNumber(
      ratios.operatingProfitMarginTTM
        ? ratios.operatingProfitMarginTTM * 100
        : null
    ),
    netMargin: sanitizeNumber(
      ratios.netProfitMarginTTM ? ratios.netProfitMarginTTM * 100 : null
    ),
    debtToEquity: sanitizeNumber(ratios.debtEquityRatioTTM),
    freeCashFlow,
    fcfYield: sanitizeNumber(fcfYield),
  };
}

/** Converts weird API values (Infinity, -Infinity, NaN) to null */
function sanitizeNumber(val: number | null | undefined): number | null {
  if (val === null || val === undefined) return null;
  if (!isFinite(val)) return null;
  return val;
}
