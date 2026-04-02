import { useState, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { MonthCalendar } from "./MonthCalendar";
import { PatternChecklist } from "./PatternChecklist";
import { DayDetailSheet } from "./DayDetailSheet";
import { PeriodControls } from "./PeriodControls";
import { calculatePhase } from "../../engine/phaseEngine";
import { useLatestCycleLog, useDailyLogs } from "../../db/hooks";
import type { Phase, WorkoutSection, WorkoutType, MovementPattern } from "../../models/types";

interface MovementProps {
  onAddWorkout: (date: string) => void;
  onEditSection: (date: string, sectionIndex: number, section: WorkoutSection) => void;
  onDeleteSection: (date: string, sectionIndex: number) => void;
  onPlanWorkout: (date: string, type: WorkoutType, notes: string) => void;
  onEditSteps: (date: string, currentSteps: number | null) => void;
  onDeleteSteps: (date: string) => void;
}

function todayISO() {
  return new Date().toISOString().split("T")[0]!;
}

function startOfWeekISO(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split("T")[0]!;
}

function endOfWeekISO(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? 0 : 7);
  d.setDate(diff);
  return d.toISOString().split("T")[0]!;
}

export function Movement({ onAddWorkout, onEditSection, onDeleteSection, onPlanWorkout, onEditSteps, onDeleteSteps }: MovementProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [viewMonth, setViewMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const latestCycle = useLatestCycleLog();
  const today = todayISO();
  const weekStart = startOfWeekISO();
  const weekEnd = endOfWeekISO();
  const weekLogs = useDailyLogs(weekStart, weekEnd);

  const patternsHit = useMemo(() => {
    const hit = new Set<MovementPattern>();
    if (!weekLogs) return hit;
    for (const log of weekLogs) {
      let sections: WorkoutSection[] = [];
      try {
        sections = JSON.parse(log.sections) as WorkoutSection[];
      } catch { /* empty */ }
      for (const section of sections) {
        for (const entry of section.exercises) {
          if (entry.exercise.movementPattern) {
            hit.add(entry.exercise.movementPattern);
          }
        }
      }
    }
    return hit;
  }, [weekLogs]);

  function getPhaseForDate(dateStr: string): Phase | null {
    if (!latestCycle) return null;
    const result = calculatePhase(
      latestCycle.periodStartDate,
      latestCycle.cycleLength,
      latestCycle.periodLength,
      dateStr
    );
    return result.phase;
  }

  // Build a map of dates that have workouts logged
  const monthStart = `${viewMonth.year}-${String(viewMonth.month + 1).padStart(2, "0")}-01`;
  const monthEnd = `${viewMonth.year}-${String(viewMonth.month + 1).padStart(2, "0")}-31`;
  const monthLogs = useDailyLogs(monthStart, monthEnd);

  const loggedDates = useMemo(() => {
    const dates = new Set<string>();
    if (!monthLogs) return dates;
    for (const log of monthLogs) {
      if (log.sections !== "[]") {
        dates.add(log.date);
      }
    }
    return dates;
  }, [monthLogs]);

  return (
    <div style={{ padding: "16px 16px 32px" }}>
      <MonthCalendar
        year={viewMonth.year}
        month={viewMonth.month}
        today={today}
        getPhase={getPhaseForDate}
        loggedDates={loggedDates}
        onSelectDate={setSelectedDate}
        onChangeMonth={(year, month) => setViewMonth({ year, month })}
      />

      <div style={{ marginTop: 20 }}>
        <PatternChecklist patternsHit={patternsHit} phase={getPhaseForDate(todayISO()) ?? "follicular"} />
      </div>

      <div style={{ marginTop: 24 }}>
        <PeriodControls />
      </div>

      <AnimatePresence>
        {selectedDate && (
          <DayDetailSheet
            date={selectedDate}
            isToday={selectedDate === today}
            isFuture={selectedDate > today}
            phase={getPhaseForDate(selectedDate)}
            onClose={() => setSelectedDate(null)}
            onAddWorkout={() => { setSelectedDate(null); onAddWorkout(selectedDate); }}
            onEditSection={(idx, section) => { setSelectedDate(null); onEditSection(selectedDate, idx, section); }}
            onDeleteSection={(idx) => onDeleteSection(selectedDate, idx)}
            onPlanWorkout={onPlanWorkout}
            onEditSteps={onEditSteps}
            onDeleteSteps={onDeleteSteps}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
