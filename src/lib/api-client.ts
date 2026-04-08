/**
 * Client-side API fetchers used by SWR hooks.
 * These call our Next.js API routes (which proxy to FMP).
 */

import { StockData, StockSearchResult } from "./types";

export async function fetchSearchResults(
  query: string
): Promise<StockSearchResult[]> {
  const res = await fetch(
    `/api/stocks/search?q=${encodeURIComponent(query)}`
  );
  if (!res.ok) throw new Error("Search failed");
  return res.json();
}

export async function fetchStockData(ticker: string): Promise<StockData> {
  const res = await fetch(`/api/stocks/${encodeURIComponent(ticker)}`);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || `Failed to fetch data for ${ticker}`);
  }
  return res.json();
}
