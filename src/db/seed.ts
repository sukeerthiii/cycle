import { db } from "./database";
import { builtInExercises } from "../models/exercises";

export async function seedExercises() {
  const rows = builtInExercises.map((ex) => ({
    id: ex.id,
    name: ex.name,
    category: ex.category,
    movementPattern: ex.movementPattern,
    isCustom: ex.isCustom,
  }));

  // Upsert built-in exercises (won't overwrite custom ones)
  await db.exercises.bulkPut(rows);
}
