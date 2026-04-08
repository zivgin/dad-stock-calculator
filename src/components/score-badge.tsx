"use client";

import { cn } from "@/lib/utils";

interface ScoreBadgeProps {
  score: number;
  verdict: string;
  size?: "sm" | "lg";
}

export function ScoreBadge({ score, verdict, size = "sm" }: ScoreBadgeProps) {
  const rounded = Math.round(score);

  let bgColor: string;
  if (score >= 65) bgColor = "bg-emerald-500";
  else if (score >= 45) bgColor = "bg-amber-500";
  else bgColor = "bg-red-500";

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={cn(
          "rounded-full text-white font-bold flex items-center justify-center",
          bgColor,
          size === "lg" ? "w-14 h-14 text-lg" : "w-10 h-10 text-sm"
        )}
      >
        {rounded}
      </div>
      <span
        className={cn(
          "font-medium",
          size === "lg" ? "text-sm" : "text-xs",
          score >= 65
            ? "text-emerald-600"
            : score >= 45
              ? "text-amber-600"
              : "text-red-600"
        )}
      >
        {verdict}
      </span>
    </div>
  );
}
