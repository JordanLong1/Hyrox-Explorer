import { median } from '@/shared/lib/stats';
import { parseEventName } from '@/shared/lib/eventName';
import type { Division, Gender, HyroxResult } from '@/shared/types/hyrox';

/**
 * Per-event aggregate used by the Trends view.
 *
 * `season` and `city` are parsed from `eventName`, which follows the format
 * "S<season> <year> <city>" (e.g. "S6 2023 München"). If parsing fails we
 * fall back to season 0 and the full name as city — the event still shows up,
 * just at the start of the sort order, so the bug is visible rather than silent.
 */
export interface EventStat {
  eventId: string;
  eventName: string;
  season: number;
  city: string;
  medianFinish: number; // seconds
  finisherCount: number;
}

export interface EventStatsFilters {
  gender: Gender;
  division: Division;
  minFinishers: number;
}

/**
 * Aggregates results into per-event stats after applying gender/division filters.
 * Events with fewer than `minFinishers` in the filtered slice are dropped
 * (a small field produces a noisy median that misleads the trend line).
 *
 * Output is sorted by season ascending, then city alphabetically within season.
 * This is the Trends chart's x-axis order — as close to chronological as we
 * can get without real dates.
 */
export function eventStats(
  results: HyroxResult[],
  filters: EventStatsFilters,
): EventStat[] {
  const { gender, division, minFinishers } = filters;

  const byEvent = new Map<string, HyroxResult[]>();
  for (const r of results) {
    if (r.gender !== gender) continue;
    if (r.division !== division) continue;
    const bucket = byEvent.get(r.eventId);
    if (bucket) bucket.push(r);
    else byEvent.set(r.eventId, [r]);
  }

  const stats: EventStat[] = [];
  for (const [eventId, rows] of byEvent) {
    if (rows.length < minFinishers) continue;
    const { season, city } = parseEventName(rows[0].eventName);
    stats.push({
      eventId,
      eventName: rows[0].eventName,
      season,
      city,
      medianFinish: median(rows.map((r) => r.totalTime)),
      finisherCount: rows.length,
    });
  }

  stats.sort((a, b) => {
    if (a.season !== b.season) return a.season - b.season;
    return a.city.localeCompare(b.city);
  });

  return stats;
}

/**
 * Summary across all events for a single season — powers the three cards
 * at the top of the Trends page. Uses the same filtered population as
 * `eventStats`, so cards and charts tell one consistent story.
 *
 * `medianFinish` is the median across every individual finisher in the
 * season (not the median of per-event medians) — a single big event shouldn't
 * be weighted the same as a tiny one for a "what's the typical finish" stat.
 */
export interface SeasonSummary {
  season: number;
  medianFinish: number;
  finisherCount: number;
}

export function seasonSummaries(
  results: HyroxResult[],
  filters: Omit<EventStatsFilters, 'minFinishers'>,
): SeasonSummary[] {
  const { gender, division } = filters;
  const bySeason = new Map<number, number[]>();

  for (const r of results) {
    if (r.gender !== gender) continue;
    if (r.division !== division) continue;
    const { season } = parseEventName(r.eventName);
    const bucket = bySeason.get(season);
    if (bucket) bucket.push(r.totalTime);
    else bySeason.set(season, [r.totalTime]);
  }

  const summaries: SeasonSummary[] = [];
  for (const [season, times] of bySeason) {
    summaries.push({
      season,
      medianFinish: median(times),
      finisherCount: times.length,
    });
  }

  summaries.sort((a, b) => a.season - b.season);
  return summaries;
}
