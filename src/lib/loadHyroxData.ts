import Papa from "papaparse";
import type {
  RawHyroxRow,
  HyroxResult,
  Division,
  Gender,
} from "../types/hyrox";

// Convert "H:MM:SS" to seconds. Returns 0 for empty/invalid.
// We use 0 rather than null so downstream math doesn't need null checks —
// a missing split will just contribute nothing to medians.
function parseTime(value: string): number {
  if (!value || value.trim() === "") return 0;
  const parts = value.split(":").map(Number);
  if (parts.some(isNaN)) return 0;

  // Handle both "H:MM:SS" and "MM:SS" just in case
  if (parts.length === 3) {
    const [h, m, s] = parts;
    return h * 3600 + m * 60 + s;
  }
  if (parts.length === 2) {
    const [m, s] = parts;
    return m * 60 + s;
  }
  return 0;
}

// Narrow a raw string to a Division, or return null if it doesn't match.
// The `as Division` cast is safe because we checked membership first.
function parseDivision(value: string): Division | null {
  const valid: Division[] = ["open", "pro", "doubles", "relay"];
  const normalized = value.trim().toLowerCase();
  return valid.includes(normalized as Division)
    ? (normalized as Division)
    : null;
}

function parseGender(value: string): Gender | null {
  const normalized = value.trim().toLowerCase();
  if (normalized === "male" || normalized === "female") return normalized;
  return null;
}

// Transform one raw row into a clean HyroxResult.
// Returns null if the row has bad data we can't recover from — the caller
// filters these out. This is nicer than throwing because one bad row
// shouldn't kill the whole dataset.
function transformRow(raw: RawHyroxRow): HyroxResult | null {
  const division = parseDivision(raw.division);
  const gender = parseGender(raw.gender);
  if (!division || !gender) return null;

  const totalTime = parseTime(raw.total_time);
  if (totalTime === 0) return null; // no finish time = useless row

  return {
    eventId: raw.event_id,
    eventName: raw.event_name,
    gender,
    nationality: raw.nationality,
    ageGroup: raw.age_group,
    division,
    totalTime,
    workTime: parseTime(raw.work_time),
    roxzoneTime: parseTime(raw.roxzone_time),
    runTime: parseTime(raw.run_time),
    runs: [
      parseTime(raw.run_1),
      parseTime(raw.run_2),
      parseTime(raw.run_3),
      parseTime(raw.run_4),
      parseTime(raw.run_5),
      parseTime(raw.run_6),
      parseTime(raw.run_7),
      parseTime(raw.run_8),
    ],
    works: [
      parseTime(raw.work_1),
      parseTime(raw.work_2),
      parseTime(raw.work_3),
      parseTime(raw.work_4),
      parseTime(raw.work_5),
      parseTime(raw.work_6),
      parseTime(raw.work_7),
      parseTime(raw.work_8),
    ],
    roxzones: [
      parseTime(raw.roxzone_1),
      parseTime(raw.roxzone_2),
      parseTime(raw.roxzone_3),
      parseTime(raw.roxzone_4),
      parseTime(raw.roxzone_5),
      parseTime(raw.roxzone_6),
      parseTime(raw.roxzone_7),
      parseTime(raw.roxzone_8),
    ],
  };
}

// Fetch and parse the CSV. Returns a promise that resolves to the clean results.
export async function loadHyroxData(): Promise<HyroxResult[]> {
  const response = await fetch("/data/hyrox_results.csv");
  if (!response.ok) {
    throw new Error(`Failed to fetch CSV: ${response.status}`);
  }
  const text = await response.text();

  const parsed = Papa.parse<RawHyroxRow>(text, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors.length > 0) {
    // Log but don't throw — PapaParse often flags minor issues we can ignore
    console.warn("CSV parse warnings:", parsed.errors.slice(0, 5));
  }

  const results: HyroxResult[] = [];
  for (const raw of parsed.data) {
    const clean = transformRow(raw);
    if (clean) results.push(clean);
  }

  return results;
}