import { describe, it, expect } from 'vitest';
import { percentileFromSorted, percentile, median } from '../stats';

describe('percentileFromSorted', () => {
  it('returns 0 for an empty array', () => {
    expect(percentileFromSorted([], 0.5)).toBe(0);
  });

  it('returns 0 for NaN percentile', () => {
    expect(percentileFromSorted([1, 2, 3], NaN)).toBe(0);
  });

  it('returns the single value for a one-element array', () => {
    expect(percentileFromSorted([42], 0.5)).toBe(42);
    expect(percentileFromSorted([42], 0)).toBe(42);
    expect(percentileFromSorted([42], 1)).toBe(42);
  });

  it('returns exact values at boundary percentiles', () => {
    const sorted = [10, 20, 30, 40, 50];
    expect(percentileFromSorted(sorted, 0)).toBe(10);
    expect(percentileFromSorted(sorted, 1)).toBe(50);
  });

  it('returns the median for an odd-length array', () => {
    expect(percentileFromSorted([10, 20, 30], 0.5)).toBe(20);
  });

  it('interpolates for an even-length array at p=0.5', () => {
    expect(percentileFromSorted([10, 20, 30, 40], 0.5)).toBe(25);
  });

  it('interpolates between values at non-boundary percentiles', () => {
    // [10, 20, 30, 40, 50] at p=0.25 → index 1.0 → 20
    expect(percentileFromSorted([10, 20, 30, 40, 50], 0.25)).toBe(20);
    // [10, 20, 30, 40, 50] at p=0.75 → index 3.0 → 40
    expect(percentileFromSorted([10, 20, 30, 40, 50], 0.75)).toBe(40);
  });

  it('clamps out-of-range percentiles', () => {
    const sorted = [10, 20, 30];
    expect(percentileFromSorted(sorted, -1)).toBe(10);
    expect(percentileFromSorted(sorted, 2)).toBe(30);
  });
});

describe('percentile', () => {
  it('returns 0 for an empty array', () => {
    expect(percentile([], 0.5)).toBe(0);
  });

  it('returns 0 when all values are zero (missing data)', () => {
    expect(percentile([0, 0, 0], 0.5)).toBe(0);
  });

  it('returns 0 when all values are negative', () => {
    expect(percentile([-1, -5, -10], 0.5)).toBe(0);
  });

  it('filters out zeros and negatives before computing', () => {
    // Only valid values: [10, 30]
    expect(percentile([0, 10, -5, 30, 0], 0.5)).toBe(20);
  });

  it('computes the correct median for known values', () => {
    expect(percentile([100, 200, 300], 0.5)).toBe(200);
  });

  it('handles unsorted input', () => {
    expect(percentile([300, 100, 200], 0.5)).toBe(200);
  });
});

describe('median', () => {
  it('returns 0 for an empty array', () => {
    expect(median([])).toBe(0);
  });

  it('returns the middle value for odd-length arrays', () => {
    expect(median([5, 15, 10])).toBe(10);
  });

  it('returns the interpolated midpoint for even-length arrays', () => {
    expect(median([10, 20, 30, 40])).toBe(25);
  });
});
