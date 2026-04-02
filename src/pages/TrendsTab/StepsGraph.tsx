import { useState, useMemo } from "react";
import { Card } from "../../design/Card";
import { useDailyLogs } from "../../db/hooks";
import { calculatePhase } from "../../engine/phaseEngine";
import type { Phase } from "../../models/types";

interface StepsGraphProps {
  periodStartDate: string;
  cycleLength: number;
  periodLength: number;
}

const DAY_INITIALS = ["M", "T", "W", "T", "F", "S", "S"];

const phaseBarColors: Record<Phase, string> = {
  menstrual: "#C4705A",
  follicular: "#8BA888",
  ovulatory: "#D4A843",
  luteal: "#9B7E9B",
};

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function toISO(d: Date): string {
  return d.toISOString().split("T")[0]!;
}

function formatWeekRange(monday: Date): string {
  const sun = new Date(monday);
  sun.setDate(monday.getDate() + 6);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${monday.toLocaleDateString("en-IN", opts)} – ${sun.toLocaleDateString("en-IN", opts)}`;
}

export function StepsGraph({ periodStartDate, cycleLength, periodLength }: StepsGraphProps) {
  const [weekOffset, setWeekOffset] = useState(0);

  const monday = useMemo(() => {
    const m = getMonday(new Date());
    m.setDate(m.getDate() + weekOffset * 7);
    return m;
  }, [weekOffset]);

  const sunday = useMemo(() => {
    const s = new Date(monday);
    s.setDate(monday.getDate() + 6);
    return s;
  }, [monday]);

  const weekStart = toISO(monday);
  const weekEnd = toISO(sunday);
  const logs = useDailyLogs(weekStart, weekEnd);

  const days = useMemo(() => {
    const result: { date: string; steps: number; phase: Phase; target: number }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = toISO(d);
      const { phase } = calculatePhase(periodStartDate, cycleLength, periodLength, dateStr);
      const log = logs?.find((l) => l.date === dateStr);
      const steps = log?.steps ?? 0;
      const target = (phase === "follicular" || phase === "ovulatory") ? 10000 : 8000;
      result.push({ date: dateStr, steps, phase, target });
    }
    return result;
  }, [logs, monday, periodStartDate, cycleLength, periodLength]);

  const maxSteps = Math.max(...days.map((d) => d.steps), 10000);
  const isCurrentWeek = weekOffset === 0;

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, color: "var(--text-primary)" }}>
          Steps
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => setWeekOffset((w) => w - 1)} style={arrowBtn}>‹</button>
          <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-secondary)", minWidth: 120, textAlign: "center" }}>
            {formatWeekRange(monday)}
          </span>
          <button onClick={() => setWeekOffset((w) => w + 1)} style={arrowBtn} disabled={isCurrentWeek}>
            ›
          </button>
        </div>
      </div>

      {/* Bar chart */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 120 }}>
        {days.map((day, i) => {
          const height = maxSteps > 0 ? (day.steps / maxSteps) * 100 : 0;
          const targetHeight = (day.target / maxSteps) * 100;
          return (
            <div key={day.date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end", position: "relative" }}>
              {/* Target line */}
              <div style={{
                position: "absolute",
                bottom: `${targetHeight}%`,
                left: 0,
                right: 0,
                height: 1,
                background: "var(--bg-deep)",
                borderTop: "1px dashed var(--text-tertiary)",
                opacity: 0.4,
              }} />
              {/* Bar */}
              <div style={{
                width: "100%",
                height: `${height}%`,
                minHeight: day.steps > 0 ? 4 : 0,
                background: phaseBarColors[day.phase],
                borderRadius: "4px 4px 0 0",
                transition: "height 0.3s ease",
                opacity: day.steps > 0 ? 0.85 : 0.15,
              }} />
            </div>
          );
        })}
      </div>

      {/* Day labels */}
      <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
        {DAY_INITIALS.map((initial, i) => (
          <div key={i} style={{ flex: 1, textAlign: "center" }}>
            <span style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--text-tertiary)" }}>
              {initial}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

const arrowBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  fontFamily: "var(--font-body)",
  fontSize: 18,
  color: "var(--text-secondary)",
  cursor: "pointer",
  padding: "2px 6px",
  WebkitTapHighlightColor: "transparent",
};
