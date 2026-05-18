import { useState, useMemo, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { MonthCalendar } from "./MonthCalendar";
import { PatternChecklist } from "./PatternChecklist";
import { DayDetailSheet } from "./DayDetailSheet";
import { PeriodControls } from "./PeriodControls";
import { Card } from "../../design/Card";
import { PageBackground } from "../../design/PageBackground";
import { calculatePhase } from "../../engine/phaseEngine";
import { useLatestCycleLog, useDailyLogs, useSetting, setSetting } from "../../db/hooks";
import type { Phase, WorkoutSection, WorkoutType, MovementPattern } from "../../models/types";

interface MovementProps {
  onAddWorkout: (date: string) => void;
  onEditSection: (date: string, sectionIndex: number, section: WorkoutSection) => void;
  onDeleteSection: (date: string, sectionIndex: number) => void;
  onPlanWorkout: (date: string, type: WorkoutType, notes: string) => void;
  onEditSteps: (date: string, currentSteps: number | null) => void;
  onDeleteSteps: (date: string) => void;
}

function toLocal(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function todayISO() {
  return toLocal(new Date());
}

function startOfWeekISO(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return toLocal(d);
}

function endOfWeekISO(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? 0 : 7);
  d.setDate(diff);
  return toLocal(d);
}

export function Movement({ onAddWorkout, onEditSection, onDeleteSection, onPlanWorkout, onEditSteps, onDeleteSteps }: MovementProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const weeklyPlanSetting = useSetting("weeklyPlan");
  const [weeklyPlan, setWeeklyPlan] = useState("");

  useEffect(() => {
    if (weeklyPlanSetting?.value !== undefined) {
      setWeeklyPlan(weeklyPlanSetting.value);
    }
  }, [weeklyPlanSetting]);

  function handlePlanBlur() {
    setSetting("weeklyPlan", weeklyPlan);
  }

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

  const currentPhase = getPhaseForDate(todayISO()) ?? "follicular" as Phase;

  return (
    <div style={{ position: "relative", minHeight: "100%", background: "#FAFAF8" }}>
      <PageBackground phase={currentPhase} />
      <div style={{ position: "relative", zIndex: 1, padding: "20px 16px 32px" }}>
      <Card>
        <MonthCalendar
          year={viewMonth.year}
          month={viewMonth.month}
          today={today}
          getPhase={getPhaseForDate}
          loggedDates={loggedDates}
          onSelectDate={setSelectedDate}
          onChangeMonth={(year, month) => setViewMonth({ year, month })}
        />
      </Card>

      <div style={{ marginTop: 16 }}>
        <Card>
          <PatternChecklist patternsHit={patternsHit} phase={getPhaseForDate(todayISO()) ?? "follicular"} />
        </Card>
      </div>

      <div style={{ marginTop: 16 }}>
        <PeriodControls />
      </div>

      {/* Weekly planner */}
      <div style={{ marginTop: 24 }}>
        <Card>
          <span className="section-label" style={{ display: "block", marginBottom: 10 }}>
            Weekly Plan
          </span>
          <textarea
            placeholder="Monday: lower body&#10;Tuesday: pilates&#10;Wednesday: rest&#10;..."
            value={weeklyPlan}
            onChange={(e) => setWeeklyPlan(e.target.value)}
            onBlur={handlePlanBlur}
            rows={5}
            style={{
              width: "100%",
              fontFamily: "var(--font-body)",
              fontSize: 14,
              fontWeight: 400,
              color: "var(--text-primary)",
              background: "var(--bg-primary)",
              border: "none",
              borderRadius: "var(--radius-sm)",
              padding: "10px 12px",
              resize: "none",
              outline: "none",
              lineHeight: 1.6,
            }}
          />
        </Card>
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
    </div>
  );
}
