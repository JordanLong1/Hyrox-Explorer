import type { HyroxResult } from '../types/hyrox';

/**
 * Returns the median of a numeric array.
 * Empty arrays return 0 — callers should check sample size separately
 * if they want to distinguish "no data" from "real zero".
 */
export function median(values: number[]): number {
  if (values.length === 0) return 0;

  // Filter out zeros — in our dataset, 0 means "missing split", not a real time.
  // Including zeros would drag medians down artificially.
  const valid = values.filter((v) => v > 0);
  if (valid.length === 0) return 0;

  // Sort a copy so we don't mutate the caller's array.
  const sorted = [...valid].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  // Even-length arrays: average the two middle values.
  // Odd-length arrays: return the single middle value.
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
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
