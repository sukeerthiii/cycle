import { useState, useEffect, useMemo } from "react";
import { StatsRow } from "./StatsRow";
import { RhythmHeatmap } from "./RhythmHeatmap";
import { VolumeByPhase } from "./VolumeByPhase";
import { TypeDistribution } from "./TypeDistribution";
import { calculatePhase } from "../../engine/phaseEngine";
import { calculateCompliance } from "../../engine/complianceEngine";
import { useLatestCycleLog, useDailyLogs } from "../../db/hooks";
import { profile } from "../../models/profile";
import type { Phase, WorkoutSection } from "../../models/types";

function todayISO() {
  return new Date().toISOString().split("T")[0]!;
}

export function Trends() {
  const latestCycle = useLatestCycleLog();
  const allLogs = useDailyLogs();
  const [compliance, setCompliance] = useState(0);

  const phaseData = latestCycle
    ? calculatePhase(latestCycle.periodStartDate, latestCycle.cycleLength, latestCycle.periodLength)
    : null;

  useEffect(() => {
    if (!latestCycle) return;
    calculateCompliance(
      latestCycle.periodStartDate,
      latestCycle.cycleLength,
      latestCycle.periodLength
    ).then((r) => setCompliance(r.score));
  }, [latestCycle, allLogs]);

  const { sessions, volume, phaseVolumes, typeDistribution } = useMemo(() => {
    if (!allLogs || !latestCycle) {
      return { sessions: 0, volume: 0, phaseVolumes: {} as Record<Phase, number>, typeDistribution: {} as Record<string, number> };
    }

    const cycleStart = latestCycle.periodStartDate;
    const today = todayISO();
    let sess = 0;
    let vol = 0;
    const pv: Record<Phase, number> = { menstrual: 0, follicular: 0, ovulatory: 0, luteal: 0 };
    const td: Record<string, number> = {};

    for (const log of allLogs) {
      if (log.date < cycleStart || log.date > today) continue;

      let sections: WorkoutSection[] = [];
      try { sections = JSON.parse(log.sections) as WorkoutSection[]; } catch { continue; }

      const hasStrength = sections.some((s) => s.type === "strength");
      if (hasStrength) sess++;

      for (const section of sections) {
        td[section.type] = (td[section.type] ?? 0) + 1;

        for (const entry of section.exercises) {
          for (const set of entry.sets) {
            const w = set.weight ?? 0;
            vol += set.reps * w;
            const phase = log.phase as Phase;
            pv[phase] = (pv[phase] ?? 0) + set.reps * w;
          }
        }
      }
    }

    return { sessions: sess, volume: vol, phaseVolumes: pv, typeDistribution: td };
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
    <div style={{ padding: "16px 16px 32px" }}>
      <StatsRow
        cycleDay={phaseData.cycleDay}
        phase={phaseData.phase}
        compliance={compliance}
        sessions={sessions}
        targetSessions={Math.round(profile.strengthSessionsPerWeek * (phaseData.cycleDay / 7))}
        volume={volume}
      />

      <RhythmHeatmap
        periodStartDate={latestCycle.periodStartDate}
        cycleLength={latestCycle.cycleLength}
        periodLength={latestCycle.periodLength}
      />

      <div style={{ marginTop: 16 }}>
        <VolumeByPhase volumes={phaseVolumes} />
      </div>

      <div style={{ marginTop: 16 }}>
        <TypeDistribution distribution={typeDistribution} />
      </div>
    </div>
  );
}
