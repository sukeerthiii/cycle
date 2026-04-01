import { useState } from "react";
import { WorkoutHistory } from "./WorkoutHistory";
import { ExerciseHistory } from "./ExerciseHistory";

type View = "workouts" | "exercises";

export function History() {
  const [view, setView] = useState<View>("workouts");

  return (
    <div style={{ padding: "16px 16px 32px" }}>
      {/* Segmented control */}
      <div style={{
        display: "flex",
        background: "var(--bg-elevated)",
        borderRadius: "var(--radius-md)",
        padding: 3,
        marginBottom: 20,
      }}>
        {(["workouts", "exercises"] as View[]).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            style={{
              flex: 1,
              padding: "8px 0",
              background: view === v ? "var(--bg-primary)" : "transparent",
              border: "none",
              borderRadius: "var(--radius-sm)",
              fontFamily: "var(--font-body)",
              fontSize: 14,
              fontWeight: view === v ? 600 : 400,
              color: view === v ? "var(--text-primary)" : "var(--text-tertiary)",
              cursor: "pointer",
              transition: "all 0.2s",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            {v === "workouts" ? "Workout History" : "Exercise History"}
          </button>
        ))}
      </div>

      {view === "workouts" && <WorkoutHistory />}
      {view === "exercises" && <ExerciseHistory />}
    </div>
  );
}
