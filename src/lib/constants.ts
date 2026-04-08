import { MetricDefinition } from "./types";

// Metric definitions with scoring thresholds.
// For higherIsBetter: green if value >= greenThreshold, red if value <= redThreshold
// For !higherIsBetter: green if value <= greenThreshold, red if value >= redThreshold
// Orange is everything in between. Score interpolates linearly within each zone.
export const METRICS: MetricDefinition[] = [
  {
    key: "peRatio",
    label: "P/E Ratio",
    shortLabel: "P/E",
    description: "Price-to-earnings ratio. Lower values may indicate the stock is undervalued.",
    format: "ratio",
    weight: 8,
    higherIsBetter: false,
    greenThreshold: 18,
    redThreshold: 30,
  },
  {
    key: "pegRatio",
    label: "PEG Ratio",
    shortLabel: "PEG",
    description: "P/E divided by earnings growth rate. Under 1.0 is generally considered attractive.",
    format: "ratio",
    weight: 9,
    higherIsBetter: false,
    greenThreshold: 1.0,
    redThreshold: 2.0,
  },
  {
    key: "priceToCashFlow",
    label: "Price / Cash Flow",
    shortLabel: "P/CF",
    description: "Price relative to operating cash flow. Lower is better.",
    format: "ratio",
    weight: 6,
    higherIsBetter: false,
    greenThreshold: 15,
    redThreshold: 25,
  },
  {
    key: "revenueGrowth3Y",
    label: "Revenue Growth (3Y)",
    shortLabel: "Rev Growth",
    description: "Annualized revenue growth over the last 3 years.",
    format: "percent",
    weight: 9,
    higherIsBetter: true,
    greenThreshold: 15,
    redThreshold: 5,
  },
  {
    key: "epsGrowth3Y",
    label: "EPS Growth (3Y)",
    shortLabel: "EPS Growth",
    description: "Annualized earnings-per-share growth over the last 3 years.",
    format: "percent",
    weight: 8,
    higherIsBetter: true,
    greenThreshold: 15,
    redThreshold: 5,
  },
  {
    key: "operatingMargin",
    label: "Operating Margin",
    shortLabel: "Op. Margin",
    description: "Operating income as a percentage of revenue. Higher indicates better efficiency.",
    format: "percent",
    weight: 7,
    higherIsBetter: true,
    greenThreshold: 20,
    redThreshold: 10,
  },
  {
    key: "netMargin",
    label: "Net Profit Margin",
    shortLabel: "Net Margin",
    description: "Net income as a percentage of revenue after all expenses.",
    format: "percent",
    weight: 6,
    higherIsBetter: true,
    greenThreshold: 15,
    redThreshold: 5,
  },
  {
    key: "debtToEquity",
    label: "Debt / Equity",
    shortLabel: "D/E",
    description: "Total debt relative to shareholder equity. Lower indicates less leverage risk.",
    format: "ratio",
    weight: 7,
    higherIsBetter: false,
    greenThreshold: 0.5,
    redThreshold: 1.5,
  },
  {
    key: "fcfYield",
    label: "FCF Yield",
    shortLabel: "FCF Yield",
    description: "Free cash flow as a percentage of market cap. Higher means more cash per dollar invested.",
    format: "percent",
    weight: 8,
    higherIsBetter: true,
    greenThreshold: 5,
    redThreshold: 2,
  },
  {
    key: "freeCashFlow",
    label: "Free Cash Flow",
    shortLabel: "FCF",
    description: "Cash generated after capital expenditures, available for dividends, buybacks, or reinvestment.",
    format: "largeCurrency",
    weight: 5,
    higherIsBetter: true,
    greenThreshold: 5_000_000_000,
    redThreshold: 1_000_000_000,
  },
  {
    key: "priceToWeek52High",
    label: "Price vs 52W High",
    shortLabel: "vs 52W High",
    description: "Current price as percentage of 52-week high. Higher means closer to its peak.",
    format: "percent",
    weight: 5,
    higherIsBetter: true,
    greenThreshold: 90,
    redThreshold: 75,
  },
  {
    key: "marketCap",
    label: "Market Cap",
    shortLabel: "Mkt Cap",
    description: "Total market value of the company's shares. Larger companies tend to be more stable.",
    format: "largeCurrency",
    weight: 3,
    higherIsBetter: true,
    greenThreshold: 50_000_000_000,
    redThreshold: 10_000_000_000,
  },
];

// Display-only metrics (no scoring)
export const DISPLAY_METRICS: (keyof import("./types").StockData)[] = ["price"];

// Categories for the radar chart — each maps to metric keys
export const METRIC_CATEGORIES: {
  label: string;
  keys: (keyof import("./types").StockData)[];
}[] = [
  { label: "Valuation", keys: ["peRatio", "pegRatio", "priceToCashFlow"] },
  { label: "Growth", keys: ["revenueGrowth3Y", "epsGrowth3Y"] },
  { label: "Profitability", keys: ["operatingMargin", "netMargin"] },
  { label: "Leverage", keys: ["debtToEquity"] },
  { label: "Cash Flow", keys: ["fcfYield", "freeCashFlow"] },
];

// Chart type per metric for the expandable row visualization
export type MetricChartType = "bar" | "gauge";
export const METRIC_CHART_TYPES: Record<string, MetricChartType> = {
  peRatio: "bar",
  pegRatio: "bar",
  priceToCashFlow: "bar",
  revenueGrowth3Y: "bar",
  epsGrowth3Y: "bar",
  operatingMargin: "bar",
  netMargin: "bar",
  debtToEquity: "bar",
  fcfYield: "bar",
  freeCashFlow: "bar",
  priceToWeek52High: "gauge",
  marketCap: "bar",
};

export const MAX_SELECTIONS = 5;

export const QUICK_PICKS = [
  { ticker: "AAPL", name: "Apple" },
  { ticker: "MSFT", name: "Microsoft" },
  { ticker: "GOOGL", name: "Alphabet" },
  { ticker: "NVDA", name: "NVIDIA" },
  { ticker: "AMZN", name: "Amazon" },
  { ticker: "META", name: "Meta" },
];

// Color palette for selected stock chips
export const CHIP_COLORS = [
  "bg-blue-100 text-blue-800 border-blue-200",
  "bg-violet-100 text-violet-800 border-violet-200",
  "bg-amber-100 text-amber-800 border-amber-200",
  "bg-emerald-100 text-emerald-800 border-emerald-200",
  "bg-rose-100 text-rose-800 border-rose-200",
];
