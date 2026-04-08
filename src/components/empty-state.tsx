"use client";

import { QUICK_PICKS } from "@/lib/constants";
import { BarChart3 } from "lucide-react";

interface EmptyStateProps {
  onQuickPick: (ticker: string, name: string) => void;
}

export function EmptyState({ onQuickPick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mb-6">
        <BarChart3 className="w-8 h-8 text-zinc-400" />
      </div>
      <h2 className="text-xl font-semibold text-zinc-800 mb-2">
        Compare stocks instantly
      </h2>
      <p className="text-zinc-500 text-center max-w-sm mb-8">
        Search for companies above, or pick a few popular ones to get started.
      </p>
      <div className="flex flex-wrap gap-2 justify-center">
        {QUICK_PICKS.map((pick) => (
          <button
            key={pick.ticker}
            onClick={() => onQuickPick(pick.ticker, pick.name)}
            className="px-4 py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 active:bg-zinc-300 transition-colors text-sm font-medium text-zinc-700"
          >
            {pick.ticker}
          </button>
        ))}
      </div>
    </div>
  );
}
