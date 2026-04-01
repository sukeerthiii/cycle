import { useMemo } from "react";
import { Card } from "../../design/Card";
import { useDailyLogs } from "../../db/hooks";
import { calculatePhase } from "../../engine/phaseEngine";
import type { Phase, WorkoutSection } from "../../models/types";

interface RhythmHeatmapProps {
  periodStartDate: string;
  cycleLength: number;
  periodLength: number;
}

const phaseColors: Record<Phase, string> = {
  menstrual: "var(--phase-menstrual)",
  follicular: "var(--phase-follicular)",
  ovulatory: "var(--phase-ovulatory)",
  luteal: "var(--phase-luteal)",
};

function todayISO() {
  return new Date().toISOString().split("T")[0]!;
}

export function RhythmHeatmap({ periodStartDate, cycleLength, periodLength }: RhythmHeatmapProps) {
  const allLogs = useDailyLogs(periodStartDate, todayISO());

  const days = useMemo(() => {
    const today = todayISO();
    const start = new Date(periodStartDate + "T00:00:00");
    const end = new Date(today + "T00:00:00");
    const result: { date: string; phase: Phase; hasStrength: boolean; hasActivity: boolean; isRest: boolean }[] = [];

    const logMap = new Map<string, string>();
    if (allLogs) {
      for (const log of allLogs) {
        logMap.set(log.date, log.sections);
      }
    }

    const d = new Date(start);
    while (d <= end) {
      const dateStr = d.toISOString().split("T")[0]!;
      const { phase } = calculatePhase(periodStartDate, cycleLength, periodLength, dateStr);
      const raw = logMap.get(dateStr);
      let sections: WorkoutSection[] = [];
      try { if (raw) sections = JSON.parse(raw) as WorkoutSection[]; } catch { /* empty */ }

      const hasStrength = sections.some((s) => s.type === "strength");
      const hasActivity = sections.length > 0;

      result.push({
        date: dateStr,
        phase,
        hasStrength,
        hasActivity,
        isRest: !hasActivity,
      });

      d.setDate(d.getDate() + 1);
    }

    return result;
  }, [allLogs, periodStartDate, cycleLength, periodLength]);

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 600 }}>
          Rhythm Heatmap
        </span>
        <span className="body-caption">This cycle</span>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
        {days.map((day) => {
          // Green-ish = compliant, red-ish = not compliant
          const compliant = isCompliantDay(day.phase, day.hasStrength, day.hasActivity);
          return (
            <div
              key={day.date}
              title={`${day.date} · ${day.phase}${day.hasStrength ? " · strength" : day.hasActivity ? " · active" : " · rest"}`}
              style={{
                width: 14,
                height: 14,
                borderRadius: 3,
                background: compliant
                  ? phaseColors[day.phase]
                  : day.isRest
                    ? "var(--bg-primary)"
                    : "var(--phase-menstrual)",
                opacity: compliant ? 0.9 : 0.4,
              }}
            />
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 10, justifyContent: "center" }}>
        <Legend color="var(--phase-follicular)" label="In rhythm" />
        <Legend color="var(--bg-primary)" label="Rest" opacity={0.4} />
        <Legend color="var(--phase-menstrual)" label="Off rhythm" opacity={0.4} />
      </div>
    </Card>
  );
}

function Legend({ color, label, opacity = 0.9 }: { color: string; label: string; opacity?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <div style={{ width: 10, height: 10, borderRadius: 2, background: color, opacity }} />
      <span style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "var(--text-tertiary)" }}>{label}</span>
    </div>
  );
}

function isCompliantDay(phase: Phase, hasStrength: boolean, hasActivity: boolean): boolean {
  if (phase === "menstrual") return !hasStrength;
  if (phase === "follicular" || phase === "ovulatory") return hasActivity;
  return true;
}
