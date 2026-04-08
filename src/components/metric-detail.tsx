"use client";

import { MetricDefinition, ScoredStock, MetricColor, HistoricalRatio, StockProfile } from "@/lib/types";
import { CHART_COLORS } from "@/lib/constants";
import { getIndustryAverage, METRIC_TO_INDUSTRY_KEY } from "@/lib/industry-averages";
import { formatMetricValue, cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  ResponsiveContainer,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from "recharts";
import { Building2, TrendingUp, TrendingDown, Minus } from "lucide-react";

const COLOR_MAP: Record<MetricColor, string> = {
  green: "#10b981",
  orange: "#f59e0b",
  red: "#ef4444",
};

// Map metric keys to HistoricalRatio fields
const METRIC_TO_HISTORY_KEY: Record<string, keyof HistoricalRatio> = {
  peRatio: "peRatio",
  pegRatio: "pegRatio",
  priceToCashFlow: "priceToCashFlow",
  operatingMargin: "operatingMargin",
  netMargin: "netMargin",
  debtToEquity: "debtToEquity",
};

interface MetricDetailProps {
  metric: MetricDefinition;
  stocks: ScoredStock[];
  isOpen: boolean;
  historicalRatios?: Record<string, HistoricalRatio[]>;
  profiles?: Record<string, StockProfile>;
}

export function MetricDetail({
  metric,
  stocks,
  isOpen,
  historicalRatios,
  profiles,
}: MetricDetailProps) {
  if (!isOpen || stocks.length === 0) return null;

  const historyKey = METRIC_TO_HISTORY_KEY[metric.key];
  const industryKey = METRIC_TO_INDUSTRY_KEY[metric.key];
  const hasHistory = historyKey && historicalRatios && Object.keys(historicalRatios).length > 0;

  // Industry average
  let industryAvg: { avg: number; label: string } | null = null;
  if (industryKey && profiles) {
    for (const stock of stocks) {
      const profile = profiles[stock.ticker];
      if (profile) {
        const avg = getIndustryAverage(profile.industry, profile.sector);
        if (avg && avg[industryKey] !== undefined) {
          industryAvg = { avg: avg[industryKey], label: profile.industry || profile.sector };
          break;
        }
      }
    }
  }

  // Historical chart data
  let historyChartData: Record<string, string | number | null>[] = [];
  let trendChanges: Record<string, { from: number; to: number; pct: number }> = {};
  if (hasHistory) {
    const allYears = new Set<string>();
    Object.values(historicalRatios!).forEach((ratios) =>
      ratios.forEach((r) => allYears.add(r.year))
    );
    const sortedYears = Array.from(allYears).sort();

    historyChartData = sortedYears.map((year) => {
      const row: Record<string, string | number | null> = { year };
      for (const [ticker, ratios] of Object.entries(historicalRatios!)) {
        const match = ratios.find((r) => r.year === year);
        row[ticker] = match ? (match[historyKey] as number | null) : null;
      }
      return row;
    });

    // Calculate trend from first to last year
    for (const [ticker, ratios] of Object.entries(historicalRatios!)) {
      const values = ratios
        .map((r) => r[historyKey] as number | null)
        .filter((v): v is number => v !== null);
      if (values.length >= 2) {
        const from = values[0];
        const to = values[values.length - 1];
        trendChanges[ticker] = { from, to, pct: ((to - from) / Math.abs(from)) * 100 };
      }
    }
  }

  // Bar data for multi-stock comparison
  const barData = stocks
    .map((stock) => {
      const value = stock[metric.key] as number | null;
      const color = stock.metricColors[metric.key] || "orange";
      return {
        ticker: stock.ticker,
        value: value ?? 0,
        displayValue: formatMetricValue(value, metric.format),
        color: COLOR_MAP[color],
        score: stock.metricScores[metric.key] ?? 50,
      };
    })
    .sort((a, b) => (metric.higherIsBetter ? b.value - a.value : a.value - b.value));

  const showBarChart = stocks.length >= 2;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        <div className="px-4 py-4 bg-zinc-50/50 border-t space-y-5">

          {/* === Context row: description + industry avg === */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6">
            <p className="text-xs text-zinc-500 flex-1">{metric.description}</p>
            {industryAvg && (
              <div className="flex items-center gap-1.5 text-xs shrink-0 bg-blue-50 text-blue-700 px-2.5 py-1.5 rounded-lg">
                <Building2 className="w-3.5 h-3.5" />
                <span>{industryAvg.label} avg:</span>
                <span className="font-bold">
                  {formatMetricValue(industryAvg.avg, metric.format)}
                </span>
              </div>
            )}
          </div>

          {/* === Historical Trend Chart === */}
          {hasHistory && historyChartData.length > 1 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-zinc-700">
                  5-Year Trend
                </span>
                {/* Trend summary badges */}
                <div className="flex gap-2">
                  {stocks.map((stock, i) => {
                    const trend = trendChanges[stock.ticker];
                    if (!trend) return null;
                    const isGood = metric.higherIsBetter
                      ? trend.pct > 0
                      : trend.pct < 0;
                    const isBad = metric.higherIsBetter
                      ? trend.pct < -5
                      : trend.pct > 5;
                    return (
                      <span
                        key={stock.ticker}
                        className={cn(
                          "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
                          isGood
                            ? "bg-emerald-50 text-emerald-700"
                            : isBad
                              ? "bg-red-50 text-red-700"
                              : "bg-zinc-100 text-zinc-600"
                        )}
                      >
                        {isGood ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : isBad ? (
                          <TrendingDown className="w-3 h-3" />
                        ) : (
                          <Minus className="w-3 h-3" />
                        )}
                        {stock.ticker}{" "}
                        {trend.pct > 0 ? "+" : ""}
                        {trend.pct.toFixed(0)}%
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-lg border p-3" style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={historyChartData}>
                    <defs>
                      {stocks.map((stock, i) => (
                        <linearGradient
                          key={stock.ticker}
                          id={`grad-${metric.key}-${stock.ticker}`}
                          x1="0" y1="0" x2="0" y2="1"
                        >
                          <stop offset="0%" stopColor={CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0.15} />
                          <stop offset="100%" stopColor={CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
                    <XAxis
                      dataKey="year"
                      tick={{ fontSize: 11, fill: "#71717a" }}
                      tickLine={false}
                      axisLine={{ stroke: "#e4e4e7" }}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#a1a1aa" }}
                      tickLine={false}
                      axisLine={false}
                      width={45}
                      tickFormatter={(v) =>
                        metric.format === "percent" ? `${v}%` : String(Math.round(v * 100) / 100)
                      }
                    />
                    {/* Industry average — the key reference */}
                    {industryAvg && (
                      <ReferenceLine
                        y={industryAvg.avg}
                        stroke="#3b82f6"
                        strokeDasharray="8 4"
                        strokeWidth={2}
                        label={{
                          value: `Ind. avg: ${formatMetricValue(industryAvg.avg, metric.format)}`,
                          position: "insideTopRight",
                          fill: "#3b82f6",
                          fontSize: 10,
                          fontWeight: 600,
                        }}
                      />
                    )}
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        return (
                          <div className="bg-white border rounded-lg shadow-lg px-3 py-2 text-xs">
                            <div className="font-medium text-zinc-600 mb-1.5">FY {label}</div>
                            {payload.map((entry) => (
                              <div key={entry.name} className="flex items-center gap-2 mb-0.5">
                                <span
                                  className="w-2 h-2 rounded-full shrink-0"
                                  style={{ backgroundColor: entry.stroke || entry.color }}
                                />
                                <span className="text-zinc-600">{entry.name}</span>
                                <span className="font-bold text-zinc-900 ml-auto">
                                  {formatMetricValue(entry.value as number, metric.format)}
                                </span>
                              </div>
                            ))}
                            {industryAvg && (
                              <div className="flex items-center gap-2 text-blue-600 mt-1.5 pt-1.5 border-t">
                                <Building2 className="w-2.5 h-2.5 shrink-0" />
                                <span>Industry avg</span>
                                <span className="font-bold ml-auto">
                                  {formatMetricValue(industryAvg.avg, metric.format)}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      }}
                    />
                    {stocks.map((stock, i) => (
                      <Area
                        key={stock.ticker}
                        type="monotone"
                        dataKey={stock.ticker}
                        stroke={CHART_COLORS[i % CHART_COLORS.length]}
                        fill={`url(#grad-${metric.key}-${stock.ticker})`}
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: "#fff", stroke: CHART_COLORS[i % CHART_COLORS.length], strokeWidth: 2 }}
                        connectNulls
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* === Multi-stock bar comparison (only when 2+ stocks) === */}
          {showBarChart && (
            <div>
              <span className="text-xs font-semibold text-zinc-700 mb-2 block">
                Side-by-Side
              </span>
              <div className="bg-white rounded-lg border p-3" style={{ height: Math.max(90, barData.length * 44) }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={barData}
                    layout="vertical"
                    margin={{ left: 0, right: 10, top: 0, bottom: 0 }}
                  >
                    <XAxis
                      type="number"
                      tick={{ fontSize: 10, fill: "#a1a1aa" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="ticker"
                      tick={{ fontSize: 12, fill: "#3f3f46", fontWeight: 600 }}
                      axisLine={false}
                      tickLine={false}
                      width={50}
                    />
                    {industryAvg && (
                      <ReferenceLine
                        x={industryAvg.avg}
                        stroke="#3b82f6"
                        strokeDasharray="6 3"
                        strokeWidth={1.5}
                      />
                    )}
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0].payload;
                        return (
                          <div className="bg-white border rounded-lg shadow-lg px-3 py-2 text-xs">
                            <div className="font-semibold">{d.ticker}: {d.displayValue}</div>
                            <div className="text-zinc-500">Score: {d.score}/100</div>
                          </div>
                        );
                      }}
                    />
                    <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={22}>
                      {barData.map((entry) => (
                        <Cell key={entry.ticker} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* === Score summary === */}
          <div className="space-y-1.5">
            {barData.map((d) => (
              <div key={d.ticker} className="flex items-center gap-2">
                <span className="text-xs font-semibold text-zinc-700 w-12">
                  {d.ticker}
                </span>
                <div className="flex-1 flex items-center gap-2">
                  <div className="flex-1 bg-zinc-100 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${d.score}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: d.color }}
                    />
                  </div>
                  <span className="text-xs font-bold w-16 text-right" style={{ color: d.color }}>
                    {d.displayValue}
                  </span>
                  <span className="text-[10px] text-zinc-400 w-8 text-right">
                    {Math.round(d.score)}/100
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
