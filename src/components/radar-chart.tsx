"use client";

import { CHART_COLORS, METRIC_CATEGORIES } from "@/lib/constants";
import { ScoredStock } from "@/lib/types";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { useIsMobile } from "@/hooks/use-is-mobile";

interface StockRadarChartProps {
  stocks: ScoredStock[];
}

export function StockRadarChart({ stocks }: StockRadarChartProps) {
  const isMobile = useIsMobile();

  if (stocks.length === 0) return null;

  // Build radar data: for each category, average the metric scores
  const radarData = METRIC_CATEGORIES.map((cat) => {
    const row: Record<string, string | number> = { category: cat.label };
    for (const stock of stocks) {
      let total = 0;
      let count = 0;
      for (const key of cat.keys) {
        const score = stock.metricScores[key];
        if (score !== undefined) {
          total += score;
          count++;
        }
      }
      row[stock.ticker] = count > 0 ? Math.round(total / count) : 50;
    }
    return row;
  });

  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b">
        <h3 className="font-semibold text-zinc-800 text-sm">
          Strength Profile
        </h3>
        <p className="text-xs text-zinc-500 mt-0.5">
          Score by category (0-100)
        </p>
      </div>
      <div className="px-2 py-2">
        <ResponsiveContainer width="100%" height={isMobile ? 280 : 320}>
          <RadarChart data={radarData} cx="50%" cy="50%" outerRadius={isMobile ? "65%" : "70%"}>
            <PolarGrid stroke="#e4e4e7" />
            <PolarAngleAxis
              dataKey="category"
              tick={{ fontSize: isMobile ? 11 : 12, fill: "#71717a" }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: "#a1a1aa" }}
              tickCount={5}
            />
            {stocks.map((stock, i) => (
              <Radar
                key={stock.ticker}
                name={stock.ticker}
                dataKey={stock.ticker}
                stroke={CHART_COLORS[i % CHART_COLORS.length]}
                fill={CHART_COLORS[i % CHART_COLORS.length]}
                fillOpacity={stocks.length === 1 ? 0.25 : 0.1}
                strokeWidth={2}
              />
            ))}
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="bg-white border rounded-lg shadow-lg px-3 py-2 text-xs">
                    <div className="font-medium text-zinc-700 mb-1">{label}</div>
                    {payload.map((entry) => (
                      <div key={entry.name} className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span>{entry.name}</span>
                        <span className="font-semibold ml-auto">
                          {String(entry.value)}/100
                        </span>
                      </div>
                    ))}
                  </div>
                );
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 12 }}
              formatter={(value) => (
                <span className="text-zinc-600 text-xs">{value}</span>
              )}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
