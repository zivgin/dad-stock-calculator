import { METRICS } from "./constants";
import { MetricColor, MetricDefinition, ScoredStock, StockData } from "./types";

/**
 * Determines the color for a metric value based on absolute thresholds.
 */
export function getMetricColor(
  metric: MetricDefinition,
  value: number | null
): MetricColor {
  if (value === null || value === undefined || isNaN(value)) return "orange";

  if (metric.higherIsBetter) {
    if (value >= metric.greenThreshold) return "green";
    if (value <= metric.redThreshold) return "red";
    return "orange";
  } else {
    if (value <= metric.greenThreshold) return "green";
    if (value >= metric.redThreshold) return "red";
    return "orange";
  }
}

/**
 * Scores a single metric on a 0-100 scale.
 * Green zone = 80-100, Orange zone = 40-80, Red zone = 0-40.
 * Linearly interpolates within each zone.
 */
export function getMetricScore(
  metric: MetricDefinition,
  value: number | null
): number {
  if (value === null || value === undefined || isNaN(value)) return 50;

  const { greenThreshold, redThreshold, higherIsBetter } = metric;

  if (higherIsBetter) {
    if (value >= greenThreshold) {
      // How far above green? Cap at 100
      const excess = value - greenThreshold;
      const range = greenThreshold - redThreshold;
      return Math.min(100, 80 + (excess / range) * 20);
    }
    if (value <= redThreshold) {
      // How far below red? Floor at 0
      const deficit = redThreshold - value;
      const range = greenThreshold - redThreshold;
      return Math.max(0, 40 - (deficit / range) * 40);
    }
    // Orange zone: interpolate between 40 and 80
    const ratio = (value - redThreshold) / (greenThreshold - redThreshold);
    return 40 + ratio * 40;
  } else {
    // Lower is better — flip the logic
    if (value <= greenThreshold) {
      const excess = greenThreshold - value;
      const range = redThreshold - greenThreshold;
      return Math.min(100, 80 + (excess / range) * 20);
    }
    if (value >= redThreshold) {
      const deficit = value - redThreshold;
      const range = redThreshold - greenThreshold;
      return Math.max(0, 40 - (deficit / range) * 40);
    }
    const ratio = (redThreshold - value) / (redThreshold - greenThreshold);
    return 40 + ratio * 40;
  }
}

/**
 * Scores a stock across all metrics, producing a composite weighted score.
 */
export function scoreStock(stock: StockData): ScoredStock {
  const metricScores: Record<string, number> = {};
  const metricColors: Record<string, MetricColor> = {};
  let totalWeight = 0;
  let weightedSum = 0;

  for (const metric of METRICS) {
    const value = stock[metric.key] as number | null;
    const score = getMetricScore(metric, value);
    const color = getMetricColor(metric, value);

    metricScores[metric.key] = score;
    metricColors[metric.key] = color;

    if (value !== null && !isNaN(value)) {
      weightedSum += score * metric.weight;
      totalWeight += metric.weight;
    }
  }

  const compositeScore = totalWeight > 0 ? weightedSum / totalWeight : 50;

  let verdict: ScoredStock["verdict"];
  if (compositeScore >= 65) verdict = "Attractive";
  else if (compositeScore >= 45) verdict = "Fair";
  else verdict = "Weak";

  return {
    ...stock,
    metricScores,
    metricColors,
    compositeScore,
    rank: 0,
    verdict,
  };
}

/**
 * Ranks an array of scored stocks from highest to lowest composite score.
 */
export function rankStocks(stocks: ScoredStock[]): ScoredStock[] {
  const sorted = [...stocks].sort(
    (a, b) => b.compositeScore - a.compositeScore
  );
  return sorted.map((stock, i) => ({ ...stock, rank: i + 1 }));
}
