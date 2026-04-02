import { PhaseRing } from "../../design/PhaseRing";
import { StepsCounter } from "./StepsCounter";
import { Card } from "../../design/Card";
import { CollapsibleCard } from "../../design/CollapsibleCard";
import type { Phase } from "../../models/types";
import {
  getContextMessage,
  getNutritionNudge,
  getScienceSnippet,
} from "./cycleContent";

interface CycleHomeProps {
  cycleDay: number;
  totalDays: number;
  phase: Phase;
  steps: number | null;
  onStepsChange: (steps: number | null) => void;
  onOpenSettings: () => void;
}

const phaseLabels: Record<Phase, string> = {
  menstrual: "Menstrual",
  follicular: "Follicular",
  ovulatory: "Ovulatory",
  luteal: "Luteal",
};

function getStepTarget(phase: Phase): number {
  return phase === "follicular" || phase === "ovulatory" ? 10000 : 8000;
}

function formatToday(): { day: string; date: string } {
  const now = new Date();
  const day = now.toLocaleDateString("en-IN", { weekday: "long" });
  const date = now.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  return { day, date };
}

export function CycleHome({
  cycleDay,
  totalDays,
  phase,
  steps,
  onStepsChange,
  onOpenSettings,
}: CycleHomeProps) {
  const { day, date } = formatToday();
  const stepTarget = getStepTarget(phase);

  return (
    <div style={{ padding: "24px 16px 32px" }}>
      {/* Header row: Today + settings */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h1 className="display-heading" style={{ fontSize: 24, marginBottom: 2 }}>
            Today
          </h1>
          <p className="body-small" style={{ color: "var(--text-secondary)" }}>
            {day}, {date}
          </p>
        </div>
        <button
          onClick={onOpenSettings}
          style={{
            background: "none",
            border: "none",
            color: "var(--text-tertiary)",
            fontSize: 20,
            cursor: "pointer",
            padding: 4,
            marginTop: 4,
          }}
        >
          ⚙
        </button>
      </div>

      {/* Phase ring */}
      <PhaseRing
        cycleDay={cycleDay}
        totalDays={totalDays}
        phase={phase}
        phaseName={phaseLabels[phase]}
      />

      {/* Steps counter */}
      <div style={{ marginTop: 24 }}>
        <StepsCounter
          steps={steps}
          target={stepTarget}
          onChange={onStepsChange}
          phase={phase}
        />
      </div>

      {/* Phase context card */}
      <div style={{ marginTop: 24 }}>
        <Card>
          <span style={{
            fontFamily: "var(--font-display)",
            fontSize: 17,
            fontWeight: 600,
            color: "var(--text-primary)",
            display: "block",
            marginBottom: 6,
          }}>
            Phase
          </span>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 14,
              fontWeight: 400,
              color: "var(--text-secondary)",
              lineHeight: 1.6,
            }}
          >
            {getContextMessage(phase, cycleDay)}
          </p>
        </Card>
      </div>

      {/* Fuel + Anatomy — side by side */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16, alignItems: "start" }}>
        <CollapsibleCard title="Fuel">
          <p style={{
            fontFamily: "var(--font-body)",
            fontSize: 14,
            fontWeight: 400,
            color: "var(--text-secondary)",
            lineHeight: 1.6,
          }}>
            {getNutritionNudge(phase)}
          </p>
        </CollapsibleCard>

        <CollapsibleCard title="Anatomy" defaultOpen={false}>
          <p style={{
            fontFamily: "var(--font-body)",
            fontSize: 14,
            fontWeight: 400,
            color: "var(--text-secondary)",
            lineHeight: 1.6,
          }}>
            {getScienceSnippet(phase)}
          </p>
        </CollapsibleCard>
      </div>
    </div>
  );
}
