import { describe, it, expect } from 'vitest';
import { formatTime, formatDuration, formatSignedDelta } from '../time';

describe('formatTime', () => {
  it('returns "—" for zero (missing data)', () => {
    expect(formatTime(0)).toBe('—');
  });

  it('returns "—" for negative values', () => {
    expect(formatTime(-1)).toBe('—');
    expect(formatTime(-100)).toBe('—');
  });

  it('formats seconds under a minute', () => {
    expect(formatTime(45)).toBe('0:45');
  });

  it('formats minutes and seconds', () => {
    expect(formatTime(218)).toBe('3:38');
  });

  it('formats hours, minutes, and seconds', () => {
    expect(formatTime(5400)).toBe('1:30:00');
  });

  it('pads seconds with leading zero', () => {
    expect(formatTime(61)).toBe('1:01');
  });
});

describe('formatDuration', () => {
  it('formats zero as "0:00" (real value, not missing)', () => {
    expect(formatDuration(0)).toBe('0:00');
  });

  it('clamps negative values to zero', () => {
    expect(formatDuration(-10)).toBe('0:00');
  });

  it('formats seconds under a minute', () => {
    expect(formatDuration(5)).toBe('0:05');
  });

  it('formats minutes and seconds', () => {
    expect(formatDuration(218)).toBe('3:38');
  });

  it('formats hours with padded minutes and seconds', () => {
    expect(formatDuration(5400)).toBe('1:30:00');
    expect(formatDuration(3661)).toBe('1:01:01');
  });

  it('rounds fractional seconds', () => {
    expect(formatDuration(59.6)).toBe('1:00');
    expect(formatDuration(59.4)).toBe('0:59');
  });
});

describe('formatSignedDelta', () => {
  it('formats zero with ± prefix', () => {
    expect(formatSignedDelta(0)).toBe('±0:00');
  });

  it('formats positive deltas with + prefix', () => {
    expect(formatSignedDelta(60)).toBe('+1:00');
    expect(formatSignedDelta(91)).toBe('+1:31');
  });

  it('formats negative deltas with Unicode minus (−)', () => {
    expect(formatSignedDelta(-90)).toBe('−1:30');
    expect(formatSignedDelta(-5)).toBe('−0:05');
  });

  it('uses Unicode minus (U+2212), not hyphen-minus', () => {
    const result = formatSignedDelta(-60);
    expect(result[0]).toBe('\u2212');
    expect(result[0]).not.toBe('-');
  });

  it('rounds fractional seconds', () => {
    expect(formatSignedDelta(0.4)).toBe('±0:00');
    expect(formatSignedDelta(0.6)).toBe('+0:01');
  });
});
