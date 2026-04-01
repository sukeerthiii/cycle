import Dexie, { type EntityTable } from "dexie";

export interface CycleLogRow {
  id?: number;
  periodStartDate: string;
  periodEndDate: string | null;
  cycleLength: number;
  periodLength: number;
}

export interface DailyLogRow {
  id?: number;
  date: string;
  phase: string;
  sections: string; // JSON-serialized WorkoutSection[]
  steps: number | null;
  skipReason: string | null;
  suggestedWorkout: string | null; // JSON
  plannedWorkout: string | null; // JSON
}

export interface ExerciseRow {
  id?: string;
  name: string;
  category: string;
  movementPattern: string | null;
  isCustom: boolean;
}

export interface SettingsRow {
  key: string;
  value: string;
}

export const db = new Dexie("CycleDB") as Dexie & {
  cycleLogs: EntityTable<CycleLogRow, "id">;
  dailyLogs: EntityTable<DailyLogRow, "id">;
  exercises: EntityTable<ExerciseRow, "id">;
  settings: EntityTable<SettingsRow, "key">;
};

db.version(1).stores({
  cycleLogs: "++id, periodStartDate",
  dailyLogs: "++id, &date, phase",
  exercises: "id, name, category, movementPattern",
  settings: "key",
});
