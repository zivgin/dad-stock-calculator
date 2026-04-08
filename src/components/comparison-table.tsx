"use client";

import { METRICS } from "@/lib/constants";
import { ScoredStock } from "@/lib/types";
import { formatMetricValue } from "@/lib/utils";
import { MetricCell } from "./metric-cell";
import { ScoreBadge } from "./score-badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface ComparisonTableProps {
  stocks: ScoredStock[];
}

export function ComparisonTable({ stocks }: ComparisonTableProps) {
  if (stocks.length === 0) return null;

  return (
    <div className="hidden md:block overflow-x-auto rounded-xl border bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-zinc-50/80">
            <th className="text-left px-4 py-3 font-medium text-zinc-500 sticky left-0 bg-zinc-50/80 z-10 min-w-[160px]">
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
          {/* Price row — display only */}
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

          {/* Scored metrics */}
          {METRICS.map((metric) => (
            <tr
              key={metric.key}
              className="border-b last:border-0 hover:bg-zinc-50/50 transition-colors"
            >
              <td className="px-4 py-2.5 sticky left-0 bg-white z-10">
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-zinc-700">
                    {metric.label}
                  </span>
                  <Tooltip>
                    <TooltipTrigger className="cursor-help">
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
              </td>
              {stocks.map((stock) => {
                const value = stock[metric.key] as number | null;
                return (
                  <td
                    key={stock.ticker}
                    className="text-center px-4 py-2.5"
                  >
                    <MetricCell
                      value={value}
                      format={metric.format}
                      color={stock.metricColors[metric.key]}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
