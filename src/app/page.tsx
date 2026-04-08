"use client";

import { useState, useCallback, useMemo } from "react";
import { StockSearch } from "@/components/stock-search";
import { SelectedChips } from "@/components/selected-chips";
import { ComparisonTable } from "@/components/comparison-table";
import { ComparisonCards } from "@/components/comparison-cards";
import { PriceChart } from "@/components/price-chart";
import { StockRadarChart } from "@/components/radar-chart";
import { RankingSection } from "@/components/ranking-section";
import { EmptyState } from "@/components/empty-state";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { ErrorMessage } from "@/components/error-message";
import { useStockData } from "@/hooks/use-stock-data";
import { useMetricHistory } from "@/hooks/use-metric-history";
import { scoreStock, rankStocks } from "@/lib/scoring";
import { MAX_SELECTIONS } from "@/lib/constants";

export default function Home() {
  const [selected, setSelected] = useState<
    { ticker: string; name: string }[]
  >([]);

  const tickers = useMemo(() => selected.map((s) => s.ticker), [selected]);
  const { stocks, isLoading, error } = useStockData(tickers);
  const [metricExpanded, setMetricExpanded] = useState(false);
  const { ratios: historicalRatios } = useMetricHistory(tickers, metricExpanded);

  // Derive profiles from stock data (sector/industry already in StockData)
  const profiles = useMemo(() => {
    const map: Record<string, { sector: string; industry: string }> = {};
    for (const [ticker, data] of Object.entries(stocks)) {
      map[ticker] = { sector: data.sector, industry: data.industry };
    }
    return map;
  }, [stocks]);

  const scoredStocks = useMemo(() => {
    const scored = Object.values(stocks).map(scoreStock);
    return rankStocks(scored);
  }, [stocks]);

  const handleSelect = useCallback(
    (ticker: string, name: string) => {
      if (
        selected.length >= MAX_SELECTIONS ||
        selected.some((s) => s.ticker === ticker)
      )
        return;
      setSelected((prev) => [...prev, { ticker, name }]);
    },
    [selected]
  );

  const handleRemove = useCallback((ticker: string) => {
    setSelected((prev) => prev.filter((s) => s.ticker !== ticker));
  }, []);

  const hasData = scoredStocks.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white">
      {/* Header */}
      <header className="pt-8 pb-6 px-4 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 tracking-tight">
          shay<span className="text-emerald-600">stock</span>
        </h1>
        <p className="text-zinc-500 mt-1.5 text-sm md:text-base">
          Compare stocks side-by-side with instant scoring
        </p>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 pb-12 space-y-6">
        {/* Search */}
        <StockSearch
          selectedTickers={tickers}
          onSelect={handleSelect}
        />

        {/* Selected chips */}
        <SelectedChips tickers={selected} onRemove={handleRemove} />

        {/* Content area */}
        {error && !hasData ? (
          <ErrorMessage
            message="Failed to load stock data. Please try again."
            onRetry={() => window.location.reload()}
          />
        ) : isLoading && !hasData ? (
          <LoadingSkeleton />
        ) : selected.length === 0 ? (
          <EmptyState onQuickPick={handleSelect} />
        ) : (
          <>
            {isLoading && (
              <div className="text-center text-sm text-zinc-400 animate-pulse">
                Updating data...
              </div>
            )}

            {/* Radar chart — strength profile */}
            {scoredStocks.length >= 1 && (
              <StockRadarChart stocks={scoredStocks} />
            )}

            {/* Price chart */}
            <PriceChart tickers={tickers} />

            {/* Comparison views */}
            <ComparisonTable
              stocks={scoredStocks}
              historicalRatios={historicalRatios}
              profiles={profiles}
              onMetricExpand={() => setMetricExpanded(true)}
            />
            <ComparisonCards
              stocks={scoredStocks}
              historicalRatios={historicalRatios}
              profiles={profiles}
              onMetricExpand={() => setMetricExpanded(true)}
            />

            {/* Ranking */}
            <RankingSection stocks={scoredStocks} />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center pb-8 px-4 text-xs text-zinc-400 space-y-1">
        <p>
          Data from{" "}
          <a
            href="https://financialmodelingprep.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-zinc-600 transition-colors"
          >
            Financial Modeling Prep
          </a>
        </p>
      </footer>
    </div>
  );
}
