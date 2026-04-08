"use client";

import { fetchHistoricalRatios } from "@/lib/api-client";
import { HistoricalRatio } from "@/lib/types";
import useSWR from "swr";

/**
 * Fetches 5-year historical ratios for selected tickers.
 * Only fetches when enabled (i.e., when a metric row is expanded).
 */
export function useMetricHistory(tickers: string[], enabled: boolean) {
  const { data, isLoading } = useSWR<Record<string, HistoricalRatio[]>>(
    enabled && tickers.length > 0
      ? `metric-history-${[...tickers].sort().join(",")}`
      : null,
    async () => {
      const results = await Promise.allSettled(
        tickers.map((t) => fetchHistoricalRatios(t))
      );
      const ratios: Record<string, HistoricalRatio[]> = {};
      results.forEach((r, i) => {
        if (r.status === "fulfilled") ratios[tickers[i]] = r.value;
      });
      return ratios;
    },
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  return {
    ratios: data || {},
    isLoading,
  };
}
