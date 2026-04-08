import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { MetricFormat } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMetricValue(
  value: number | null,
  format: MetricFormat
): string {
  if (value === null || value === undefined || isNaN(value)) return "N/A";

  switch (format) {
    case "currency":
      return `$${value.toFixed(2)}`;
    case "largeCurrency":
      if (Math.abs(value) >= 1_000_000_000_000)
        return `$${(value / 1_000_000_000_000).toFixed(1)}T`;
      if (Math.abs(value) >= 1_000_000_000)
        return `$${(value / 1_000_000_000).toFixed(1)}B`;
      if (Math.abs(value) >= 1_000_000)
        return `$${(value / 1_000_000).toFixed(1)}M`;
      return `$${value.toLocaleString()}`;
    case "percent":
      return `${value.toFixed(1)}%`;
    case "ratio":
      return value.toFixed(2);
    case "number":
      return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
    default:
      return String(value);
  }
}
