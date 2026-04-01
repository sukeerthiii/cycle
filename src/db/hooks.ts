import { useLiveQuery } from "dexie-react-hooks";
import { db, type CycleLogRow, type DailyLogRow } from "./database";
import type { WorkoutSection, Phase } from "../models/types";

// ── Cycle logs ──

export function useCycleLogs() {
  return useLiveQuery(() =>
    db.cycleLogs.orderBy("periodStartDate").reverse().toArray()
  );
}

export function useLatestCycleLog() {
  return useLiveQuery(() =>
    db.cycleLogs.orderBy("periodStartDate").reverse().first()
  );
}

export async function addCycleLog(log: Omit<CycleLogRow, "id">) {
  return db.cycleLogs.add(log);
}

export async function updateCycleLog(id: number, changes: Partial<CycleLogRow>) {
  return db.cycleLogs.update(id, changes);
}

// ── Daily logs ──

export function useDailyLog(date: string) {
  return useLiveQuery(() => db.dailyLogs.where("date").equals(date).first(), [date]);
}

export function useDailyLogs(startDate?: string, endDate?: string) {
  return useLiveQuery(() => {
    if (startDate && endDate) {
      return db.dailyLogs
        .where("date")
        .between(startDate, endDate, true, true)
        .toArray();
    }
    return db.dailyLogs.orderBy("date").reverse().toArray();
  }, [startDate, endDate]);
}

function parseSections(row: DailyLogRow): WorkoutSection[] {
  try {
    return JSON.parse(row.sections) as WorkoutSection[];
  } catch {
    return [];
  }
}

export function getDailyLogSections(row: DailyLogRow): WorkoutSection[] {
  return parseSections(row);
}

export async function upsertDailyLog(
  date: string,
  phase: Phase,
  updates: {
    section?: WorkoutSection;
    steps?: number | null;
    skipReason?: string | null;
  }
) {
  const existing = await db.dailyLogs.where("date").equals(date).first();

  if (existing) {
    const sections = parseSections(existing);
    if (updates.section) {
      sections.push(updates.section);
    }
    await db.dailyLogs.update(existing.id!, {
      sections: JSON.stringify(sections),
      ...(updates.steps !== undefined && { steps: updates.steps }),
      ...(updates.skipReason !== undefined && { skipReason: updates.skipReason }),
    });
  } else {
    await db.dailyLogs.add({
      date,
      phase,
      sections: JSON.stringify(updates.section ? [updates.section] : []),
      steps: updates.steps ?? null,
      skipReason: updates.skipReason ?? null,
      suggestedWorkout: null,
      plannedWorkout: null,
    });
  }
}

export async function updateDailyLogSteps(date: string, phase: Phase, steps: number | null) {
  const existing = await db.dailyLogs.where("date").equals(date).first();
  if (existing) {
    await db.dailyLogs.update(existing.id!, { steps });
  } else {
    await db.dailyLogs.add({
      date,
      phase,
      sections: "[]",
      steps,
      skipReason: null,
      suggestedWorkout: null,
      plannedWorkout: null,
    });
  }
}

export async function replaceDailyLogSections(
  date: string,
  sections: WorkoutSection[]
) {
  const existing = await db.dailyLogs.where("date").equals(date).first();
  if (existing) {
    await db.dailyLogs.update(existing.id!, {
      sections: JSON.stringify(sections),
    });
  }
}

export async function replaceSectionInDailyLog(
  date: string,
  sectionIndex: number,
  newSection: WorkoutSection
) {
  const existing = await db.dailyLogs.where("date").equals(date).first();
  if (!existing) return;
  const sections = parseSections(existing);
  sections[sectionIndex] = newSection;
  await db.dailyLogs.update(existing.id!, {
    sections: JSON.stringify(sections),
  });
}

export async function deleteSectionFromDailyLog(
  date: string,
  sectionIndex: number
) {
  const existing = await db.dailyLogs.where("date").equals(date).first();
  if (!existing) return;
  const sections = parseSections(existing);
  sections.splice(sectionIndex, 1);
  await db.dailyLogs.update(existing.id!, {
    sections: JSON.stringify(sections),
  });
}

export async function savePlannedWorkout(
  date: string,
  phase: Phase,
  type: string,
  notes: string
) {
  const planned = JSON.stringify({ type, notes: notes || null });
  const existing = await db.dailyLogs.where("date").equals(date).first();
  if (existing) {
    await db.dailyLogs.update(existing.id!, { plannedWorkout: planned });
  } else {
    await db.dailyLogs.add({
      date,
      phase,
      sections: "[]",
      steps: null,
      skipReason: null,
      suggestedWorkout: null,
      plannedWorkout: planned,
    });
  }
}

// ── Settings ──

export function useSetting(key: string) {
  return useLiveQuery(() => db.settings.get(key), [key]);
}

export async function setSetting(key: string, value: string) {
  await db.settings.put({ key, value });
}

export async function isOnboarded(): Promise<boolean> {
  const val = await db.settings.get("onboarded");
  return val?.value === "true";
}

// ── Exercises ──

export function useExercises() {
  return useLiveQuery(() => db.exercises.toArray());
}

export async function addExercise(exercise: {
  id: string;
  name: string;
  category: string;
  movementPattern: string | null;
  isCustom: boolean;
}) {
  return db.exercises.put(exercise);
}
