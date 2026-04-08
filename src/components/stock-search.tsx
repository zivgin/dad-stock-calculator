"use client";

import { useStockSearch } from "@/hooks/use-stock-search";
import { MAX_SELECTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Search, Loader2 } from "lucide-react";
import { useRef, useState, useCallback, useEffect, forwardRef, useImperativeHandle } from "react";

export interface StockSearchHandle {
  focus: () => void;
}

interface StockSearchProps {
  selectedTickers: string[];
  onSelect: (ticker: string, name: string) => void;
}

export const StockSearch = forwardRef<StockSearchHandle, StockSearchProps>(
  function StockSearch({ selectedTickers, onSelect }, ref) {
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const { results, isLoading } = useStockSearch(query);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const atLimit = selectedTickers.length >= MAX_SELECTIONS;

    useImperativeHandle(ref, () => ({
      focus: () => {
        inputRef.current?.focus();
        inputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      },
    }));

    const handleSelect = useCallback(
      (ticker: string, name: string) => {
        onSelect(ticker, name);
        setQuery("");
        setOpen(false);
        inputRef.current?.blur();
      },
      [onSelect]
    );

    // Close dropdown on outside click
    useEffect(() => {
      function handleClick(e: MouseEvent) {
        if (
          containerRef.current &&
          !containerRef.current.contains(e.target as Node)
        ) {
          setOpen(false);
        }
      }
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const filteredResults = results.filter(
      (r) => !selectedTickers.includes(r.symbol)
    );

    return (
      <div ref={containerRef} className="relative w-full max-w-xl mx-auto">
        <div
          className={cn(
            "flex items-center gap-3 px-4 py-3.5 md:py-3 bg-white border-2 rounded-xl shadow-sm transition-all",
            "focus-within:shadow-md focus-within:border-emerald-400",
            atLimit ? "opacity-60 border-zinc-200" : "border-zinc-200"
          )}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 text-zinc-400 animate-spin shrink-0" />
          ) : (
            <Search className="w-5 h-5 text-zinc-400 shrink-0" />
          )}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => query.length > 0 && setOpen(true)}
            placeholder={
              atLimit
                ? `Max ${MAX_SELECTIONS} stocks selected`
                : "Search by ticker or company name..."
            }
            disabled={atLimit}
            className="flex-1 bg-transparent text-base outline-none placeholder:text-zinc-400 disabled:cursor-not-allowed"
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                setOpen(false);
              }}
              className="text-zinc-400 hover:text-zinc-600 text-sm font-medium"
            >
              Clear
            </button>
          )}
        </div>

        {/* Dropdown */}
        {open && query.length >= 1 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-xl shadow-lg z-50 overflow-hidden">
            {isLoading && filteredResults.length === 0 ? (
              <div className="px-4 py-8 text-center text-zinc-400">
                <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                Searching...
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="px-4 py-8 text-center text-zinc-400">
                No results found
              </div>
            ) : (
              <ul className="max-h-72 overflow-y-auto">
                {filteredResults.map((result) => (
                  <li key={result.symbol}>
                    <button
                      onClick={() => handleSelect(result.symbol, result.name)}
                      className="w-full flex items-center gap-3 px-4 py-3.5 md:py-3 hover:bg-zinc-50 active:bg-zinc-100 transition-colors text-left"
                    >
                      <span className="font-semibold text-sm bg-zinc-100 text-zinc-700 px-2.5 py-1 rounded-md shrink-0">
                        {result.symbol}
                      </span>
                      <span className="text-sm text-zinc-600 truncate">
                        {result.name}
                      </span>
                      <span className="text-xs text-zinc-400 ml-auto shrink-0">
                        {result.exchangeShortName}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    );
  }
);
