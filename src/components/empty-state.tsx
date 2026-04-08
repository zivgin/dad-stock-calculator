"use client";

import { QUICK_PICKS } from "@/lib/constants";
import { BarChart3, Plus } from "lucide-react";

interface EmptyStateProps {
  onQuickPick: (ticker: string, name: string) => void;
  onSearchFocus: () => void;
}

export function EmptyState({ onQuickPick, onSearchFocus }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-10 md:py-16 px-4">
      <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mb-5">
        <BarChart3 className="w-8 h-8 text-zinc-400" />
      </div>

      {/* Mobile: big tap target to start */}
      <button
        onClick={onSearchFocus}
        className="md:hidden w-full max-w-xs mb-6 flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold rounded-xl text-base shadow-lg shadow-emerald-600/20 transition-colors"
      >
        <Plus className="w-5 h-5" />
        Add Stocks to Compare
      </button>

      {/* Desktop keeps the subtle message */}
      <h2 className="hidden md:block text-xl font-semibold text-zinc-800 mb-2">
        Compare stocks instantly
      </h2>
      <p className="text-zinc-500 text-center max-w-sm mb-6 text-sm">
        Tap a stock below to get started, or search for any company.
      </p>

      {/* Quick picks — bigger on mobile */}
      <div className="w-full max-w-sm">
        <p className="text-xs font-medium text-zinc-400 text-center mb-3 uppercase tracking-wide">
          Popular stocks
        </p>
        <div className="grid grid-cols-3 gap-2 md:flex md:flex-wrap md:justify-center md:gap-2">
          {QUICK_PICKS.map((pick) => (
            <button
              key={pick.ticker}
              onClick={() => onQuickPick(pick.ticker, pick.name)}
              className="flex flex-col items-center gap-0.5 px-3 py-3 md:py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 active:bg-zinc-300 transition-colors border border-zinc-200/50"
            >
              <span className="font-bold text-sm text-zinc-800">
                {pick.ticker}
              </span>
              <span className="text-[11px] text-zinc-500">{pick.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
