/**
 * Server-side Financial Modeling Prep API client.
 * Uses the /stable/ endpoints (new API as of 2025).
 * Swap this file to change data providers.
 */

import { StockData, StockSearchResult } from "./types";

const BASE_URL = "https://financialmodelingprep.com/stable";

function apiKey(): string {
  // NEXT_PUBLIC_ prefix makes this available client-side.
  // FMP free keys are account-bound and rate-limited, not secret.
  const key = process.env.NEXT_PUBLIC_FMP_API_KEY || process.env.FMP_API_KEY;
  if (!key) throw new Error("FMP API key is not configured");
  return key;
}

async function fmpFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const searchParams = new URLSearchParams({ ...params, apikey: apiKey() });
  const url = `${BASE_URL}${path}?${searchParams.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`FMP API error: ${res.status} - ${body}`);
  }
  return res.json();
}

// --- Raw FMP response types (only what we use) ---

interface FMPSearchResult {
  symbol: string;
  name: string;
  currency: string;
  exchangeFullName: string;
  exchange: string;
}

interface FMPProfile {
  symbol: string;
  companyName: string;
  price: number;
  marketCap: number;
  range: string; // "169.21-288.62"
}

interface FMPRatiosTTM {
  operatingProfitMarginTTM: number | null;
  netProfitMarginTTM: number | null;
  debtToEquityRatioTTM: number | null;
  priceToOperatingCashFlowRatioTTM: number | null;
  freeCashFlowPerShareTTM: number | null;
}

interface FMPKeyMetricsTTM {
  freeCashFlowYieldTTM: number | null;
  earningsYieldTTM: number | null;
  freeCashFlowToFirmTTM: number | null;
  freeCashFlowToEquityTTM: number | null;
}

interface FMPIncomeStatement {
  date: string;
  revenue: number;
  epsDiluted: number | null;
  eps: number | null;
}

// --- Public functions ---

export async function searchCompanies(
  query: string
): Promise<StockSearchResult[]> {
  const isUSExchange = (r: FMPSearchResult) =>
    r.exchange === "NASDAQ" ||
    r.exchange === "NYSE" ||
    r.exchange === "AMEX" ||
    r.exchangeFullName?.includes("NASDAQ") ||
    r.exchangeFullName?.includes("NYSE");

  const toResult = (r: FMPSearchResult): StockSearchResult => ({
    symbol: r.symbol,
    name: r.name,
    currency: r.currency || "USD",
    exchangeShortName: r.exchange || "NASDAQ",
  });

  // Search by name
  const nameResults = await fmpFetch<FMPSearchResult[]>("/search-name", {
    query: query,
  });
  const filtered = nameResults.filter(isUSExchange).slice(0, 8).map(toResult);

  // If query looks like a ticker (1-5 alpha chars), also try a direct profile lookup
  // to catch exact ticker matches that search-name misses
  const looksLikeTicker = /^[A-Za-z]{1,5}$/.test(query.trim());
  if (looksLikeTicker) {
    const upperQuery = query.trim().toUpperCase();
    const alreadyIncluded = filtered.some((r) => r.symbol === upperQuery);
    if (!alreadyIncluded) {
      try {
        const profiles = await fmpFetch<FMPProfile[]>("/profile", {
          symbol: upperQuery,
        });
        if (profiles.length > 0) {
          const p = profiles[0];
          filtered.unshift({
            symbol: p.symbol,
            name: p.companyName,
            currency: "USD",
            exchangeShortName: "NASDAQ",
          });
          // Keep max 8
          if (filtered.length > 8) filtered.pop();
        }
      } catch {
        // Profile lookup failed — just use name results
      }
    }
  }

  return filtered;
}

export async function getFullStockData(ticker: string): Promise<StockData> {
  const upperTicker = ticker.toUpperCase();

  // Fetch all endpoints in parallel
  const [profiles, ratiosArr, metricsArr, incomeStatements] = await Promise.all([
    fmpFetch<FMPProfile[]>("/profile", { symbol: upperTicker }),
    fmpFetch<FMPRatiosTTM[]>("/ratios-ttm", { symbol: upperTicker }),
    fmpFetch<FMPKeyMetricsTTM[]>("/key-metrics-ttm", { symbol: upperTicker }),
    fmpFetch<FMPIncomeStatement[]>("/income-statement", { symbol: upperTicker, limit: "4" }),
  ]);

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

    const newestEPS = newest.epsDiluted ?? newest.eps;
    const oldestEPS = oldest.epsDiluted ?? oldest.eps;
    if (newestEPS && oldestEPS && oldestEPS > 0 && newestEPS > 0) {
      epsGrowth3Y =
        (Math.pow(newestEPS / oldestEPS, 1 / 3) - 1) * 100;
    }
  }

  // Get the latest EPS for P/E calculation
  const latestEPS = incomeStatements[0]?.epsDiluted ?? incomeStatements[0]?.eps ?? null;

  // Compute P/E from price and EPS
  const peRatio = latestEPS && latestEPS > 0 ? profile.price / latestEPS : null;

  // Compute PEG from P/E and EPS growth
  const pegRatio = peRatio && epsGrowth3Y && epsGrowth3Y > 0 ? peRatio / epsGrowth3Y : null;

  // FCF: use freeCashFlowToFirmTTM from key metrics, or derive from per-share
  const freeCashFlow = metrics.freeCashFlowToFirmTTM ?? metrics.freeCashFlowToEquityTTM ?? 0;

  // FCF yield from key metrics (already a decimal like 0.033)
  const fcfYieldRaw = metrics.freeCashFlowYieldTTM;
  const fcfYield = fcfYieldRaw !== null && fcfYieldRaw !== undefined ? fcfYieldRaw * 100 : null;

  return {
    ticker: upperTicker,
    name: profile.companyName,
    price: profile.price,
    marketCap: profile.marketCap,
    week52High,
    priceToWeek52High: week52High > 0 ? (profile.price / week52High) * 100 : 0,
    peRatio: sanitizeNumber(peRatio),
    pegRatio: sanitizeNumber(pegRatio),
    priceToCashFlow: sanitizeNumber(ratios.priceToOperatingCashFlowRatioTTM),
    revenueGrowth3Y: sanitizeNumber(revenueGrowth3Y),
    epsGrowth3Y: sanitizeNumber(epsGrowth3Y),
    operatingMargin: sanitizeNumber(
      ratios.operatingProfitMarginTTM !== null && ratios.operatingProfitMarginTTM !== undefined
        ? ratios.operatingProfitMarginTTM * 100
        : null
    ),
    netMargin: sanitizeNumber(
      ratios.netProfitMarginTTM !== null && ratios.netProfitMarginTTM !== undefined
        ? ratios.netProfitMarginTTM * 100
        : null
    ),
    debtToEquity: sanitizeNumber(ratios.debtToEquityRatioTTM),
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
