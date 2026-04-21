import { describe, it, expect } from 'vitest';
import { medianSplits, stationStats } from '../stats';
import type { HyroxResult } from '@/shared/types/hyrox';

function makeResult(overrides: Partial<HyroxResult> = {}): HyroxResult {
  return {
    eventId: 'evt-1',
    eventName: 'S6 2023 London',
    gender: 'male',
    nationality: 'GBR',
    ageGroup: '30-34',
    division: 'open',
    totalTime: 5400,
    workTime: 2400,
    roxzoneTime: 300,
    runTime: 2700,
    runs: [300, 310, 320, 330, 340, 350, 360, 370],
    works: [200, 210, 220, 230, 240, 250, 260, 270],
    roxzones: [40, 40, 40, 40, 40, 40, 40, 0],
    ...overrides,
  };
}

describe('medianSplits', () => {
  it('returns all-zero arrays for empty input', () => {
    const result = medianSplits([]);
    expect(result.runs).toEqual(new Array(8).fill(0));
    expect(result.works).toEqual(new Array(8).fill(0));
    expect(result.roxzones).toEqual(new Array(8).fill(0));
  });

  it('returns the values from a single result', () => {
    const r = makeResult();
    const result = medianSplits([r]);
    expect(result.runs).toEqual(r.runs);
    expect(result.works).toEqual(r.works);
  });

  it('computes the median across multiple results', () => {
    const r1 = makeResult({ runs: [100, 100, 100, 100, 100, 100, 100, 100] });
    const r2 = makeResult({ runs: [200, 200, 200, 200, 200, 200, 200, 200] });
    const r3 = makeResult({ runs: [300, 300, 300, 300, 300, 300, 300, 300] });
    const result = medianSplits([r1, r2, r3]);
    // Median of [100, 200, 300] = 200 for each position
    expect(result.runs).toEqual(new Array(8).fill(200));
  });

  it('always returns arrays of length 8', () => {
    const result = medianSplits([makeResult()]);
    expect(result.runs).toHaveLength(8);
    expect(result.works).toHaveLength(8);
    expect(result.roxzones).toHaveLength(8);
  });
});

describe('stationStats', () => {
  it('returns 8 stations with zero values for empty input', () => {
    const result = stationStats([]);
    expect(result).toHaveLength(8);
    result.forEach((s, i) => {
      expect(s.index).toBe(i);
      expect(s.p25).toBe(0);
      expect(s.median).toBe(0);
      expect(s.p75).toBe(0);
    });
  });

  it('returns identical p25/median/p75 for a single result', () => {
    const r = makeResult();
    const result = stationStats([r]);
    result.forEach((s, i) => {
      expect(s.p25).toBe(r.works[i]);
      expect(s.median).toBe(r.works[i]);
      expect(s.p75).toBe(r.works[i]);
    });
  });

  it('computes correct percentiles for known data', () => {
    // 5 athletes with station 0 times: [100, 200, 300, 400, 500]
    const results = [100, 200, 300, 400, 500].map((t) =>
      makeResult({ works: [t, t, t, t, t, t, t, t] }),
    );
    const result = stationStats(results);
    // p50 of [100,200,300,400,500] → index 2 → 300
    expect(result[0].median).toBe(300);
    // p25 → index 1 → 200
    expect(result[0].p25).toBe(200);
    // p75 → index 3 → 400
    expect(result[0].p75).toBe(400);
  });

  it('filters out zero station times (missing data)', () => {
    const r1 = makeResult({ works: [0, 200, 200, 200, 200, 200, 200, 200] });
    const r2 = makeResult({ works: [100, 200, 200, 200, 200, 200, 200, 200] });
    const result = stationStats([r1, r2]);
    // Station 0: only r2's value (100) is valid
    expect(result[0].median).toBe(100);
  });
});
