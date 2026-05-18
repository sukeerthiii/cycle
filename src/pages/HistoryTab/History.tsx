import { WorkoutHistory } from "./WorkoutHistory";
import { Card } from "../../design/Card";
import { PageBackground } from "../../design/PageBackground";
import { calculatePhase } from "../../engine/phaseEngine";
import { useLatestCycleLog } from "../../db/hooks";

export function History() {
  const latestCycle = useLatestCycleLog();
  const phase = latestCycle
    ? calculatePhase(latestCycle.periodStartDate, latestCycle.cycleLength, latestCycle.periodLength).phase
    : "follicular" as const;

  return (
    <div style={{ position: "relative", minHeight: "100%" }}>
      <PageBackground phase={phase} />
      <div style={{ position: "relative", zIndex: 1, padding: "24px 16px 32px" }}>
        <span className="section-label" style={{ display: "block", marginBottom: 16 }}>
          Log
        </span>
        <Card>
          <WorkoutHistory />
        </Card>
      </div>
    </div>
  );
}
