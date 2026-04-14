/**
 * Returns the value at a given percentile from a pre-sorted array of valid
 * (non-zero, non-missing) values. Use this when you need multiple percentiles
 * from the same dataset and want to avoid re-sorting.
 *
 * Assumes the input is already sorted ascending and pre-filtered.
 * Use `percentile()` for the convenient one-shot version.
 */
export function percentileFromSorted(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  if (Number.isNaN(p)) return 0;

  const clamped = Math.min(1, Math.max(0, p));
  const index = (sorted.length - 1) * clamped;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);

  if (lower === upper) return sorted[lower];

  const weight = index - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

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
  if (values.length === 0) return 0;
  const valid = values.filter((v) => v > 0);
  if (valid.length === 0) return 0;
  const sorted = [...valid].sort((a, b) => a - b);
  return percentileFromSorted(sorted, p);
}

/**
 * Returns the median (50th percentile) of a numeric array.
 * Thin wrapper around `percentile` for readability at call sites.
 */
export function median(values: number[]): number {
  return percentile(values, 0.5);
}
