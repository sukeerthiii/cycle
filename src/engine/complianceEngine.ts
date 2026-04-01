import type { Phase, WorkoutSection } from "../models/types";
import { db } from "../db/database";
import { calculatePhase } from "./phaseEngine";

interface ComplianceResult {
  score: number; // 0-100
  totalDays: number;
  compliantDays: number;
  details: string;
}

export async function calculateCompliance(
  periodStartDate: string,
  cycleLength: number,
  periodLength: number
): Promise<ComplianceResult> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0]!;

  const { cycleDay } = calculatePhase(periodStartDate, cycleLength, periodLength);
  const daysToCheck = cycleDay - 1; // don't count today

  if (daysToCheck <= 0) {
    return { score: 100, totalDays: 0, compliantDays: 0, details: "Cycle just started." };
  }

  let compliantDays = 0;
  let totalDays = 0;

  for (let d = 1; d < cycleDay; d++) {
    const date = new Date(periodStartDate + "T00:00:00");
    date.setDate(date.getDate() + d - 1);
    const dateStr = date.toISOString().split("T")[0]!;
    if (dateStr >= todayStr) break;

    const phase = calculatePhase(periodStartDate, cycleLength, periodLength, dateStr).phase;
    const log = await db.dailyLogs.where("date").equals(dateStr).first();
    const sections = parseSections(log?.sections);
    const hasStrength = sections.some((s) => s.type === "strength");
    const hasAny = sections.length > 0;

    totalDays++;

    if (isCompliant(phase, hasStrength, hasAny)) {
      compliantDays++;
    }
  }

  const score = totalDays > 0 ? Math.round((compliantDays / totalDays) * 100) : 100;

  return {
    score,
    totalDays,
    compliantDays,
    details: `${compliantDays} of ${totalDays} days in rhythm.`,
  };
}

function isCompliant(phase: Phase, hasStrength: boolean, hasAny: boolean): boolean {
  switch (phase) {
    case "menstrual":
      // Should NOT do strength. Walking/mobility/rest is fine.
      return !hasStrength;
    case "follicular":
    case "ovulatory":
      // Should be training or actively resting (not just skipping)
      return hasAny;
    case "luteal":
      // Training or rest are both fine
      return true;
    default:
      return true;
  }
}

function parseSections(raw: string | undefined): WorkoutSection[] {
  if (!raw) return [];
  try {
    return JSON.parse(raw) as WorkoutSection[];
  } catch {
    return [];
  }
}
