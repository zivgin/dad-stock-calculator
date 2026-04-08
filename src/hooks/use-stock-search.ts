"use client";

import { fetchSearchResults } from "@/lib/api-client";
import { StockSearchResult } from "@/lib/types";
import { useEffect, useState } from "react";
import useSWR from "swr";

export function useStockSearch(query: string) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data, error, isLoading } = useSWR<StockSearchResult[]>(
    debouncedQuery.length >= 1
      ? `search-${debouncedQuery}`
      : null,
    () => fetchSearchResults(debouncedQuery),
    { revalidateOnFocus: false, dedupingInterval: 5000 }
  );

  return {
    results: data || [],
    isLoading: isLoading && debouncedQuery.length >= 1,
    error,
  };
}
