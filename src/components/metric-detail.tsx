"use client";

import { MetricDefinition, ScoredStock, MetricColor, HistoricalRatio, StockProfile } from "@/lib/types";
import { getIndustryAverage, METRIC_TO_INDUSTRY_KEY } from "@/lib/industry-averages";
import { formatMetricValue, cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  ResponsiveContainer,
  Tooltip,
  ReferenceLine,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";
import { Building2 } from "lucide-react";

const COLOR_MAP: Record<MetricColor, string> = {
  green: "#10b981",
  orange: "#f59e0b",
  red: "#ef4444",
};

const LINE_COLORS = ["#3b82f6", "#8b5cf6", "#f59e0b", "#10b981", "#f43f5e"];

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

  // Build bar chart data
  const barData = stocks.map((stock) => {
    const value = stock[metric.key] as number | null;
    const color = stock.metricColors[metric.key] || "orange";
    return {
      ticker: stock.ticker,
      value: value ?? 0,
      displayValue: formatMetricValue(value, metric.format),
      color: COLOR_MAP[color],
      score: stock.metricScores[metric.key] ?? 50,
    };
  });

  const sorted = [...barData].sort((a, b) =>
    metric.higherIsBetter ? b.value - a.value : a.value - b.value
  );

  // Build historical line chart data
  let historyChartData: Record<string, string | number | null>[] = [];
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
  }

  // Get industry averages for each stock
  const industryAvgs: { ticker: string; avg: number; label: string }[] = [];
  if (industryKey && profiles) {
    for (const stock of stocks) {
      const profile = profiles[stock.ticker];
      if (profile) {
        const avg = getIndustryAverage(profile.industry, profile.sector);
        if (avg && avg[industryKey] !== undefined) {
          industryAvgs.push({
            ticker: stock.ticker,
            avg: avg[industryKey],
            label: profile.industry || profile.sector || "Industry",
          });
        }
      }
    }
  }

  // Unique industry avg (if all stocks share one)
  const uniqueIndustryAvg = industryAvgs.length > 0 ? industryAvgs[0] : null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        <div className="px-4 py-3 bg-zinc-50/50 border-t space-y-4">
          {/* Description */}
          <p className="text-xs text-zinc-500">{metric.description}</p>

          {/* Threshold legend + industry avg */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Good: {metric.higherIsBetter ? "\u2265" : "\u2264"}{" "}
              {formatMetricValue(metric.greenThreshold, metric.format)}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              Weak: {metric.higherIsBetter ? "\u2264" : "\u2265"}{" "}
              {formatMetricValue(metric.redThreshold, metric.format)}
            </span>
            {uniqueIndustryAvg && (
              <span className="flex items-center gap-1 text-blue-600">
                <Building2 className="w-3 h-3" />
                {uniqueIndustryAvg.label} avg:{" "}
                {formatMetricValue(uniqueIndustryAvg.avg, metric.format)}
              </span>
            )}
          </div>

          {/* === Historical Line Chart === */}
          {hasHistory && historyChartData.length > 1 && (
            <div>
              <div className="text-xs font-medium text-zinc-500 mb-2">
                Historical Trend (5Y)
              </div>
              <div style={{ height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historyChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
                    <XAxis
                      dataKey="year"
                      tick={{ fontSize: 11, fill: "#a1a1aa" }}
                      tickLine={false}
                      axisLine={{ stroke: "#e4e4e7" }}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "#a1a1aa" }}
                      tickLine={false}
                      axisLine={false}
                      width={45}
                      tickFormatter={(v) =>
                        metric.format === "percent" ? `${v}%` : String(Math.round(v * 100) / 100)
                      }
                    />
                    {/* Industry average reference line */}
                    {uniqueIndustryAvg && (
                      <ReferenceLine
                        y={uniqueIndustryAvg.avg}
                        stroke="#3b82f6"
                        strokeDasharray="6 3"
                        strokeWidth={1.5}
                        label={{
                          value: `${uniqueIndustryAvg.label} avg`,
                          position: "right",
                          fill: "#3b82f6",
                          fontSize: 10,
                        }}
                      />
                    )}
                    {/* Green threshold */}
                    <ReferenceLine
                      y={metric.greenThreshold}
                      stroke="#10b981"
                      strokeDasharray="3 3"
                      strokeWidth={1}
                    />
                    {/* Red threshold */}
                    <ReferenceLine
                      y={metric.redThreshold}
                      stroke="#ef4444"
                      strokeDasharray="3 3"
                      strokeWidth={1}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        return (
                          <div className="bg-white border rounded-lg shadow-lg px-3 py-2 text-xs">
                            <div className="text-zinc-500 mb-1">FY {label}</div>
                            {payload.map((entry) => (
                              <div key={entry.name} className="flex items-center gap-2">
                                <span
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: entry.color }}
                                />
                                <span>{entry.name}</span>
                                <span className="font-semibold ml-auto">
                                  {formatMetricValue(entry.value as number, metric.format)}
                                </span>
                              </div>
                            ))}
                            {uniqueIndustryAvg && (
                              <div className="flex items-center gap-2 text-blue-600 mt-1 pt-1 border-t">
                                <Building2 className="w-2.5 h-2.5" />
                                <span>{uniqueIndustryAvg.label} avg</span>
                                <span className="font-semibold ml-auto">
                                  {formatMetricValue(uniqueIndustryAvg.avg, metric.format)}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: 11 }}
                      formatter={(value) => (
                        <span className="text-zinc-600 text-xs">{value}</span>
                      )}
                    />
                    {stocks.map((stock, i) => (
                      <Line
                        key={stock.ticker}
                        type="monotone"
                        dataKey={stock.ticker}
                        stroke={LINE_COLORS[i % LINE_COLORS.length]}
                        strokeWidth={2}
                        dot={{ r: 3, fill: LINE_COLORS[i % LINE_COLORS.length] }}
                        connectNulls
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* === Bar Chart Comparison === */}
          <div>
            <div className="text-xs font-medium text-zinc-500 mb-2">
              Current Comparison
            </div>
            <div style={{ height: Math.max(100, sorted.length * 48) }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={sorted}
                  layout="vertical"
                  margin={{ left: 0, right: 20, top: 0, bottom: 0 }}
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
                  <ReferenceLine x={metric.greenThreshold} stroke="#10b981" strokeDasharray="3 3" />
                  <ReferenceLine x={metric.redThreshold} stroke="#ef4444" strokeDasharray="3 3" />
                  {/* Industry average line on bar chart */}
                  {uniqueIndustryAvg && (
                    <ReferenceLine
                      x={uniqueIndustryAvg.avg}
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
                          <div className="font-semibold">{d.ticker}</div>
                          <div className="text-zinc-600">
                            {metric.label}: {d.displayValue}
                          </div>
                          <div className="text-zinc-500">Score: {d.score}/100</div>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                    {sorted.map((entry) => (
                      <Cell key={entry.ticker} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* === Score bars === */}
          <div>
            <div className="text-xs font-medium text-zinc-500 mb-1">Score (0-100)</div>
            {sorted.map((d) => (
              <div key={d.ticker} className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-zinc-700 w-12">
                  {d.ticker}
                </span>
                <div className="flex-1 bg-zinc-100 rounded-full h-2.5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${d.score}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: d.color }}
                  />
                </div>
                <span className="text-xs text-zinc-500 w-8 text-right">
                  {Math.round(d.score)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
