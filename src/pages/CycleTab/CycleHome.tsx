import { PhaseRing } from "../../design/PhaseRing";
import { StepsCounter } from "./StepsCounter";
import { Card } from "../../design/Card";
import { CollapsibleCard } from "../../design/CollapsibleCard";
import type { Phase } from "../../models/types";
import { profile } from "../../models/profile";
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
}

const phaseLabels: Record<Phase, string> = {
  menstrual: "Menstrual",
  follicular: "Follicular",
  ovulatory: "Ovulatory",
  luteal: "Luteal",
};

export function CycleHome({
  cycleDay,
  totalDays,
  phase,
  steps,
  onStepsChange,
}: CycleHomeProps) {
  return (
    <div style={{ padding: "24px 16px 32px" }}>
      {/* Settings gear — top right */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
        <button
          style={{
            background: "none",
            border: "none",
            color: "var(--text-tertiary)",
            fontSize: 20,
            cursor: "pointer",
            padding: 4,
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
          target={profile.stepTarget}
          onChange={onStepsChange}
        />
      </div>

      {/* Phase context card */}
      <div style={{ marginTop: 24 }}>
        <Card phase={phase}>
          <p
            className="body-primary"
            style={{ color: "var(--text-primary)", lineHeight: 1.6 }}
          >
            {getContextMessage(phase, cycleDay)}
          </p>
        </Card>
      </div>

      {/* Nutrition nudge */}
      <div style={{ marginTop: 16 }}>
        <CollapsibleCard title="Nutrition" phase={phase}>
          <p className="body-small" style={{ color: "var(--text-primary)", lineHeight: 1.6 }}>
            {getNutritionNudge(phase)}
          </p>
        </CollapsibleCard>
      </div>

      {/* Science "Why" card */}
      <div style={{ marginTop: 16 }}>
        <CollapsibleCard title="Why" phase={phase} defaultOpen={false}>
          <p className="body-small" style={{ color: "var(--text-primary)", lineHeight: 1.6 }}>
            {getScienceSnippet(phase)}
          </p>
        </CollapsibleCard>
      </div>
    </div>
  );
}
