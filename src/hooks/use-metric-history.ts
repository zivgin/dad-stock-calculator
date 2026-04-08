"use client";

import { fetchHistoricalRatios, fetchStockProfile } from "@/lib/api-client";
import { HistoricalRatio, StockProfile } from "@/lib/types";
import useSWR from "swr";

interface MetricHistoryData {
  ratios: Record<string, HistoricalRatio[]>;
  profiles: Record<string, StockProfile>;
}

export function useMetricHistory(tickers: string[]) {
  const { data, isLoading } = useSWR<MetricHistoryData>(
    tickers.length > 0 ? `metric-history-${tickers.sort().join(",")}` : null,
    async () => {
      const [ratioResults, profileResults] = await Promise.all([
        Promise.allSettled(tickers.map((t) => fetchHistoricalRatios(t))),
        Promise.allSettled(tickers.map((t) => fetchStockProfile(t))),
      ]);

      const ratios: Record<string, HistoricalRatio[]> = {};
      ratioResults.forEach((r, i) => {
        if (r.status === "fulfilled") ratios[tickers[i]] = r.value;
      });

      const profiles: Record<string, StockProfile> = {};
      profileResults.forEach((r, i) => {
        if (r.status === "fulfilled") profiles[tickers[i]] = r.value;
      });

      return { ratios, profiles };
    },
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  return {
    ratios: data?.ratios || {},
    profiles: data?.profiles || {},
    isLoading,
  };
}
