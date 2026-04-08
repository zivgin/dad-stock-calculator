"use client";

import { CHIP_COLORS } from "@/lib/constants";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SelectedChipsProps {
  tickers: { ticker: string; name: string }[];
  onRemove: (ticker: string) => void;
}

export function SelectedChips({ tickers, onRemove }: SelectedChipsProps) {
  if (tickers.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      <AnimatePresence mode="popLayout">
        {tickers.map((item, i) => (
          <motion.div
            key={item.ticker}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${CHIP_COLORS[i % CHIP_COLORS.length]}`}
          >
            <span className="font-bold">{item.ticker}</span>
            <span className="hidden sm:inline text-xs opacity-70 max-w-[120px] truncate">
              {item.name}
            </span>
            <button
              onClick={() => onRemove(item.ticker)}
              className="ml-0.5 rounded-full p-0.5 hover:bg-black/10 transition-colors"
              aria-label={`Remove ${item.ticker}`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
