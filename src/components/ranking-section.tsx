"use client";

import { ScoredStock } from "@/lib/types";
import { ScoreBadge } from "./score-badge";
import { Trophy, TrendingUp, Shield, DollarSign, Activity } from "lucide-react";
import { METRICS } from "@/lib/constants";

interface RankingSectionProps {
  stocks: ScoredStock[];
}

function getInsights(stocks: ScoredStock[]) {
  if (stocks.length < 2) return [];

  const insights: { icon: React.ReactNode; label: string; ticker: string; detail: string }[] = [];

  // Best valuation (lowest P/E among non-null)
  const withPE = stocks.filter((s) => s.peRatio !== null && s.peRatio > 0);
  if (withPE.length > 0) {
    const best = withPE.reduce((a, b) => (a.peRatio! < b.peRatio! ? a : b));
    insights.push({
      icon: <DollarSign className="w-4 h-4" />,
      label: "Best Valuation",
      ticker: best.ticker,
      detail: `P/E ${best.peRatio!.toFixed(1)}`,
    });
  }

  // Strongest growth
  const withGrowth = stocks.filter((s) => s.revenueGrowth3Y !== null);
  if (withGrowth.length > 0) {
    const best = withGrowth.reduce((a, b) =>
      a.revenueGrowth3Y! > b.revenueGrowth3Y! ? a : b
    );
    insights.push({
      icon: <TrendingUp className="w-4 h-4" />,
      label: "Strongest Growth",
      ticker: best.ticker,
      detail: `${best.revenueGrowth3Y!.toFixed(1)}% rev growth`,
    });
  }

  // Best margins
  const withMargin = stocks.filter((s) => s.operatingMargin !== null);
  if (withMargin.length > 0) {
    const best = withMargin.reduce((a, b) =>
      a.operatingMargin! > b.operatingMargin! ? a : b
    );
    insights.push({
      icon: <Activity className="w-4 h-4" />,
      label: "Best Margins",
      ticker: best.ticker,
      detail: `${best.operatingMargin!.toFixed(1)}% operating`,
    });
  }

  // Strongest balance sheet (lowest D/E)
  const withDE = stocks.filter((s) => s.debtToEquity !== null && s.debtToEquity >= 0);
  if (withDE.length > 0) {
    const best = withDE.reduce((a, b) =>
      a.debtToEquity! < b.debtToEquity! ? a : b
    );
    insights.push({
      icon: <Shield className="w-4 h-4" />,
      label: "Strongest Balance Sheet",
      ticker: best.ticker,
      detail: `D/E ${best.debtToEquity!.toFixed(2)}`,
    });
  }

  return insights;
}

export function RankingSection({ stocks }: RankingSectionProps) {
  if (stocks.length < 2) return null;

  const insights = getInsights(stocks);

  return (
    <div className="space-y-6">
      {/* Ranking list */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b bg-zinc-50/50">
          <h3 className="font-semibold text-zinc-800 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            Ranking
          </h3>
        </div>
        <div className="divide-y">
          {stocks.map((stock, i) => (
            <div
              key={stock.ticker}
              className="flex items-center gap-4 px-4 py-3"
            >
              <span
                className={`text-lg font-bold w-8 ${
                  i === 0
                    ? "text-amber-500"
                    : i === 1
                      ? "text-zinc-400"
                      : i === 2
                        ? "text-amber-700"
                        : "text-zinc-300"
                }`}
              >
                #{stock.rank}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-zinc-900">
                  {stock.ticker}
                </div>
                <div className="text-xs text-zinc-500 truncate">
                  {stock.name}
                </div>
              </div>
              {/* Score bar */}
              <div className="flex-1 hidden sm:block">
                <div className="w-full bg-zinc-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      stock.compositeScore >= 65
                        ? "bg-emerald-500"
                        : stock.compositeScore >= 45
                          ? "bg-amber-500"
                          : "bg-red-500"
                    }`}
                    style={{ width: `${Math.min(100, stock.compositeScore)}%` }}
                  />
                </div>
              </div>
              <ScoreBadge
                score={stock.compositeScore}
                verdict={stock.verdict}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {insights.map((insight) => (
            <div
              key={insight.label}
              className="bg-white rounded-xl border p-3 text-center"
            >
              <div className="flex justify-center text-zinc-400 mb-1.5">
                {insight.icon}
              </div>
              <div className="text-xs text-zinc-500 mb-0.5">
                {insight.label}
              </div>
              <div className="font-bold text-zinc-900 text-sm">
                {insight.ticker}
              </div>
              <div className="text-xs text-zinc-500">{insight.detail}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
