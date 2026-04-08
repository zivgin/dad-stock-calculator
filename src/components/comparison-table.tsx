"use client";

import { METRICS } from "@/lib/constants";
import { HistoricalRatio, ScoredStock, StockProfile } from "@/lib/types";
import { cn } from "@/lib/utils";
import { MetricCell } from "./metric-cell";
import { MetricDetail } from "./metric-detail";
import { ScoreBadge } from "./score-badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info, ChevronDown } from "lucide-react";
import { useState } from "react";

interface ComparisonTableProps {
  stocks: ScoredStock[];
  historicalRatios?: Record<string, HistoricalRatio[]>;
  profiles?: Record<string, StockProfile>;
  onMetricExpand?: () => void;
}

export function ComparisonTable({ stocks, historicalRatios, profiles, onMetricExpand }: ComparisonTableProps) {
  const [expandedMetric, setExpandedMetric] = useState<string | null>(null);

  if (stocks.length === 0) return null;

  const toggleMetric = (key: string) => {
    setExpandedMetric((prev) => (prev === key ? null : key));
    onMetricExpand?.();
  };

  return (
    <div className="hidden md:block rounded-xl border bg-white shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-zinc-50/80">
            <th className="text-left px-4 py-3 font-medium text-zinc-500 sticky left-0 bg-zinc-50/80 z-10 min-w-[180px]">
              Metric
            </th>
            {stocks.map((stock) => (
              <th
                key={stock.ticker}
                className="text-center px-4 py-3 min-w-[130px]"
              >
                <div className="flex flex-col items-center gap-2">
                  <div>
                    <div className="font-bold text-zinc-900">
                      {stock.ticker}
                    </div>
                    <div className="text-xs font-normal text-zinc-500 truncate max-w-[120px]">
                      {stock.name}
                    </div>
                  </div>
                  <ScoreBadge
                    score={stock.compositeScore}
                    verdict={stock.verdict}
                  />
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Price row — display only, not expandable */}
          <tr className="border-b hover:bg-zinc-50/50 transition-colors">
            <td className="px-4 py-2.5 font-medium text-zinc-700 sticky left-0 bg-white z-10">
              Price
            </td>
            {stocks.map((stock) => (
              <td key={stock.ticker} className="text-center px-4 py-2.5">
                <span className="text-sm font-semibold text-zinc-900">
                  ${stock.price.toFixed(2)}
                </span>
              </td>
            ))}
          </tr>

          {/* Scored metrics — expandable */}
          {METRICS.map((metric) => {
            const isExpanded = expandedMetric === metric.key;
            return (
              <tr
                key={metric.key}
                className="border-b last:border-0"
              >
                <td colSpan={stocks.length + 1} className="p-0">
                  {/* Main row */}
                  <div
                    className={cn(
                      "flex items-stretch cursor-pointer transition-colors",
                      isExpanded
                        ? "bg-zinc-50"
                        : "hover:bg-zinc-50/50"
                    )}
                    onClick={() => toggleMetric(metric.key)}
                  >
                    {/* Metric label */}
                    <div className="flex items-center gap-1.5 px-4 py-2.5 min-w-[180px] sticky left-0 bg-inherit z-10">
                      <ChevronDown
                        className={cn(
                          "w-3.5 h-3.5 text-zinc-400 transition-transform shrink-0",
                          isExpanded && "rotate-180"
                        )}
                      />
                      <span className="font-medium text-zinc-700">
                        {metric.label}
                      </span>
                      <Tooltip>
                        <TooltipTrigger
                          className="cursor-help"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Info className="w-3.5 h-3.5 text-zinc-400" />
                        </TooltipTrigger>
                        <TooltipContent
                          side="right"
                          className="max-w-[250px] text-xs"
                        >
                          {metric.description}
                        </TooltipContent>
                      </Tooltip>
                    </div>

                    {/* Values */}
                    {stocks.map((stock) => {
                      const value = stock[metric.key] as number | null;
                      return (
                        <div
                          key={stock.ticker}
                          className="flex-1 flex items-center justify-center px-4 py-2.5 min-w-[130px]"
                        >
                          <MetricCell
                            value={value}
                            format={metric.format}
                            color={stock.metricColors[metric.key]}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Expanded detail */}
                  <MetricDetail
                    metric={metric}
                    stocks={stocks}
                    isOpen={isExpanded}
                    historicalRatios={historicalRatios}
                    profiles={profiles}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
