import type {
  Phase,
  WorkoutType,
  WorkoutSection,
  MovementPattern,
  SuggestedWorkout,
  SuggestedExercise,
} from "../models/types";
import { profile } from "../models/profile";
import { builtInExercises } from "../models/exercises";
import { db } from "../db/database";

const ALL_PATTERNS: MovementPattern[] = ["squat", "hinge", "lunge", "push", "pull", "core"];

interface RecentContext {
  todaySections: WorkoutSection[];
  weekSections: WorkoutSection[];
  weekStrengthCount: number;
  weekRestDays: number;
  yesterdayWasStrength: boolean;
  patternsHitThisWeek: Set<MovementPattern>;
  lastSessionForExercise: Map<string, { reps: number; weight: number | null }[]>;
}

export async function generateSuggestion(
  phase: Phase,
  cycleDay: number,
  today: string
): Promise<SuggestedWorkout> {
  const context = await buildContext(today);

  // Check for planned workout
  const dailyLog = await db.dailyLogs.where("date").equals(today).first();
  if (dailyLog?.plannedWorkout) {
    try {
      const plan = JSON.parse(dailyLog.plannedWorkout) as { type: string; notes: string | null };
      return buildPlannedSuggestion(plan.type as WorkoutType, plan.notes, phase, context);
    } catch { /* fall through to auto */ }
  }

  // Menstrual = rest/walks/mobility only
  if (phase === "menstrual") {
    return menstrualSuggestion(context, cycleDay);
  }

  // Already logged today? Don't double-suggest
  if (context.todaySections.some((s) => s.type === "strength")) {
    return restSuggestion("You've already trained today. Walk or rest.");
  }

  // Rest day logic: at least 2 rest days per week
  if (shouldRest(context, phase)) {
    return restSuggestion(getRestMessage(context));
  }

  // Strength suggestion
  if (context.weekStrengthCount < profile.strengthSessionsPerWeek) {
    return strengthSuggestion(phase, context);
  }

  // Hit weekly target — suggest pilates/yoga/walk
  return accessorySuggestion(phase);
}

function menstrualSuggestion(context: RecentContext, cycleDay: number): SuggestedWorkout {
  if (cycleDay <= 2) {
    return {
      type: "walk",
      focus: null,
      exercises: [],
      isRest: true,
      message: "Deload window. Your body is resetting. Walk, stretch, or do nothing.",
    };
  }
  if (context.todaySections.length > 0) {
    return restSuggestion("You've already moved today. Rest is the plan.");
  }
  const coin = cycleDay % 2;
  if (coin === 0) {
    return {
      type: "walk",
      focus: null,
      exercises: [],
      isRest: false,
      message: "A walk today keeps cortisol low and fat burning steady.",
    };
  }
  return {
    type: "mobility",
    focus: null,
    exercises: [],
    isRest: false,
    message: "Light mobility day. Foam roll, stretch, move gently.",
  };
}

function shouldRest(context: RecentContext, phase: Phase): boolean {
  const { weekStrengthCount, weekRestDays, yesterdayWasStrength } = context;

  // Minimum 2 rest days per week
  const daysLeftInWeek = 7 - (weekStrengthCount + weekRestDays);
  const restDaysNeeded = Math.max(0, 2 - weekRestDays);
  if (daysLeftInWeek <= restDaysNeeded) return true;

  // Back-to-back strength → suggest rest (MPS peaks 36-48h after)
  if (yesterdayWasStrength && weekStrengthCount >= 2) return true;

  // Luteal: more rest
  if (phase === "luteal" && yesterdayWasStrength) return true;

  return false;
}

function getRestMessage(context: RecentContext): string {
  if (context.yesterdayWasStrength) {
    return "Rest today. Your muscles are still building from yesterday.";
  }
  return "Recovery day. MPS is elevated for the next 36-48h — this is where the work becomes muscle.";
}

function restSuggestion(message: string): SuggestedWorkout {
  return {
    type: "walk",
    focus: null,
    exercises: [],
    isRest: true,
    message,
  };
}

function strengthSuggestion(phase: Phase, context: RecentContext): SuggestedWorkout {
  const missingPatterns = ALL_PATTERNS.filter((p) => !context.patternsHitThisWeek.has(p));
  const lowerPatterns: MovementPattern[] = ["squat", "hinge", "lunge"];
  const upperPatterns: MovementPattern[] = ["push", "pull"];

  // Decide focus: alternate upper/lower, prioritize gaps
  const missingLower = lowerPatterns.filter((p) => missingPatterns.includes(p));
  const missingUpper = upperPatterns.filter((p) => missingPatterns.includes(p));

  let focus: string;
  let targetPatterns: MovementPattern[];

  if (missingLower.length >= missingUpper.length) {
    focus = "Lower Body";
    targetPatterns = missingLower.length > 0 ? missingLower : lowerPatterns;
  } else {
    focus = "Upper Body";
    targetPatterns = missingUpper.length > 0 ? missingUpper : upperPatterns;
  }

  // Always add core if missing
  if (missingPatterns.includes("core")) {
    targetPatterns = [...targetPatterns, "core"];
  }

  // Pick exercises for each pattern
  const exercises: SuggestedExercise[] = [];
  for (const pattern of targetPatterns.slice(0, 4)) {
    const candidates = builtInExercises.filter(
      (e) => e.category === "strength" && e.movementPattern === pattern
    );
    if (candidates.length === 0) continue;

    const pick = candidates[Math.floor(Date.now() / 86400000) % candidates.length]!;
    const lastSets = context.lastSessionForExercise.get(pick.id);

    let reps = 10;
    let weight: number | null = null;

    if (lastSets && lastSets.length > 0) {
      const last = lastSets[0]!;
      reps = last.reps;
      weight = last.weight;

      // Progressive overload in follicular/ovulatory
      if ((phase === "follicular" || phase === "ovulatory") && weight !== null) {
        weight = weight + 5;
      }
    }

    exercises.push({
      exerciseId: pick.id,
      sets: 3,
      reps,
      weight,
    });
  }

  const intensityMsg = phase === "follicular" || phase === "ovulatory"
    ? "Your body is ready to push."
    : "Maintain loads, don't chase new numbers.";

  const hasHistory = exercises.some((e) => e.weight !== null);

  return {
    type: "strength",
    focus,
    exercises,
    isRest: false,
    message: hasHistory
      ? `Strength — ${focus}. ${intensityMsg}`
      : `Strength — ${focus}. Log your weights — the app learns from here.`,
  };
}

