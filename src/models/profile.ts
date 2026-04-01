import type { UserProfile } from "./types";

const BODYWEIGHT_LB = 145;
const BODYWEIGHT_KG = Math.round(BODYWEIGHT_LB / 2.205);

export const profile: UserProfile = {
  age: 25,
  sex: "female",
  ethnicity: "Indian",
  diet: "mix of veg and non-veg",
  goal: "body recomposition — lose stubborn fat, build lean muscle",
  liftingExperience: "moderate (still building up to heavy)",
  bodyweightLb: BODYWEIGHT_LB,
  bodyweightKg: BODYWEIGHT_KG,
  proteinTargetLow: Math.round(BODYWEIGHT_KG * 1.6),
  proteinTargetHigh: Math.round(BODYWEIGHT_KG * 2.2),
  stepTarget: 8000,
  strengthSessionsPerWeek: 4,
  unitWeight: "lb",
  unitDistance: "km",
  defaultCycleLength: 30,
  defaultPeriodLength: 5,
  lastPeriodStart: "2026-03-10",
};
