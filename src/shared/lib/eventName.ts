/**
 * Event names in the dataset follow the format "S<season> <year> <city>",
 * e.g. "S6 2023 München". Parsing lets us sort by numeric season + city
 * rather than a raw string compare (which breaks once seasons reach 10+).
 *
 * If the name doesn't match, we return `season: 0` and fall back to the full
 * name as city — the event still shows up at the start of the sort order,
 * so the parse failure is visible rather than silent.
 */
export interface ParsedEventName {
  season: number;
  city: string;
}

export function parseEventName(name: string): ParsedEventName {
  const match = name.match(/^S(\d+)\s+\d+\s+(.+)$/);
  if (!match) return { season: 0, city: name };
  return { season: Number(match[1]), city: match[2].trim() };
}

/**
 * Ascending comparator for event names: numeric season, then city A→Z.
 */
export function compareByEventName(a: string, b: string): number {
  const pa = parseEventName(a);
  const pb = parseEventName(b);
  if (pa.season !== pb.season) return pa.season - pb.season;
  return pa.city.localeCompare(pb.city);
}
