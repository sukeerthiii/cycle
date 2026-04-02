import { useMemo } from "react";
import { StepsGraph } from "./StepsGraph";
import { ExerciseProgression } from "./ExerciseProgression";
import { VolumeByPhase } from "./VolumeByPhase";
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

  const { phaseVolumes, typeDistribution } = useMemo(() => {
    if (!allLogs || !latestCycle) {
      return { phaseVolumes: {} as Record<Phase, number>, typeDistribution: {} as Record<string, number> };
    }

    const cycleStart = latestCycle.periodStartDate;
    const today = todayISO();
    const pv: Record<Phase, number> = { menstrual: 0, follicular: 0, ovulatory: 0, luteal: 0 };
    const td: Record<string, number> = {};

    for (const log of allLogs) {
      if (log.date < cycleStart || log.date > today) continue;

      let sections: WorkoutSection[] = [];
      try { sections = JSON.parse(log.sections) as WorkoutSection[]; } catch { continue; }

      for (const section of sections) {
        td[section.type] = (td[section.type] ?? 0) + 1;

        for (const entry of section.exercises) {
          for (const set of entry.sets) {
            const w = set.weight ?? 0;
            const phase = log.phase as Phase;
            pv[phase] = (pv[phase] ?? 0) + set.reps * w;
          }
        }
      }
    }

    return { phaseVolumes: pv, typeDistribution: td };
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
      {/* Header */}
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

      {/* Steps */}
      <StepsGraph
        periodStartDate={latestCycle.periodStartDate}
        cycleLength={latestCycle.cycleLength}
        periodLength={latestCycle.periodLength}
      />

      {/* Exercise Progression */}
      <div style={{ marginTop: 16 }}>
        <ExerciseProgression />
      </div>

      {/* Volume by Phase */}
      <div style={{ marginTop: 16 }}>
        <VolumeByPhase volumes={phaseVolumes} />
      </div>

      {/* Workout Types */}
      <div style={{ marginTop: 16 }}>
        <TypeDistribution distribution={typeDistribution} />
      </div>
    </div>
  );
}
