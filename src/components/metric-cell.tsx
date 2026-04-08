"use client";

import { MetricColor, MetricFormat } from "@/lib/types";
import { cn, formatMetricValue } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MetricCellProps {
  value: number | null;
  format: MetricFormat;
  color: MetricColor;
  tooltip?: string;
  className?: string;
}

const colorStyles: Record<MetricColor, string> = {
  green:
    "bg-emerald-50 text-emerald-700 border-emerald-100",
  orange:
    "bg-amber-50 text-amber-700 border-amber-100",
  red:
    "bg-red-50 text-red-700 border-red-100",
};

export function MetricCell({
  value,
  format,
  color,
  tooltip,
  className,
}: MetricCellProps) {
  const formatted = formatMetricValue(value, format);
  const isNA = value === null || value === undefined || isNaN(value);

  const cell = (
    <span
      className={cn(
        "inline-block px-2 py-1 rounded-md text-sm font-medium tabular-nums",
        isNA ? "text-zinc-400" : colorStyles[color],
        className
      )}
    >
      {formatted}
    </span>
  );

  if (tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger>{cell}</TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-[250px] text-xs"
        >
          {tooltip}
        </TooltipContent>
      </Tooltip>
    );
  }

  return cell;
}
