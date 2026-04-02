import { WorkoutHistory } from "./WorkoutHistory";

export function History() {
  return (
    <div style={{ padding: "24px 16px 32px" }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600, marginBottom: 16 }}>
        Log
      </h1>
      <WorkoutHistory />
    </div>
  );
}
