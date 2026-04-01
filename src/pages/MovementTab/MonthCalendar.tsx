import { useMemo } from "react";
import { motion } from "framer-motion";
import type { Phase } from "../../models/types";

interface MonthCalendarProps {
  year: number;
  month: number;
  today: string;
  getPhase: (dateStr: string) => Phase | null;
  loggedDates: Set<string>;
  onSelectDate: (dateStr: string) => void;
  onChangeMonth: (year: number, month: number) => void;
}

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const phaseColors: Record<Phase, string> = {
  menstrual: "var(--phase-menstrual-muted)",
  follicular: "var(--phase-follicular-muted)",
  ovulatory: "var(--phase-ovulatory-muted)",
  luteal: "var(--phase-luteal-muted)",
};

function toISO(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function MonthCalendar({
  year,
  month,
  today,
  getPhase,
  loggedDates,
  onSelectDate,
  onChangeMonth,
}: MonthCalendarProps) {
  const weeks = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Monday = 0, Sunday = 6
    let startIdx = firstDay.getDay() - 1;
    if (startIdx < 0) startIdx = 6;

    const cells: (number | null)[] = [];
    for (let i = 0; i < startIdx; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);

    const rows: (number | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
      rows.push(cells.slice(i, i + 7));
    }
    return rows;
  }, [year, month]);

  function prevMonth() {
    if (month === 0) onChangeMonth(year - 1, 11);
    else onChangeMonth(year, month - 1);
  }

  function nextMonth() {
    if (month === 11) onChangeMonth(year + 1, 0);
    else onChangeMonth(year, month + 1);
  }

  return (
    <div>
      {/* Month header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 16,
      }}>
        <button onClick={prevMonth} style={navBtnStyle}>‹</button>
        <span className="display-heading" style={{ fontSize: 18 }}>
          {MONTH_NAMES[month]} {year}
        </span>
        <button onClick={nextMonth} style={navBtnStyle}>›</button>
      </div>

      {/* Day name headers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 4 }}>
        {DAY_NAMES.map((d) => (
          <span
            key={d}
            className="body-caption"
            style={{ textAlign: "center", color: "var(--text-tertiary)", fontSize: 11 }}
          >
            {d}
          </span>
        ))}
      </div>

      {/* Weeks */}
      {weeks.map((week, wi) => (
        <div key={wi} style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
          {week.map((day, di) => {
            if (day === null) return <div key={di} />;

            const dateStr = toISO(year, month, day);
            const phase = getPhase(dateStr);
            const isToday = dateStr === today;
            const hasLog = loggedDates.has(dateStr);

            return (
              <motion.button
                key={di}
                whileTap={{ scale: 0.92 }}
                onClick={() => onSelectDate(dateStr)}
                style={{
                  position: "relative",
                  aspectRatio: "1",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  background: phase ? phaseColors[phase] : "transparent",
                  border: isToday ? "2px solid var(--accent)" : "none",
                  borderRadius: "var(--radius-sm)",
                  cursor: "pointer",
                  WebkitTapHighlightColor: "transparent",
                  padding: 0,
                }}
              >
                <span style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 14,
                  fontWeight: isToday ? 700 : 400,
                  color: isToday ? "var(--accent)" : "var(--text-primary)",
                  fontVariantNumeric: "tabular-nums",
                }}>
                  {day}
                </span>
                {hasLog && (
                  <div style={{
                    width: 4,
                    height: 4,
                    borderRadius: 2,
                    background: "var(--accent)",
                    marginTop: 2,
                  }} />
                )}
              </motion.button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

const navBtnStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  fontFamily: "var(--font-body)",
  fontSize: 24,
  color: "var(--text-secondary)",
  cursor: "pointer",
  padding: "4px 12px",
  WebkitTapHighlightColor: "transparent",
};
