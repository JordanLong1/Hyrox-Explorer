import { STATION_NAMES } from '@/shared/lib/stations';
import { formatTime } from '@/shared/lib/time';
import { parseEventName } from '@/shared/lib/eventName';
import type { HyroxResult } from '@/shared/types/hyrox';

/**
 * The dataset has no athlete names, so we build a composite key from fields
 * that together almost always identify a unique row. eventId + totalTime is
 * ~99% unique on its own; the rest of the fields handle genuine ties, and
 * `rowIndex` is the final tiebreaker for rows that match on everything else
 * (same event, same time, same demographics — rare but possible).
 *
 * The row index refers to the position in the loaded results array, which is
 * stable across renders because the CSV is loaded once at boot.
 */
export function athleteKey(r: HyroxResult, rowIndex: number): string {
  return [
    r.eventId,
    r.totalTime,
    r.division,
    r.gender,
    r.ageGroup,
    r.nationality,
    rowIndex,
  ].join('|');
}

/**
 * Human-readable label for an athlete. Finish time leads because that's what
 * users pattern-match on when scanning a list of selected athletes.
 * Example: "1:28:42 · S6 London · M Open 30-34 · GBR"
 */
export function formatAthleteLabel(r: HyroxResult): string {
  const { season, city } = parseEventName(r.eventName);
  const seasonCity = season > 0 ? `S${season} ${city}` : r.eventName;
  const genderShort = r.gender === 'male' ? 'M' : 'F';
  const division = r.division[0].toUpperCase() + r.division.slice(1);
  const nationality = r.nationality?.trim() || '—';

  return `${formatTime(r.totalTime)} · ${seasonCity} · ${genderShort} ${division} ${r.ageGroup} · ${nationality}`;
}

/**
 * Shorter label used inside chips and the comparison chart tooltip, where
 * the full label would wrap. Drops age group and nationality.
 * Example: "1:28:42 · S6 London · M Open"
 */
export function formatAthleteShortLabel(r: HyroxResult): string {
  const { season, city } = parseEventName(r.eventName);
  const seasonCity = season > 0 ? `S${season} ${city}` : r.eventName;
  const genderShort = r.gender === 'male' ? 'M' : 'F';
  const division = r.division[0].toUpperCase() + r.division.slice(1);
  return `${formatTime(r.totalTime)} · ${seasonCity} · ${genderShort} ${division}`;
}

/**
 * Race segment order: Run 1, SkiErg, Run 2, Sled Push, … Run 8, Wall Balls.
 * Used by the comparison chart so we can zip athletes' splits into a single
 * x-axis of 16 ordered segments.
 */
export interface SegmentPosition {
  label: string;
  kind: 'run' | 'station';
  /** 0-7 — which run/station slot this is. */
  slot: number;
}

export const SEGMENT_ORDER: SegmentPosition[] = Array.from(
  { length: 8 },
  (_, i) => [
    { label: `Run ${i + 1}`, kind: 'run' as const, slot: i },
    { label: STATION_NAMES[i], kind: 'station' as const, slot: i },
  ],
).flat();

export function segmentTime(r: HyroxResult, pos: SegmentPosition): number {
  return pos.kind === 'run' ? r.runs[pos.slot] : r.works[pos.slot];
}

/**
 * Best and worst segment for an athlete *relative to the selected group*,
 * measured by delta vs. the group's median at that segment. "Best" = where
 * this athlete beat the group median by the most; "worst" = where they lost
 * the most time. This is more interesting than best/worst absolute times
 * (which would always be "a run" and "sled push" for everyone).
 *
 * Returns nulls when there's only one athlete (no group to compare against)
 * or when all segment times at that position are 0 (missing data).
 */
export interface RelativeSegment {
  label: string;
  delta: number; // seconds ahead of (negative) or behind (positive) the group median
  own: number;
}

export interface RelativeSummary {
  best: RelativeSegment | null;
  worst: RelativeSegment | null;
}

export function relativeSummary(
  own: HyroxResult,
  group: HyroxResult[],
): RelativeSummary {
  const comparisonGroup = group.filter((g) => g !== own);
  if (comparisonGroup.length < 1) return { best: null, worst: null };

  let best: RelativeSegment | null = null;
  let worst: RelativeSegment | null = null;

  for (const pos of SEGMENT_ORDER) {
    const ownTime = segmentTime(own, pos);
    if (ownTime <= 0) continue;

    const groupTimes = comparisonGroup
      .map((g) => segmentTime(g, pos))
      .filter((t) => t > 0);
    if (groupTimes.length < 1) continue;

    const groupMedian = medianOf(groupTimes);
    const delta = ownTime - groupMedian;

    if (best === null || delta < best.delta) {
      best = { label: pos.label, delta, own: ownTime };
    }
    if (worst === null || delta > worst.delta) {
      worst = { label: pos.label, delta, own: ownTime };
    }
  }

  return { best, worst };
}

function medianOf(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

/**
 * Picks two demonstrative athletes from the loaded dataset to pre-seed the
 * comparison on first load. Chooses the largest M-Open event by finisher
 * count, then the 1st-place finisher and someone ~50 places back. This gives
 * the chart visible (but not absurd) differences out of the gate — an elite
 * vs. a strong age-grouper.
 *
 * Returns fewer than two picks only if the dataset is unexpectedly small.
 */
export function pickSeedAthletes(
  results: HyroxResult[],
): Array<{ result: HyroxResult; rowIndex: number }> {
  // Count M-Open finishers per event, track biggest.
  const counts = new Map<string, number>();
  for (const r of results) {
    if (r.gender !== 'male' || r.division !== 'open') continue;
    counts.set(r.eventId, (counts.get(r.eventId) ?? 0) + 1);
  }
  if (counts.size === 0) return [];

  let bestEventId = '';
  let bestCount = -1;
  for (const [id, count] of counts) {
    if (count > bestCount) {
      bestEventId = id;
      bestCount = count;
    }
  }

  // Collect M-Open rows at that event alongside their original indices so
  // we can build stable athlete keys later.
  const rows: Array<{ result: HyroxResult; rowIndex: number }> = [];
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    if (
      r.eventId === bestEventId &&
      r.gender === 'male' &&
      r.division === 'open'
    ) {
      rows.push({ result: r, rowIndex: i });
    }
  }

  rows.sort((a, b) => a.result.totalTime - b.result.totalTime);
  const first = rows[0];
  const fifty = rows[Math.min(49, rows.length - 1)];
  if (!first) return [];
  if (!fifty || fifty === first) return [first];
  return [first, fifty];
}
