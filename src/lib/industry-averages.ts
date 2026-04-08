/**
 * Typical industry averages for key metrics.
 * These are approximate medians and updated periodically.
 * Source: various financial databases, 2025 data.
 */

export interface IndustryAverage {
  peRatio: number;
  pegRatio: number;
  operatingMargin: number;
  netMargin: number;
  debtToEquity: number;
  priceToCashFlow: number;
}

const INDUSTRY_AVERAGES: Record<string, IndustryAverage> = {
  // Technology
  "Consumer Electronics": { peRatio: 28, pegRatio: 1.8, operatingMargin: 22, netMargin: 18, debtToEquity: 0.6, priceToCashFlow: 22 },
  "Software - Infrastructure": { peRatio: 38, pegRatio: 2.2, operatingMargin: 30, netMargin: 25, debtToEquity: 0.8, priceToCashFlow: 30 },
  "Software - Application": { peRatio: 35, pegRatio: 2.0, operatingMargin: 25, netMargin: 20, debtToEquity: 0.7, priceToCashFlow: 28 },
  "Semiconductors": { peRatio: 30, pegRatio: 1.5, operatingMargin: 28, netMargin: 22, debtToEquity: 0.4, priceToCashFlow: 22 },
  "Semiconductor Equipment & Materials": { peRatio: 28, pegRatio: 1.6, operatingMargin: 25, netMargin: 20, debtToEquity: 0.5, priceToCashFlow: 20 },
  "Internet Content & Information": { peRatio: 25, pegRatio: 1.4, operatingMargin: 28, netMargin: 22, debtToEquity: 0.3, priceToCashFlow: 20 },
  "Internet Retail": { peRatio: 40, pegRatio: 1.8, operatingMargin: 8, netMargin: 5, debtToEquity: 0.8, priceToCashFlow: 18 },

  // Finance
  "Banks - Diversified": { peRatio: 12, pegRatio: 1.5, operatingMargin: 35, netMargin: 28, debtToEquity: 1.5, priceToCashFlow: 10 },
  "Banks - Regional": { peRatio: 11, pegRatio: 1.3, operatingMargin: 32, netMargin: 25, debtToEquity: 1.2, priceToCashFlow: 8 },
  "Credit Services": { peRatio: 18, pegRatio: 1.6, operatingMargin: 50, netMargin: 38, debtToEquity: 2.5, priceToCashFlow: 15 },
  "Insurance - Diversified": { peRatio: 14, pegRatio: 1.4, operatingMargin: 12, netMargin: 8, debtToEquity: 0.5, priceToCashFlow: 10 },
  "Financial Data & Stock Exchanges": { peRatio: 30, pegRatio: 2.2, operatingMargin: 45, netMargin: 35, debtToEquity: 0.8, priceToCashFlow: 25 },

  // Healthcare
  "Drug Manufacturers - General": { peRatio: 18, pegRatio: 2.0, operatingMargin: 25, netMargin: 18, debtToEquity: 0.8, priceToCashFlow: 16 },
  "Biotechnology": { peRatio: 25, pegRatio: 1.5, operatingMargin: 20, netMargin: 15, debtToEquity: 0.5, priceToCashFlow: 20 },
  "Medical Devices": { peRatio: 28, pegRatio: 2.0, operatingMargin: 22, netMargin: 16, debtToEquity: 0.6, priceToCashFlow: 22 },
  "Healthcare Plans": { peRatio: 18, pegRatio: 1.4, operatingMargin: 6, netMargin: 4, debtToEquity: 0.7, priceToCashFlow: 12 },

  // Consumer
  "Discount Stores": { peRatio: 28, pegRatio: 2.5, operatingMargin: 5, netMargin: 3, debtToEquity: 0.7, priceToCashFlow: 16 },
  "Restaurants": { peRatio: 25, pegRatio: 2.0, operatingMargin: 18, netMargin: 12, debtToEquity: 1.5, priceToCashFlow: 18 },
  "Household & Personal Products": { peRatio: 24, pegRatio: 2.5, operatingMargin: 20, netMargin: 14, debtToEquity: 0.8, priceToCashFlow: 20 },
  "Auto Manufacturers": { peRatio: 15, pegRatio: 1.2, operatingMargin: 8, netMargin: 5, debtToEquity: 1.0, priceToCashFlow: 8 },

  // Energy
  "Oil & Gas Integrated": { peRatio: 12, pegRatio: 1.5, operatingMargin: 15, netMargin: 10, debtToEquity: 0.4, priceToCashFlow: 6 },
  "Oil & Gas E&P": { peRatio: 10, pegRatio: 1.2, operatingMargin: 30, netMargin: 20, debtToEquity: 0.5, priceToCashFlow: 5 },

  // Industrials
  "Aerospace & Defense": { peRatio: 22, pegRatio: 1.8, operatingMargin: 12, netMargin: 8, debtToEquity: 1.0, priceToCashFlow: 18 },
  "Railroads": { peRatio: 20, pegRatio: 2.0, operatingMargin: 35, netMargin: 25, debtToEquity: 1.5, priceToCashFlow: 14 },
};

