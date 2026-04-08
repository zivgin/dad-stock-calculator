export interface StockSearchResult {
  symbol: string;
  name: string;
  currency: string;
  exchangeShortName: string;
}

export interface StockData {
  ticker: string;
  name: string;
  sector: string;
  industry: string;
  price: number;
  marketCap: number;
  week52High: number;
  priceToWeek52High: number;
  peRatio: number | null;
  pegRatio: number | null;
  priceToCashFlow: number | null;
  revenueGrowth3Y: number | null;
  epsGrowth3Y: number | null;
  operatingMargin: number | null;
  netMargin: number | null;
  debtToEquity: number | null;
  freeCashFlow: number | null;
  fcfYield: number | null;
}

export interface PricePoint {
  date: string;
  close: number;
}

export type TimeRange = "1M" | "3M" | "1Y" | "3Y";

export interface HistoricalRatio {
  year: string;
  peRatio: number | null;
  pegRatio: number | null;
  priceToCashFlow: number | null;
  operatingMargin: number | null;
  netMargin: number | null;
  debtToEquity: number | null;
}

export interface StockProfile {
  sector: string;
  industry: string;
}

export type MetricFormat = "currency" | "percent" | "ratio" | "number" | "largeCurrency";

export interface MetricDefinition {
  key: keyof StockData;
  label: string;
  shortLabel: string;
  description: string;
  format: MetricFormat;
  weight: number;
  higherIsBetter: boolean;
  // Thresholds: for higherIsBetter=true, green >= greenThreshold, red < redThreshold
  // For higherIsBetter=false, green <= greenThreshold, red > redThreshold
  greenThreshold: number;
  redThreshold: number;
}

export type MetricColor = "green" | "orange" | "red";

export interface ScoredStock extends StockData {
  metricScores: Record<string, number>;
  metricColors: Record<string, MetricColor>;
  compositeScore: number;
  rank: number;
  verdict: "Attractive" | "Fair" | "Weak";
}
