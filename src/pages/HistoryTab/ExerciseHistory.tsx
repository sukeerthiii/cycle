import { useState, useMemo } from "react";
import { useDailyLogs, useExercises } from "../../db/hooks";
import type { WorkoutSection, Phase } from "../../models/types";

const phaseLabels: Record<Phase, string> = {
  menstrual: "Menstrual",
  follicular: "Follicular",
  ovulatory: "Ovulatory",
  luteal: "Luteal",
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

interface ExerciseSession {
  date: string;
  phase: Phase;
  sets: { reps: number; weight: number | null; isBodyweight: boolean }[];
  volume: number;
}

export function ExerciseHistory() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const allExercises = useExercises();
  const allLogs = useDailyLogs();

  const strengthExercises = useMemo(() => {
    if (!allExercises) return [];
    return allExercises.filter((e) => e.category === "strength");
  }, [allExercises]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return strengthExercises;
    return strengthExercises.filter((e) => e.name.toLowerCase().includes(q));
  }, [strengthExercises, search]);

  // Build session history for the selected exercise
  const sessions = useMemo((): ExerciseSession[] => {
    if (!selectedId || !allLogs) return [];
    const result: ExerciseSession[] = [];

    for (const log of allLogs) {
      let sections: WorkoutSection[] = [];
      try {
        sections = JSON.parse(log.sections) as WorkoutSection[];
      } catch { continue; }

      for (const section of sections) {
        for (const entry of section.exercises) {
          if (entry.exercise.id === selectedId) {
            let volume = 0;
            for (const set of entry.sets) {
              volume += set.reps * (set.weight ?? 0);
            }
            result.push({
              date: log.date,
              phase: log.phase as Phase,
              sets: entry.sets.map((s) => ({
                reps: s.reps,
                weight: s.weight,
                isBodyweight: s.isBodyweight,
              })),
              volume,
            });
          }
        }
      }
    }

    return result.sort((a, b) => b.date.localeCompare(a.date));
  }, [selectedId, allLogs]);

  const selectedExercise = strengthExercises.find((e) => e.id === selectedId);

  return (
    <div>
      {/* Exercise picker */}
      <input
        type="text"
        placeholder="Search exercises..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          fontFamily: "var(--font-body)",
          fontSize: 15,
          fontWeight: 400,
          color: "var(--text-primary)",
          background: "var(--bg-elevated)",
          border: "none",
          borderRadius: "var(--radius-md)",
          padding: "10px 14px",
          outline: "none",
          marginBottom: 12,
        }}
      />

      {!selectedId && (
        <div style={{ maxHeight: 300, overflowY: "auto" }}>
          {filtered.map((ex) => (
            <button
              key={ex.id}
              onClick={() => { setSelectedId(ex.id!); setSearch(""); }}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "10px 0",
                background: "none",
                border: "none",
                borderBottom: "1px solid var(--bg-elevated)",
                fontFamily: "var(--font-body)",
                fontSize: 15,
                fontWeight: 400,
                color: "var(--text-primary)",
                cursor: "pointer",
              }}
            >
              {ex.name}
              {ex.movementPattern && (
                <span className="body-caption" style={{ marginLeft: 8, color: "var(--text-tertiary)" }}>
                  {ex.movementPattern}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Selected exercise history */}
      {selectedId && selectedExercise && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <button
              onClick={() => setSelectedId(null)}
              style={{
                background: "none",
                border: "none",
                fontFamily: "var(--font-body)",
                fontSize: 16,
                color: "var(--text-secondary)",
                cursor: "pointer",
              }}
            >
              ←
            </button>
            <span className="display-heading" style={{ fontSize: 18 }}>
              {selectedExercise.name}
            </span>
          </div>

          {sessions.length === 0 ? (
            <p className="body-small" style={{ color: "var(--text-tertiary)", textAlign: "center", marginTop: 24 }}>
              No history for this exercise yet.
            </p>
          ) : (
            <>
              {/* Column headers */}
              <div style={headerStyle}>
                <span style={{ flex: 1 }}>Date</span>
                <span style={{ flex: 0.8 }}>Phase</span>
                <span style={{ flex: 1.5 }}>Sets</span>
                <span style={{ flex: 0.8, textAlign: "right" }}>Volume</span>
              </div>

              {sessions.map((s) => (
                <div key={s.date} style={rowStyle}>
                  <span style={{ flex: 1, fontVariantNumeric: "tabular-nums" }}>
                    {formatDate(s.date)}
                  </span>
                  <span style={{ flex: 0.8, color: `var(--phase-${s.phase})`, fontSize: 13 }}>
                    {phaseLabels[s.phase]}
                  </span>
                  <span style={{ flex: 1.5, fontSize: 13 }}>
                    {s.sets.map((set, i) => (
                      <span key={i}>
                        {set.reps}×{set.isBodyweight ? "BW" : `${set.weight ?? 0}`}
                        {i < s.sets.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </span>
                  <span style={{
                    flex: 0.8,
                    textAlign: "right",
                    fontVariantNumeric: "tabular-nums",
                    fontSize: 13,
                  }}>
                    {s.volume > 0 ? `${s.volume.toLocaleString()} lb` : "BW"}
                  </span>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

const headerStyle: React.CSSProperties = {
  display: "flex",
  padding: "8px 0",
  fontFamily: "var(--font-body)",
  fontSize: 12,
  fontWeight: 500,
  color: "var(--text-tertiary)",
  borderBottom: "1px solid var(--bg-elevated)",
  marginBottom: 4,
};

const rowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  padding: "10px 0",
  fontFamily: "var(--font-body)",
  fontSize: 14,
  fontWeight: 400,
  color: "var(--text-primary)",
  borderBottom: "1px solid var(--bg-elevated)",
};
