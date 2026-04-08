"use client";

import { fetchStockData } from "@/lib/api-client";
import { StockData } from "@/lib/types";
import useSWR from "swr";
import { useRef, useMemo } from "react";

/**
 * Fetches stock data for multiple tickers with per-ticker caching.
 * Adding a new ticker doesn't re-fetch existing ones.
 */
export function useStockData(tickers: string[]) {
  // Keep a cache of previously loaded stocks so adding a new one
  // doesn't flash a loading state for already-loaded stocks
  const cacheRef = useRef<Record<string, StockData>>({});

  // SWR for batch fetching — only fetches tickers not yet in cache
  const { data, error, isLoading, mutate } = useSWR<Record<string, StockData>>(
    tickers.length > 0 ? `stocks-${tickers.sort().join(",")}` : null,
    async () => {
      const uncached = tickers.filter((t) => !cacheRef.current[t]);
      const cached = tickers.filter((t) => cacheRef.current[t]);

      // Start with cached data
      const result: Record<string, StockData> = {};
      for (const t of cached) {
        result[t] = cacheRef.current[t];
      }

      // Fetch uncached in parallel
      if (uncached.length > 0) {
        const fetched = await Promise.allSettled(
          uncached.map((t) => fetchStockData(t))
        );
        fetched.forEach((r, i) => {
          if (r.status === "fulfilled") {
            result[uncached[i]] = r.value;
            cacheRef.current[uncached[i]] = r.value;
          }
        });
      }

      return result;
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
      keepPreviousData: true,
    }
  );

  // Merge SWR data with cache for immediate display
  const stocks = useMemo(() => {
    const merged: Record<string, StockData> = {};
    for (const t of tickers) {
      if (data?.[t]) merged[t] = data[t];
      else if (cacheRef.current[t]) merged[t] = cacheRef.current[t];
    }
    return merged;
  }, [data, tickers]);

  // Only show loading if we have tickers with no data at all
  const hasAllData = tickers.every((t) => stocks[t]);

  return {
    stocks,
    isLoading: isLoading && !hasAllData,
    error,
    loadedCount: Object.keys(stocks).length,
  };
}
