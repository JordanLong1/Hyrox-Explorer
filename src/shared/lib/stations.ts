/**
 * The 8 Hyrox work stations in race order. The i-th entry maps to
 * `HyroxResult.works[i]` (and to CSV columns `work_1` … `work_8`).
 */
export const STATION_NAMES = [
  'SkiErg',
  'Sled Push',
  'Sled Pull',
  'Burpees',
  'Rowing',
  'Farmers Carry',
  'Lunges',
  'Wall Balls',
] as const;

export type StationName = (typeof STATION_NAMES)[number];
