"use client";

import { fetchStockData } from "@/lib/api-client";
import { StockData } from "@/lib/types";
import useSWR from "swr";

export function useStockData(tickers: string[]) {
  // Use individual SWR hooks per ticker via a wrapper component pattern.
  // Instead, we use a single SWR call with all tickers as key.
  const { data, error, isLoading } = useSWR<Record<string, StockData>>(
    tickers.length > 0 ? `stocks-${tickers.sort().join(",")}` : null,
    async () => {
      const results = await Promise.allSettled(
        tickers.map((t) => fetchStockData(t))
      );
      const map: Record<string, StockData> = {};
      results.forEach((result, i) => {
        if (result.status === "fulfilled") {
          map[tickers[i]] = result.value;
        }
      });
      return map;
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
      keepPreviousData: true,
    }
  );

  return {
    stocks: data || {},
    isLoading,
    error,
    loadedCount: data ? Object.keys(data).length : 0,
  };
}
