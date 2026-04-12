import type { HyroxResult } from '../types/hyrox';

/**
 * Returns the value at a given percentile (0-1) of a numeric array.
 * Values outside [0,1] are clamped; NaN returns 0.
 *
 * Uses linear interpolation between neighboring values when the percentile
 * doesn't land exactly on an index (matches numpy's default method).
 *
 * Filters out zeros and negatives, which represent missing data in this dataset.
 * Returns 0 for empty input.
 */
export function percentile(values: number[], p: number): number {
  // Guard against invalid percentile inputs.
  // We clamp rather than throw because callers passing 1.0 or 0.0 exactly
  // is reasonable, and silently clamping garbage is friendlier than crashing
  // a chart over a typo. NaN is the one case we can't recover from.
  if (Number.isNaN(p)) return 0;
  const clamped = Math.min(1, Math.max(0, p));

  if (values.length === 0) return 0;

  const valid = values.filter((v) => v > 0);
  if (valid.length === 0) return 0;

  const sorted = [...valid].sort((a, b) => a - b);

  const index = (sorted.length - 1) * clamped;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);

  if (lower === upper) return sorted[lower];

  const weight = index - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

/**
 * Returns the median (50th percentile) of a numeric array.
 * Thin wrapper around `percentile` for readability at call sites.
 */
export function median(values: number[]): number {
  return percentile(values, 0.5);
}

/**
 * Computes the median time for each segment position across a set of results.
 * Returns three arrays of length 8: one for runs, one for stations, one for roxzones.
 *
 * Used by the Pacing Guide to show "the typical pacing for athletes who finished
 * within range of your target time".
 */
export interface MedianSplits {
  runs: number[]; // length 8
  works: number[]; // length 8
  roxzones: number[]; // length 8
}

export function medianSplits(results: HyroxResult[]): MedianSplits {
  // Edge case: no results means we have nothing to compute.
  // Return all-zero arrays so the UI can render placeholders without crashing.
  if (results.length === 0) {
    return {
      runs: new Array(8).fill(0),
      works: new Array(8).fill(0),
      roxzones: new Array(8).fill(0),
    };
  }

  // For each of the 8 positions, gather the value at that position
  // from every result, then take the median.
  const runs = Array.from({ length: 8 }, (_, i) =>
    median(results.map((r) => r.runs[i])),
  );
  const works = Array.from({ length: 8 }, (_, i) =>
    median(results.map((r) => r.works[i])),
  );
  const roxzones = Array.from({ length: 8 }, (_, i) =>
    median(results.map((r) => r.roxzones[i])),
  );

  return { runs, works, roxzones };
}

/**
 * Per-station summary statistics: 25th percentile, median, and 75th percentile.
 * The interquartile range (p25 to p75) shows how much variance there is at
 * each station — a wide spread means athletes vary a lot, a narrow spread
 * means most athletes finish in a similar time.
 */
export interface StationStat {
  index: number; // 0-7, position in the race
  p25: number;
  median: number;
  p75: number;
}

export function stationStats(results: HyroxResult[]): StationStat[] {
  return Array.from({ length: 8 }, (_, i) => {
    const values = results.map((r) => r.works[i]);
    return {
      index: i,
      p25: percentile(values, 0.25),
      median: percentile(values, 0.5),
      p75: percentile(values, 0.75),
    };
  });
}
