import { useMemo } from "react";
import { StepsGraph } from "./StepsGraph";
import { ExerciseProgression } from "./ExerciseProgression";
import { RunningProgress } from "./RunningProgress";
import { TypeDistribution } from "./TypeDistribution";
import { calculatePhase } from "../../engine/phaseEngine";
import { PageBackground } from "../../design/PageBackground";
import { useLatestCycleLog, useDailyLogs } from "../../db/hooks";
import type { Phase, WorkoutSection } from "../../models/types";

const phaseLabels: Record<Phase, string> = {
  menstrual: "Menstrual",
  follicular: "Follicular",
  ovulatory: "Ovulatory",
  luteal: "Luteal",
};

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function Trends() {
  const latestCycle = useLatestCycleLog();
  const allLogs = useDailyLogs();

  const phaseData = latestCycle
    ? calculatePhase(latestCycle.periodStartDate, latestCycle.cycleLength, latestCycle.periodLength)
    : null;

  const typeDistribution = useMemo(() => {
    if (!allLogs || !latestCycle) return {} as Record<string, number>;
    const cycleStart = latestCycle.periodStartDate;
    const today = todayISO();
    const td: Record<string, number> = {};
    for (const log of allLogs) {
      if (log.date < cycleStart || log.date > today) continue;
      let sections: WorkoutSection[] = [];
      try { sections = JSON.parse(log.sections) as WorkoutSection[]; } catch { continue; }
      for (const section of sections) {
        td[section.type] = (td[section.type] ?? 0) + 1;
      }
    }
    return td;
  }, [allLogs, latestCycle]);

  if (!phaseData || !latestCycle) {
    return (
      <div style={{ padding: "40px 16px", textAlign: "center" }}>
        <p className="body-small" style={{ color: "var(--text-tertiary)" }}>
          Log your first workout to see trends.
        </p>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", minHeight: "100%", background: "#FAFAF8" }}>
      <PageBackground phase={phaseData.phase} />
      <div style={{ position: "relative", zIndex: 1, padding: "24px 16px 32px" }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <span className="section-label" style={{ display: "block", marginBottom: 6 }}>Pulse</span>
          <span className="value-large" style={{ display: "block", marginBottom: 2 }}>
            Day {phaseData.cycleDay}
          </span>
          <span className="display-phase" style={{ color: `var(--phase-${phaseData.phase})` }}>
            {phaseLabels[phaseData.phase]}
          </span>
        </div>

        {/* Steps */}
        <ChartSection phase={phaseData.phase}>
          <StepsGraph
            periodStartDate={latestCycle.periodStartDate}
            cycleLength={latestCycle.cycleLength}
            periodLength={latestCycle.periodLength}
          />
        </ChartSection>

        <div style={{ borderTop: "1px solid var(--bg-deep)", margin: "16px 0" }} />

        {/* Exercise Progression */}
        <ChartSection phase={phaseData.phase}>
          <ExerciseProgression />
        </ChartSection>

        <div style={{ borderTop: "1px solid var(--bg-deep)", margin: "16px 0" }} />

        {/* Running */}
        <ChartSection phase={phaseData.phase}>
          <RunningProgress />
        </ChartSection>

        <div style={{ borderTop: "1px solid var(--bg-deep)", margin: "16px 0" }} />

        {/* Movement Types */}
        <ChartSection phase={phaseData.phase}>
          <TypeDistribution distribution={typeDistribution} />
        </ChartSection>
      </div>
    </div>
  );
}

function ChartSection({ children, phase }: { children: React.ReactNode; phase: Phase }) {
  return (
    <div style={{
      background: `var(--phase-${phase}-muted)`,
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      borderRadius: "var(--radius-lg)",
      border: "1px solid rgba(255, 255, 255, 0.6)",
      boxShadow: "0 2px 12px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.03), inset 0 1px 0 rgba(255, 255, 255, 0.4)",
      padding: "16px",
    }}>
      {children}
    </div>
  );
}
