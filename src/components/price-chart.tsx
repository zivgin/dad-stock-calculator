"use client";

import { TimeRange } from "@/lib/types";
import { CHART_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useHistoricalPrices } from "@/hooks/use-historical-prices";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { format, parseISO } from "date-fns";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const TIME_RANGES: { label: string; value: TimeRange }[] = [
  { label: "1M", value: "1M" },
  { label: "3M", value: "3M" },
  { label: "1Y", value: "1Y" },
  { label: "3Y", value: "3Y" },
];

interface PriceChartProps {
  tickers: string[];
}

export function PriceChart({ tickers }: PriceChartProps) {
  const [range, setRange] = useState<TimeRange>("1Y");
  const { priceHistory, isLoading } = useHistoricalPrices(tickers, range);

  // Normalize prices to % change from start for comparison
  const { chartData, trendInfo } = useMemo(() => {
    if (Object.keys(priceHistory).length === 0) return { chartData: [], trendInfo: {} };

    // Find all unique dates across all tickers
    const allDates = new Set<string>();
    Object.values(priceHistory).forEach((points) =>
      points.forEach((p) => allDates.add(p.date))
    );
    const sortedDates = Array.from(allDates).sort();

    // Get first price for each ticker (for normalization)
    const firstPrices: Record<string, number> = {};
    for (const [ticker, points] of Object.entries(priceHistory)) {
      if (points.length > 0) firstPrices[ticker] = points[0].close;
    }

    // Pre-index prices by date for O(1) lookup instead of O(n) find()
    const indexedByDate: Record<string, Map<string, number>> = {};
    for (const [ticker, points] of Object.entries(priceHistory)) {
      indexedByDate[ticker] = new Map(points.map((p) => [p.date, p.close]));
    }

    // Build chart data: each row = { date, AAPL: %change, MSFT: %change, ... }
    const data = sortedDates.map((date) => {
      const row: Record<string, string | number> = { date };
      for (const [ticker] of Object.entries(priceHistory)) {
        const close = indexedByDate[ticker]?.get(date);
        if (close !== undefined && firstPrices[ticker]) {
          row[ticker] = parseFloat(
            (((close - firstPrices[ticker]) / firstPrices[ticker]) * 100).toFixed(2)
          );
        }
      }
      return row;
    });

    // Calculate trend info (overall % change)
    const trends: Record<string, { change: number; direction: "up" | "down" | "flat" }> = {};
    for (const [ticker, points] of Object.entries(priceHistory)) {
      if (points.length >= 2) {
        const first = points[0].close;
        const last = points[points.length - 1].close;
        const change = ((last - first) / first) * 100;
        trends[ticker] = {
          change,
          direction: change > 1 ? "up" : change < -1 ? "down" : "flat",
        };
      }
    }

    return { chartData: data, trendInfo: trends };
  }, [priceHistory]);

  const isMobile = useIsMobile();

  if (tickers.length === 0) return null;

  const formatDate = (dateStr: string) => {
    try {
      const d = parseISO(dateStr);
      return range === "1M" || range === "3M"
        ? format(d, "MMM d")
        : format(d, "MMM yyyy");
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      {/* Header with range toggle */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h3 className="font-semibold text-zinc-800 text-sm">
          Price Performance
        </h3>
        <div className="flex gap-1 bg-zinc-100 rounded-lg p-0.5">
          {TIME_RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-medium transition-all",
                range === r.value
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Trend badges */}
      {Object.keys(trendInfo).length > 0 && (
        <div className="flex flex-wrap gap-3 px-4 pt-3">
          {tickers.map((ticker, i) => {
            const trend = trendInfo[ticker];
            if (!trend) return null;
            return (
              <div
                key={ticker}
                className="flex items-center gap-1.5 text-sm"
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                />
                <span className="font-medium text-zinc-700">{ticker}</span>
                <span
                  className={cn(
                    "flex items-center gap-0.5 font-semibold text-xs",
                    trend.direction === "up"
                      ? "text-emerald-600"
                      : trend.direction === "down"
                        ? "text-red-600"
                        : "text-zinc-500"
                  )}
                >
                  {trend.direction === "up" ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : trend.direction === "down" ? (
                    <TrendingDown className="w-3 h-3" />
                  ) : (
                    <Minus className="w-3 h-3" />
                  )}
                  {trend.change > 0 ? "+" : ""}
                  {trend.change.toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Chart */}
      <div className="px-2 pb-3 pt-2">
        {isLoading ? (
          <div className="h-[250px] md:h-[300px] flex items-center justify-center">
            <Skeleton className="w-full h-full rounded-lg" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-[250px] md:h-[300px] flex items-center justify-center text-sm text-zinc-400">
            No price history available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
            <LineChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f4f4f5"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fontSize: 11, fill: "#a1a1aa" }}
                tickLine={false}
                axisLine={{ stroke: "#e4e4e7" }}
                minTickGap={40}
              />
              <YAxis
                tickFormatter={(v) => `${v > 0 ? "+" : ""}${v}%`}
                tick={{ fontSize: 11, fill: "#a1a1aa" }}
                tickLine={false}
                axisLine={false}
                width={50}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="bg-white border rounded-lg shadow-lg px-3 py-2 text-xs">
                      <div className="text-zinc-500 mb-1">{formatDate(String(label))}</div>
                      {payload.map((entry, i) => (
                        <div
                          key={entry.name}
                          className="flex items-center gap-2"
                        >
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: entry.color }}
                          />
                          <span className="font-medium">{entry.name}</span>
                          <span
                            className={cn(
                              "font-semibold ml-auto",
                              (entry.value as number) >= 0
                                ? "text-emerald-600"
                                : "text-red-600"
                            )}
                          >
                            {(entry.value as number) > 0 ? "+" : ""}
                            {(entry.value as number).toFixed(1)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                }}
              />
              {tickers.map((ticker, i) => (
                <Line
                  key={ticker}
                  type="monotone"
                  dataKey={ticker}
                  stroke={CHART_COLORS[i % CHART_COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
