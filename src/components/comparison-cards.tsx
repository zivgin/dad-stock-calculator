"use client";

import { METRICS } from "@/lib/constants";
import { HistoricalRatio, ScoredStock, StockProfile } from "@/lib/types";
import { MetricCell } from "./metric-cell";
import { ScoreBadge } from "./score-badge";
import { MetricDetail } from "./metric-detail";
import { motion } from "framer-motion";
import { Trophy, ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ComparisonCardsProps {
  stocks: ScoredStock[];
  historicalRatios?: Record<string, HistoricalRatio[]>;
  profiles?: Record<string, StockProfile>;
  onMetricExpand?: () => void;
}

export function ComparisonCards({ stocks, historicalRatios, profiles, onMetricExpand }: ComparisonCardsProps) {
  const [expandedMetric, setExpandedMetric] = useState<string | null>(null);

  if (stocks.length === 0) return null;

  const toggleMetric = (key: string) => {
    setExpandedMetric((prev) => (prev === key ? null : key));
    onMetricExpand?.();
  };

  return (
    <div className="md:hidden space-y-4">
      {stocks.map((stock, index) => (
        <motion.div
          key={stock.ticker}
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="bg-white rounded-xl border shadow-sm overflow-hidden"
        >
          {/* Card header */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-zinc-50/50">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {stock.rank <= 3 && (
                  <Trophy
                    className={`w-4 h-4 ${
                      stock.rank === 1
                        ? "text-amber-500"
                        : stock.rank === 2
                          ? "text-zinc-400"
                          : "text-amber-700"
                    }`}
                  />
                )}
                <span className="text-lg font-bold text-zinc-900">
                  #{stock.rank}
                </span>
              </div>
              <div>
                <div className="font-bold text-zinc-900">{stock.ticker}</div>
                <div className="text-xs text-zinc-500 truncate max-w-[150px]">
                  {stock.name}
                </div>
              </div>
            </div>
            <ScoreBadge
              score={stock.compositeScore}
              verdict={stock.verdict}
              size="lg"
            />
          </div>

          {/* Price */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b bg-zinc-50/30">
            <span className="text-sm text-zinc-600">Price</span>
            <span className="font-semibold text-zinc-900">
              ${stock.price.toFixed(2)}
            </span>
          </div>

          {/* Metrics */}
          <div className="divide-y">
            {METRICS.map((metric) => {
              const value = stock[metric.key] as number | null;
              const isExpanded = expandedMetric === `${stock.ticker}-${metric.key}`;
              return (
                <div key={metric.key}>
                  <div
                    className={cn(
                      "flex items-center justify-between px-4 py-2.5 cursor-pointer transition-colors",
                      isExpanded ? "bg-zinc-50" : "active:bg-zinc-50"
                    )}
                    onClick={() =>
                      toggleMetric(`${stock.ticker}-${metric.key}`)
                    }
                  >
                    <span className="text-sm text-zinc-600 flex items-center gap-1">
                      <ChevronDown
                        className={cn(
                          "w-3 h-3 text-zinc-400 transition-transform",
                          isExpanded && "rotate-180"
                        )}
                      />
                      {metric.shortLabel}
                    </span>
                    <MetricCell
                      value={value}
                      format={metric.format}
                      color={stock.metricColors[metric.key]}
                    />
                  </div>
                  {/* Expanded: show all stocks for this metric */}
                  {isExpanded && (
                    <MetricDetail
                      metric={metric}
                      stocks={stocks}
                      isOpen={true}
                      historicalRatios={historicalRatios}
                      profiles={profiles}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