// Sector-level fallbacks
const SECTOR_AVERAGES: Record<string, IndustryAverage> = {
  "Technology": { peRatio: 30, pegRatio: 1.8, operatingMargin: 25, netMargin: 20, debtToEquity: 0.5, priceToCashFlow: 24 },
  "Financial Services": { peRatio: 14, pegRatio: 1.5, operatingMargin: 30, netMargin: 22, debtToEquity: 1.5, priceToCashFlow: 12 },
  "Healthcare": { peRatio: 22, pegRatio: 1.8, operatingMargin: 18, netMargin: 12, debtToEquity: 0.7, priceToCashFlow: 18 },
  "Consumer Cyclical": { peRatio: 22, pegRatio: 1.8, operatingMargin: 12, netMargin: 8, debtToEquity: 0.8, priceToCashFlow: 15 },
  "Consumer Defensive": { peRatio: 22, pegRatio: 2.2, operatingMargin: 15, netMargin: 10, debtToEquity: 0.8, priceToCashFlow: 16 },
  "Industrials": { peRatio: 20, pegRatio: 1.8, operatingMargin: 14, netMargin: 10, debtToEquity: 1.0, priceToCashFlow: 15 },
  "Energy": { peRatio: 12, pegRatio: 1.3, operatingMargin: 18, netMargin: 12, debtToEquity: 0.5, priceToCashFlow: 6 },
  "Communication Services": { peRatio: 18, pegRatio: 1.4, operatingMargin: 25, netMargin: 18, debtToEquity: 0.8, priceToCashFlow: 14 },
  "Utilities": { peRatio: 18, pegRatio: 2.5, operatingMargin: 25, netMargin: 15, debtToEquity: 1.5, priceToCashFlow: 10 },
  "Real Estate": { peRatio: 35, pegRatio: 3.0, operatingMargin: 30, netMargin: 20, debtToEquity: 1.2, priceToCashFlow: 18 },
  "Basic Materials": { peRatio: 15, pegRatio: 1.5, operatingMargin: 15, netMargin: 10, debtToEquity: 0.6, priceToCashFlow: 10 },
};

export function getIndustryAverage(
  industry: string | undefined,
  sector: string | undefined
): IndustryAverage | null {
  if (industry && INDUSTRY_AVERAGES[industry]) return INDUSTRY_AVERAGES[industry];
  if (sector && SECTOR_AVERAGES[sector]) return SECTOR_AVERAGES[sector];
  return null;
}

// Map our metric keys to industry average keys
export const METRIC_TO_INDUSTRY_KEY: Record<string, keyof IndustryAverage> = {
  peRatio: "peRatio",
  pegRatio: "pegRatio",
  operatingMargin: "operatingMargin",
  netMargin: "netMargin",
  debtToEquity: "debtToEquity",
  priceToCashFlow: "priceToCashFlow",
};
