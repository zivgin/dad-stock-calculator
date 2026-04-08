"use client";

import { fetchHistoricalPrices } from "@/lib/api-client";
import { PricePoint, TimeRange } from "@/lib/types";
import { subMonths, subYears, format } from "date-fns";
import useSWR from "swr";

function getFromDate(range: TimeRange): string {
  const now = new Date();
  switch (range) {
    case "1M": return format(subMonths(now, 1), "yyyy-MM-dd");
    case "3M": return format(subMonths(now, 3), "yyyy-MM-dd");
    case "1Y": return format(subYears(now, 1), "yyyy-MM-dd");
    case "3Y": return format(subYears(now, 3), "yyyy-MM-dd");
  }
}

export function useHistoricalPrices(tickers: string[], range: TimeRange) {
  const fromDate = getFromDate(range);

  const { data, isLoading, error } = useSWR<Record<string, PricePoint[]>>(
    tickers.length > 0 ? `history-${[...tickers].sort().join(",")}-${range}` : null,
    async () => {
      const results = await Promise.allSettled(
        tickers.map((t) => fetchHistoricalPrices(t, fromDate))
      );
      const map: Record<string, PricePoint[]> = {};
      results.forEach((result, i) => {
        if (result.status === "fulfilled") {
          map[tickers[i]] = result.value;
        }
      });
      return map;
    },
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  return { priceHistory: data || {}, isLoading, error };
}
