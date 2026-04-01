export type Phase = "menstrual" | "follicular" | "ovulatory" | "luteal";

export type WorkoutType = "strength" | "pilates" | "yoga" | "mobility" | "walk";

export type MovementPattern =
  | "squat"
  | "hinge"
  | "lunge"
  | "push"
  | "pull"
  | "core";

export interface CycleLog {
  id?: number;
  periodStartDate: string; // ISO date
  periodEndDate: string | null;
  cycleLength: number;
  periodLength: number;
}

export interface DailyLog {
  id?: number;
  date: string; // ISO date YYYY-MM-DD
  phase: Phase;
  sections: WorkoutSection[];
  steps: number | null;
  skipReason: string | null;
  suggestedWorkout: SuggestedWorkout | null;
  plannedWorkout: PlannedWorkout | null;
}

export interface WorkoutSection {
  type: WorkoutType;
  exercises: ExerciseEntry[];
  duration: number | null;
  steps: number | null;
  distance: number | null;
  notes: string | null;
}

export interface ExerciseEntry {
  exercise: Exercise;
  sets: SetEntry[];
}

export interface SetEntry {
  reps: number;
  weight: number | null;
  isBodyweight: boolean;
  duration: number | null;
}

export interface Exercise {
  id: string;
  name: string;
  category: WorkoutType;
  movementPattern: MovementPattern | null;
  isCustom: boolean;
}

export interface SuggestedWorkout {
  type: WorkoutType;
  focus: string | null;
  exercises: SuggestedExercise[];
  isRest: boolean;
  message: string;
}

export interface SuggestedExercise {
  exerciseId: string;
  sets: number;
  reps: number;
  weight: number | null;
}

export interface PlannedWorkout {
  type: WorkoutType;
  notes: string | null;
}

export interface UserProfile {
  age: number;
  sex: "female";
  ethnicity: string;
  diet: string;
  goal: string;
  liftingExperience: string;
  bodyweightLb: number;
  bodyweightKg: number;
  proteinTargetLow: number;
  proteinTargetHigh: number;
  stepTarget: number;
  strengthSessionsPerWeek: number;
  unitWeight: "lb" | "kg";
  unitDistance: "km" | "mi";
  defaultCycleLength: number;
  defaultPeriodLength: number;
  lastPeriodStart: string;
}
