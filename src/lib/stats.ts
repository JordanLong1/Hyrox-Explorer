import type { HyroxResult } from '../types/hyrox';

/**
 * Returns the value at a given percentile (0-1) of a numeric array.
 * Uses linear interpolation between the two surrounding values when the
 * percentile doesn't land exactly on an index.
 *
 * Filters out zeros, which represent missing data in this dataset.
 * Returns 0 for empty input.
 *
 * Examples:
 *   percentile([1,2,3,4,5], 0.5) -> 3   (median)
 *   percentile([1,2,3,4,5], 0.25) -> 2  (25th percentile)
 *   percentile([1,2,3,4,5], 0.75) -> 4  (75th percentile)
 */
export function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;

  const valid = values.filter((v) => v > 0);
  if (valid.length === 0) return 0;

  const sorted = [...valid].sort((a, b) => a - b);

  // Position in the sorted array — may be fractional.
  const index = (sorted.length - 1) * p;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);

  // Exact hit on an index — return that value.
  if (lower === upper) return sorted[lower];

  // Otherwise, linearly interpolate between the two neighbors.
  // This is the standard "linear" percentile method (matches numpy's default).
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
