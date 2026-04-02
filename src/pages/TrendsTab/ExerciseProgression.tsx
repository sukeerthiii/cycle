import { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Card } from "../../design/Card";
import { useDailyLogs, useExercises } from "../../db/hooks";
import type { Phase, WorkoutSection } from "../../models/types";

const phaseLabels: Record<Phase, string> = {
  menstrual: "Menstrual",
  follicular: "Follicular",
  ovulatory: "Ovulatory",
  luteal: "Luteal",
};

const phaseColorMap: Record<Phase, string> = {
  menstrual: "#C4705A",
  follicular: "#8BA888",
  ovulatory: "#D4A843",
  luteal: "#9B7E9B",
};

interface SessionData {
  date: string;
  dateLabel: string;
  phase: Phase;
  weight: number;
  reps: number;
  sets: number;
  volume: number;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

export function ExerciseProgression() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<"chart" | "table">("chart");
  const [search, setSearch] = useState("");
  const allExercises = useExercises();
  const allLogs = useDailyLogs();

  const strengthExercises = useMemo(() => {
    if (!allExercises) return [];
    return allExercises.filter((e) => e.category === "strength");
  }, [allExercises]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return strengthExercises.slice(0, 20);
    return strengthExercises.filter((e) => e.name.toLowerCase().includes(q));
  }, [strengthExercises, search]);

  const sessions = useMemo((): SessionData[] => {
    if (!selectedId || !allLogs) return [];
    const result: SessionData[] = [];

    for (const log of allLogs) {
      let sections: WorkoutSection[] = [];
      try { sections = JSON.parse(log.sections) as WorkoutSection[]; } catch { continue; }

      for (const section of sections) {
        for (const entry of section.exercises) {
          if (entry.exercise.id === selectedId) {
            let maxWeight = 0;
            let totalVol = 0;
            let totalReps = 0;
            for (const set of entry.sets) {
              const w = set.weight ?? 0;
              if (w > maxWeight) maxWeight = w;
              totalVol += set.reps * w;
              totalReps += set.reps;
            }
            result.push({
              date: log.date,
              dateLabel: formatDate(log.date),
              phase: log.phase as Phase,
              weight: maxWeight,
              reps: totalReps,
              sets: entry.sets.length,
              volume: totalVol,
            });
          }
        }
      }
    }

    return result.sort((a, b) => a.date.localeCompare(b.date));
  }, [selectedId, allLogs]);

  const selectedExercise = strengthExercises.find((e) => e.id === selectedId);

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, color: "var(--text-primary)" }}>
          Progress
        </span>
        {selectedId && (
          <div style={{ display: "flex", background: "var(--bg-deep)", borderRadius: "var(--radius-sm)", padding: 2 }}>
            {(["chart", "table"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  padding: "4px 12px",
                  background: view === v ? "var(--bg-elevated)" : "transparent",
                  border: "none",
                  borderRadius: "var(--radius-sm)",
                  fontFamily: "var(--font-body)",
                  fontSize: 12,
                  fontWeight: view === v ? 600 : 400,
                  color: view === v ? "var(--text-primary)" : "var(--text-tertiary)",
                  cursor: "pointer",
                  textTransform: "capitalize",
                }}
              >
                {v}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Exercise picker */}
      {!selectedId ? (
        <div>
          <input
            type="text"
            placeholder="Search exercises..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              fontFamily: "var(--font-body)",
              fontSize: 14,
              fontWeight: 400,
              color: "var(--text-primary)",
              background: "var(--bg-primary)",
              border: "none",
              borderRadius: "var(--radius-sm)",
              padding: "8px 12px",
              outline: "none",
              marginBottom: 8,
            }}
          />
          <div style={{ maxHeight: 160, overflowY: "auto" }}>
            {filtered.map((ex) => (
              <button
                key={ex.id}
                onClick={() => { setSelectedId(ex.id!); setSearch(""); }}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "8px 0",
                  background: "none",
                  border: "none",
                  borderBottom: "1px solid var(--bg-deep)",
                  fontFamily: "var(--font-body)",
                  fontSize: 14,
                  fontWeight: 400,
                  color: "var(--text-primary)",
                  cursor: "pointer",
                }}
              >
                {ex.name}
                {ex.movementPattern && (
                  <span style={{ marginLeft: 6, fontSize: 12, color: "var(--text-tertiary)" }}>
                    {ex.movementPattern}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div>
          {/* Selected exercise header */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <button
              onClick={() => setSelectedId(null)}
              style={{ background: "none", border: "none", fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)", cursor: "pointer" }}
            >
              ← 
            </button>
            <span style={{ fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>
              {selectedExercise?.name}
            </span>
          </div>

          {sessions.length === 0 ? (
            <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-tertiary)", textAlign: "center", padding: "20px 0" }}>
              No history yet.
            </p>
          ) : view === "chart" ? (
            <ChartView sessions={sessions} />
          ) : (
            <TableView sessions={sessions} />
          )}
        </div>
      )}
    </Card>
  );
}

function ChartView({ sessions }: { sessions: SessionData[] }) {
  const data = sessions.map((s) => ({
    date: s.dateLabel,
    weight: s.weight,
    phase: s.phase,
    fill: phaseColorMap[s.phase],
  }));

  return (
    <div style={{ width: "100%", height: 180 }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fontFamily: "DM Sans", fill: "#A8A29E" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fontFamily: "DM Sans", fill: "#A8A29E" }}
            axisLine={false}
            tickLine={false}
            unit=" lb"
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="#78716C"
            strokeWidth={2}
            dot={(props: Record<string, unknown>) => {
              const { cx, cy, payload } = props as { cx: number; cy: number; payload: { phase: Phase } };
              return (
                <circle
                  key={`${cx}-${cy}`}
                  cx={cx}
                  cy={cy}
                  r={4}
                  fill={phaseColorMap[payload.phase]}
                  stroke="none"
                />
              );
            }}
            activeDot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function TableView({ sessions }: { sessions: SessionData[] }) {
  const reversed = [...sessions].reverse();

  return (
    <div>
      <div style={headerRowStyle}>
        <span style={{ flex: 1 }}>Date</span>
        <span style={{ flex: 0.8 }}>Phase</span>
        <span style={{ flex: 0.5, textAlign: "right" }}>Sets</span>
        <span style={{ flex: 0.6, textAlign: "right" }}>Weight</span>
        <span style={{ flex: 0.7, textAlign: "right" }}>Volume</span>
      </div>
      <div style={{ maxHeight: 200, overflowY: "auto" }}>
        {reversed.map((s) => (
          <div key={s.date} style={rowStyle}>
            <span style={{ flex: 1, fontVariantNumeric: "tabular-nums" }}>{s.dateLabel}</span>
            <span style={{ flex: 0.8, color: phaseColorMap[s.phase], fontSize: 12 }}>{phaseLabels[s.phase]}</span>
            <span style={{ flex: 0.5, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{s.sets}</span>
            <span style={{ flex: 0.6, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{s.weight > 0 ? `${s.weight}` : "BW"}</span>
            <span style={{ flex: 0.7, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{s.volume > 0 ? s.volume.toLocaleString() : "—"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const headerRowStyle: React.CSSProperties = {
  display: "flex",
  padding: "6px 0",
  fontFamily: "var(--font-body)",
  fontSize: 11,
  fontWeight: 500,
  color: "var(--text-tertiary)",
  borderBottom: "1px solid var(--bg-deep)",
  marginBottom: 4,
};

const rowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  padding: "6px 0",
  fontFamily: "var(--font-body)",
  fontSize: 13,
  fontWeight: 400,
  color: "var(--text-primary)",
  borderBottom: "1px solid var(--bg-deep)",
};
