import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Card } from "../../design/Card";
import { useDailyLogs } from "../../db/hooks";
import type { WorkoutSection, Phase } from "../../models/types";

interface RunSession {
  date: string;
  dateLabel: string;
  runSeconds: number;
  walkSeconds: number;
  totalSeconds: number;
  runPct: number;
  phase: Phase;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

export function RunningProgress() {
  const allLogs = useDailyLogs();

  const sessions = useMemo((): RunSession[] => {
    if (!allLogs) return [];
    const result: RunSession[] = [];

    for (const log of allLogs) {
      let sections: WorkoutSection[] = [];
      try { sections = JSON.parse(log.sections) as WorkoutSection[]; } catch { continue; }

      for (const section of sections) {
        if (section.type === "running" && section.intervals && section.intervals.length > 0) {
          const runSec = section.intervals.filter((i) => i.type === "run").reduce((a, i) => a + i.durationSeconds, 0);
          const walkSec = section.intervals.filter((i) => i.type === "walk").reduce((a, i) => a + i.durationSeconds, 0);
          const total = runSec + walkSec;
          result.push({
            date: log.date,
            dateLabel: formatDate(log.date),
            runSeconds: runSec,
            walkSeconds: walkSec,
            totalSeconds: total,
            runPct: total > 0 ? Math.round((runSec / total) * 100) : 0,
            phase: log.phase as Phase,
          });
        }
      }
    }

    return result.sort((a, b) => a.date.localeCompare(b.date));
  }, [allLogs]);

  if (sessions.length === 0) {
    return (
      <Card>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, color: "var(--text-primary)", display: "block", marginBottom: 8 }}>
          Running
        </span>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-tertiary)" }}>
          Log your first run to see progress.
        </p>
      </Card>
    );
  }

  const data = sessions.map((s) => ({
    date: s.dateLabel,
    run: Math.round(s.runSeconds / 60),
    walk: Math.round(s.walkSeconds / 60),
    runPct: s.runPct,
  }));

  const latestPct = sessions[sessions.length - 1]?.runPct ?? 0;

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, color: "var(--text-primary)" }}>
          Running
        </span>
        <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-secondary)" }}>
          {latestPct}% running
        </span>
      </div>

      <div style={{ width: "100%", height: 160 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
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
              unit="m"
            />
            <Bar dataKey="run" stackId="a" fill="#8BA888" radius={[0, 0, 0, 0]} />
            <Bar dataKey="walk" stackId="a" fill="#E0DAD4" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 8 }}>
        <Legend color="#8BA888" label="Run" />
        <Legend color="#E0DAD4" label="Walk" />
      </div>
    </Card>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <div style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
      <span style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--text-tertiary)" }}>{label}</span>
    </div>
  );
}
