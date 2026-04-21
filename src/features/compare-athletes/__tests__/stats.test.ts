import { describe, it, expect } from 'vitest';
import {
  athleteKey,
  segmentTime,
  relativeSummary,
  pickSeedAthletes,
  SEGMENT_ORDER,
} from '../stats';
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

describe('athleteKey', () => {
  it('produces a pipe-delimited composite key', () => {
    const r = makeResult();
    const key = athleteKey(r, 0);
    expect(key).toContain('|');
    expect(key.split('|')).toHaveLength(7);
  });

  it('includes the row index for uniqueness', () => {
    const r = makeResult();
    expect(athleteKey(r, 0)).not.toBe(athleteKey(r, 1));
  });

  it('differs for different events', () => {
    const r1 = makeResult({ eventId: 'evt-1' });
    const r2 = makeResult({ eventId: 'evt-2' });
    expect(athleteKey(r1, 0)).not.toBe(athleteKey(r2, 0));
  });
});

describe('SEGMENT_ORDER', () => {
  it('has 16 segments (8 runs + 8 stations)', () => {
    expect(SEGMENT_ORDER).toHaveLength(16);
  });

  it('alternates run/station', () => {
    SEGMENT_ORDER.forEach((seg, i) => {
      expect(seg.kind).toBe(i % 2 === 0 ? 'run' : 'station');
    });
  });
});

describe('segmentTime', () => {
  it('returns the correct run time', () => {
    const r = makeResult();
    expect(segmentTime(r, { label: 'Run 1', kind: 'run', slot: 0 })).toBe(300);
    expect(segmentTime(r, { label: 'Run 8', kind: 'run', slot: 7 })).toBe(370);
  });

  it('returns the correct station time', () => {
    const r = makeResult();
    expect(segmentTime(r, { label: 'SkiErg', kind: 'station', slot: 0 })).toBe(200);
    expect(segmentTime(r, { label: 'Wall Balls', kind: 'station', slot: 7 })).toBe(270);
  });
});

describe('relativeSummary', () => {
  it('returns nulls when there is only one athlete', () => {
    const r = makeResult();
    const result = relativeSummary(r, [r]);
    expect(result.best).toBeNull();
    expect(result.worst).toBeNull();
  });

  it('identifies best and worst segments relative to group', () => {
    // Athlete A: fast at Run 1 (100), slow at Run 2 (500)
    const a = makeResult({
      runs: [100, 500, 300, 300, 300, 300, 300, 300],
      works: [200, 200, 200, 200, 200, 200, 200, 200],
    });
    // Athlete B: even splits
    const b = makeResult({
      runs: [300, 300, 300, 300, 300, 300, 300, 300],
      works: [200, 200, 200, 200, 200, 200, 200, 200],
    });

    const result = relativeSummary(a, [a, b]);
    // Best: Run 1 where A is 100 vs B's 300 → delta = -200
    expect(result.best).not.toBeNull();
    expect(result.best!.label).toBe('Run 1');
    expect(result.best!.delta).toBe(-200);
    // Worst: Run 2 where A is 500 vs B's 300 → delta = +200
    expect(result.worst).not.toBeNull();
    expect(result.worst!.label).toBe('Run 2');
    expect(result.worst!.delta).toBe(200);
  });

  it('skips segments with zero times', () => {
    const a = makeResult({
      runs: [0, 300, 300, 300, 300, 300, 300, 300],
    });
    const b = makeResult({
      runs: [300, 300, 300, 300, 300, 300, 300, 300],
    });
    const result = relativeSummary(a, [a, b]);
    // Run 1 should be skipped for athlete A since their time is 0
    if (result.best) {
      expect(result.best.label).not.toBe('Run 1');
    }
  });
});

describe('pickSeedAthletes', () => {
  it('returns empty array for empty dataset', () => {
    expect(pickSeedAthletes([])).toEqual([]);
  });

  it('returns empty array when no M-Open results exist', () => {
    const results = [
      makeResult({ gender: 'female', division: 'open' }),
      makeResult({ gender: 'male', division: 'pro' }),
    ];
    expect(pickSeedAthletes(results)).toEqual([]);
  });

  it('picks two athletes from the largest M-Open event', () => {
    // Create 60 M-Open athletes at one event
    const results = Array.from({ length: 60 }, (_, i) =>
      makeResult({
        eventId: 'evt-big',
        totalTime: 3600 + i * 60,
      }),
    );
    const picks = pickSeedAthletes(results);
    expect(picks).toHaveLength(2);
    // First pick should be the fastest
    expect(picks[0].result.totalTime).toBe(3600);
    // Second pick should be ~50th place
    expect(picks[1].result.totalTime).toBe(3600 + 49 * 60);
  });

  it('returns one athlete if event has fewer than 2 distinct athletes', () => {
    const results = [makeResult({ eventId: 'evt-small', totalTime: 5000 })];
    const picks = pickSeedAthletes(results);
    expect(picks).toHaveLength(1);
  });
});
