"use client";

import { MetricDefinition, ScoredStock, MetricColor } from "@/lib/types";
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
} from "recharts";

const COLOR_MAP: Record<MetricColor, string> = {
  green: "#10b981",
  orange: "#f59e0b",
  red: "#ef4444",
};

interface MetricDetailProps {
  metric: MetricDefinition;
  stocks: ScoredStock[];
  isOpen: boolean;
}

export function MetricDetail({ metric, stocks, isOpen }: MetricDetailProps) {
  if (!isOpen || stocks.length === 0) return null;

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

  // Sort bars: best first
  const sorted = [...barData].sort((a, b) =>
    metric.higherIsBetter ? b.value - a.value : a.value - b.value
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        <div className="px-4 py-3 bg-zinc-50/50 border-t">
          {/* Description */}
          <p className="text-xs text-zinc-500 mb-3">{metric.description}</p>

          {/* Threshold legend */}
          <div className="flex items-center gap-4 mb-3 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Good: {metric.higherIsBetter ? "≥" : "≤"}{" "}
              {formatMetricValue(metric.greenThreshold, metric.format)}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              Weak: {metric.higherIsBetter ? "≤" : "≥"}{" "}
              {formatMetricValue(metric.redThreshold, metric.format)}
            </span>
          </div>

          {/* Horizontal bar chart */}
          <div style={{ height: Math.max(120, sorted.length * 48) }}>
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
                {/* Green threshold reference line */}
                <ReferenceLine
                  x={metric.greenThreshold}
                  stroke="#10b981"
                  strokeDasharray="3 3"
                  strokeWidth={1}
                />
                {/* Red threshold reference line */}
                <ReferenceLine
                  x={metric.redThreshold}
                  stroke="#ef4444"
                  strokeDasharray="3 3"
                  strokeWidth={1}
                />
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
                        <div className="text-zinc-500">
                          Score: {d.score}/100
                        </div>
                      </div>
                    );
                  }}
                />
                <Bar
                  dataKey="value"
                  radius={[0, 4, 4, 0]}
                  barSize={24}
                  label={{
                    position: "right",
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter: ((value: any) => {
                      const item = sorted.find((d) => d.value === value);
                      return item?.displayValue || String(value);
                    }) as any,
                    fill: "#71717a",
                    fontSize: 11,
                  }}
                >
                  {sorted.map((entry, i) => (
                    <Cell key={entry.ticker} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Score comparison bar */}
          <div className="mt-3 space-y-1.5">
            <div className="text-xs font-medium text-zinc-500 mb-1">Score (0-100)</div>
            {sorted.map((d) => (
              <div key={d.ticker} className="flex items-center gap-2">
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
