"use client";

import { METRICS } from "@/lib/constants";
import { ScoredStock } from "@/lib/types";
import { MetricCell } from "./metric-cell";
import { ScoreBadge } from "./score-badge";
import { motion } from "framer-motion";
import { CHIP_COLORS } from "@/lib/constants";
import { Trophy } from "lucide-react";

interface ComparisonCardsProps {
  stocks: ScoredStock[];
}

export function ComparisonCards({ stocks }: ComparisonCardsProps) {
  if (stocks.length === 0) return null;

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
              return (
                <div
                  key={metric.key}
                  className="flex items-center justify-between px-4 py-2.5"
                >
                  <span className="text-sm text-zinc-600">
                    {metric.shortLabel}
                  </span>
                  <MetricCell
                    value={value}
                    format={metric.format}
                    color={stock.metricColors[metric.key]}
                  />
                </div>
              );
            })}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
