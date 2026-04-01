import type { Phase } from "../models/types";

interface PhaseResult {
  phase: Phase;
  cycleDay: number;
  totalDays: number;
}

export function calculatePhase(
  lastPeriodStart: string,
  cycleLength: number,
  periodLength: number,
  today?: string
): PhaseResult {
  const start = new Date(lastPeriodStart + "T00:00:00");
  const now = today ? new Date(today + "T00:00:00") : new Date();
  now.setHours(0, 0, 0, 0);

  const diffMs = now.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  const cycleDay = (diffDays % cycleLength) + 1;

  const ovulatoryStart = Math.round(cycleLength * 0.45);
  const ovulatoryEnd = ovulatoryStart + 2;
  const lutealStart = ovulatoryEnd + 1;

  let phase: Phase;
  if (cycleDay <= periodLength) {
    phase = "menstrual";
  } else if (cycleDay < ovulatoryStart) {
    phase = "follicular";
  } else if (cycleDay <= ovulatoryEnd) {
    phase = "ovulatory";
  } else if (cycleDay <= cycleLength) {
    phase = "luteal";
  } else {
    phase = "luteal";
  }

  return { phase, cycleDay, totalDays: cycleLength };
}
