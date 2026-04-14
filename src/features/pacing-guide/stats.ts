import { median, percentileFromSorted } from '@/shared/lib/stats';
import type { HyroxResult } from '@/shared/types/hyrox';

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
    // Sort once for this station, then read three percentiles from it.
    const sorted = results
      .map((r) => r.works[i])
      .filter((v) => v > 0)
      .sort((a, b) => a - b);

    return {
      index: i,
      p25: percentileFromSorted(sorted, 0.25),
      median: percentileFromSorted(sorted, 0.5),
      p75: percentileFromSorted(sorted, 0.75),
    };
  });
}