function accessorySuggestion(phase: Phase): SuggestedWorkout {
  if (phase === "luteal") {
    return {
      type: "yoga",
      focus: null,
      exercises: [],
      isRest: false,
      message: "You've hit your strength sessions. Yoga or a long walk today.",
    };
  }
  return {
    type: "pilates",
    focus: null,
    exercises: [],
    isRest: false,
    message: "Strength sessions are covered. Pilates for core and flexibility.",
  };
}

function buildPlannedSuggestion(
  type: WorkoutType,
  notes: string | null,
  phase: Phase,
  context: RecentContext
): SuggestedWorkout {
  if (type === "strength") {
    const suggestion = strengthSuggestion(phase, context);
    return {
      ...suggestion,
      message: notes
        ? `Planned: ${notes}. ${suggestion.message}`
        : suggestion.message,
    };
  }
  const typeLabels: Record<WorkoutType, string> = {
    strength: "Strength",
    pilates: "Pilates",
    yoga: "Yoga",
    mobility: "Mobility / Stretches",
    walk: "Walk",
    cardio: "Cardio",
  };
  return {
    type,
    focus: null,
    exercises: [],
    isRest: type === "walk",
    message: notes
      ? `Planned: ${typeLabels[type]} — ${notes}`
      : `Planned: ${typeLabels[type]}`,
  };
}

async function buildContext(today: string): Promise<RecentContext> {
  // Get this week's date range (Mon-Sun)
  const todayDate = new Date(today + "T00:00:00");
  const dayOfWeek = todayDate.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(todayDate);
  monday.setDate(todayDate.getDate() + mondayOffset);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const weekStart = monday.toISOString().split("T")[0]!;
  const weekEnd = sunday.toISOString().split("T")[0]!;

  const weekLogs = await db.dailyLogs
    .where("date")
    .between(weekStart, weekEnd, true, true)
    .toArray();

  const todayLog = weekLogs.find((l) => l.date === today);
  const todaySections = parseSections(todayLog?.sections);

  let weekStrengthCount = 0;
  let weekRestDays = 0;
  const weekSections: WorkoutSection[] = [];
  const patternsHitThisWeek = new Set<MovementPattern>();

  for (const log of weekLogs) {
    const sections = parseSections(log.sections);
    weekSections.push(...sections);

    const hasStrength = sections.some((s) => s.type === "strength");
    if (hasStrength) weekStrengthCount++;
    if (sections.length === 0 && log.date < today) weekRestDays++;

    for (const section of sections) {
      for (const entry of section.exercises) {
        if (entry.exercise.movementPattern) {
          patternsHitThisWeek.add(entry.exercise.movementPattern);
        }
      }
    }
  }

  // Yesterday
  const yesterday = new Date(todayDate);
  yesterday.setDate(todayDate.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0]!;
  const yesterdayLog = weekLogs.find((l) => l.date === yesterdayStr);
  const yesterdayWasStrength = parseSections(yesterdayLog?.sections).some(
    (s) => s.type === "strength"
  );

  // Last session data for each exercise (for progressive overload)
  const lastSessionForExercise = new Map<string, { reps: number; weight: number | null }[]>();
  const allLogs = await db.dailyLogs.orderBy("date").reverse().limit(30).toArray();
  for (const log of allLogs) {
    const sections = parseSections(log.sections);
    for (const section of sections) {
      for (const entry of section.exercises) {
        if (!lastSessionForExercise.has(entry.exercise.id)) {
          lastSessionForExercise.set(
            entry.exercise.id,
            entry.sets.map((s) => ({ reps: s.reps, weight: s.weight }))
          );
        }
      }
    }
  }

  return {
    todaySections,
    weekSections,
    weekStrengthCount,
    weekRestDays,
    yesterdayWasStrength,
    patternsHitThisWeek,
    lastSessionForExercise,
  };
}

function parseSections(raw: string | undefined): WorkoutSection[] {
  if (!raw) return [];
  try {
    return JSON.parse(raw) as WorkoutSection[];
  } catch {
    return [];
  }
}
