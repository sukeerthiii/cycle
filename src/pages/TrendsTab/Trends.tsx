import { useMemo } from "react";
import { StepsGraph } from "./StepsGraph";
import { ExerciseProgression } from "./ExerciseProgression";
import { RunningProgress } from "./RunningProgress";
import { TypeDistribution } from "./TypeDistribution";
import { calculatePhase } from "../../engine/phaseEngine";
import { useLatestCycleLog, useDailyLogs } from "../../db/hooks";
import type { Phase, WorkoutSection } from "../../models/types";

const phaseLabels: Record<Phase, string> = {
  menstrual: "Menstrual",
  follicular: "Follicular",
  ovulatory: "Ovulatory",
  luteal: "Luteal",
};

function todayISO() {
  return new Date().toISOString().split("T")[0]!;
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
        <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-tertiary)" }}>
          Log your first workout to see trends.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px 16px 32px" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600, marginBottom: 2 }}>
          Pulse
        </h1>
        <p style={{
          fontFamily: "var(--font-body)",
          fontSize: 13,
          fontWeight: 500,
          color: `var(--phase-${phaseData.phase})`,
        }}>
          Day {phaseData.cycleDay} · {phaseLabels[phaseData.phase]}
        </p>
      </div>

      <StepsGraph
        periodStartDate={latestCycle.periodStartDate}
        cycleLength={latestCycle.cycleLength}
        periodLength={latestCycle.periodLength}
      />

      <div style={{ marginTop: 16 }}>
        <ExerciseProgression />
      </div>

      <div style={{ marginTop: 16 }}>
        <RunningProgress />
      </div>

      <div style={{ marginTop: 16 }}>
        <TypeDistribution distribution={typeDistribution} />
      </div>
    </div>
  );
}
