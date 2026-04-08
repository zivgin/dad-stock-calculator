/**
 * Client-side data fetchers.
 * Calls FMP directly from the browser (free plan blocks cloud IPs).
 */

import { PricePoint, StockData, StockSearchResult } from "./types";
import { searchCompanies, getFullStockData, getHistoricalPrices } from "./fmp-client";
import { demoSearch, demoGetStock, isDemoMode } from "./demo-data";

export async function fetchSearchResults(
  query: string
): Promise<StockSearchResult[]> {
  if (isDemoMode()) return demoSearch(query);
  return searchCompanies(query);
}

export async function fetchStockData(ticker: string): Promise<StockData> {
  if (isDemoMode()) {
    const data = demoGetStock(ticker);
    if (!data) throw new Error(`No demo data for ${ticker}`);
    return data;
  }
  return getFullStockData(ticker);
}

export async function fetchHistoricalPrices(
  ticker: string,
  fromDate: string
): Promise<PricePoint[]> {
  if (isDemoMode()) return [];
  return getHistoricalPrices(ticker, fromDate);
}
