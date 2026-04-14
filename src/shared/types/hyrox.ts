// Raw row as it comes out of the CSV — all strings.
// Column order matches the actual CSV headers.
export interface RawHyroxRow {
  event_id: string;
  event_name: string;
  gender: string;
  nationality: string;
  age_group: string;
  division: string;
  total_time: string;
  work_time: string;
  roxzone_time: string;
  run_time: string;
  run_1: string;
  work_1: string;
  roxzone_1: string;
  run_2: string;
  work_2: string;
  roxzone_2: string;
  run_3: string;
  work_3: string;
  roxzone_3: string;
  run_4: string;
  work_4: string;
  roxzone_4: string;
  run_5: string;
  work_5: string;
  roxzone_5: string;
  run_6: string;
  work_6: string;
  roxzone_6: string;
  run_7: string;
  work_7: string;
  roxzone_7: string;
  run_8: string;
  work_8: string;
  roxzone_8: string;
}

// Narrowed literal types for categorical fields.
export type Division = "open" | "pro" | "doubles" | "relay";
export type Gender = "male" | "female";

// Parsed, clean version we use in the app.
// All times are in seconds (numbers), categoricals are narrowed.
export interface HyroxResult {
  eventId: string;
  eventName: string;
  gender: Gender;
  nationality: string;
  ageGroup: string;
  division: Division;
  totalTime: number;
  workTime: number;
  roxzoneTime: number;
  runTime: number;
  runs: number[];      // length 8
  works: number[];     // length 8
  roxzones: number[];  // length 8 (last one is always 0)
}