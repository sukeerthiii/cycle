import { PhaseGradient } from "../../design/PhaseGradient";
import { PhaseIcon } from "../../design/PhaseIcon";
import { StepsCounter } from "./StepsCounter";
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

function formatDate(): string {
  const now = new Date();
  return now.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function glassStyle(phase: Phase): React.CSSProperties {
  return {
    background: `var(--phase-${phase}-muted)`,
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    borderRadius: "var(--radius-lg)",
    border: "1px solid rgba(255, 255, 255, 0.6)",
    boxShadow: "0 2px 12px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.03), inset 0 1px 0 rgba(255, 255, 255, 0.4)",
    padding: "16px",
  };
}

export function CycleHome({
  cycleDay,
  totalDays,
  phase,
  steps,
  onStepsChange,
  onOpenSettings,
}: CycleHomeProps) {
  const date = formatDate();
  const stepTarget = getStepTarget(phase);
  const cycleProgress = cycleDay / totalDays;
  const stepProgress = steps ? Math.min(steps / stepTarget, 1) : 0;

  return (
    <div style={{ position: "relative", minHeight: "100%", background: "#FAFAF8" }}>
      <PhaseGradient phase={phase} height="42vh" />

      {/* Settings on gradient */}
      <div style={{ position: "relative", zIndex: 1, padding: "20px 24px 0" }}>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button onClick={onOpenSettings} style={{
            background: "none", border: "none", cursor: "pointer",
            padding: 4, lineHeight: 1,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </div>
      </div>

      <div style={{ height: "30vh" }} />

      {/* Data zone — overlaps gradient for glass-on-gradient effect */}
      <div style={{ position: "relative", zIndex: 1, padding: "0 20px 32px" }}>

        {/* Phase + Day header — glassy */}
        <div style={{ ...glassStyle(phase), marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "var(--text-secondary)" }}>
              Cycle Phase
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 400, color: "var(--text-tertiary)" }}>
              {date}
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span style={{
                fontFamily: "var(--font-body)", fontSize: 22, fontWeight: 700,
                color: `var(--phase-${phase})`, letterSpacing: "0.02em",
                display: "block", marginBottom: 4,
              }}>
                {phaseLabels[phase]}
              </span>
              <span style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 400, color: "var(--text-secondary)" }}>
                Day {cycleDay} of {totalDays}
              </span>
            </div>
            <PhaseIcon phase={phase} size={40} color={`var(--phase-${phase})`} />
          </div>

          {/* Cycle progress */}
          <div style={{ height: 3, borderRadius: 2, background: "rgba(0,0,0,0.06)", overflow: "hidden", marginTop: 14 }}>
            <div style={{
              height: "100%", width: `${cycleProgress * 100}%`,
              background: `linear-gradient(90deg, var(--phase-${phase}), var(--phase-${phase}-contrast))`,
              borderRadius: 2, transition: "width 0.4s ease",
            }} />
          </div>
        </div>

        {/* Steps — glassy */}
        <div style={{ ...glassStyle(phase), marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "var(--text-secondary)" }}>
              Steps
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "var(--text-secondary)" }}>
              {stepTarget.toLocaleString()} goal
            </span>
          </div>

          <StepsCounter steps={steps} target={stepTarget} onChange={onStepsChange} phase={phase} />

          <div style={{ height: 6, borderRadius: 3, background: "rgba(0,0,0,0.06)", overflow: "hidden", marginTop: 10 }}>
            <div style={{
              height: "100%", width: `${stepProgress * 100}%`,
              background: `linear-gradient(90deg, var(--phase-${phase}), var(--phase-${phase}-contrast))`,
              borderRadius: 3, transition: "width 0.4s ease",
            }} />
          </div>
        </div>

        {/* Phase context — glassy */}
        <div style={{ ...glassStyle(phase), marginBottom: 12 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "var(--text-secondary)", display: "block", marginBottom: 8 }}>
            Phase
          </span>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 400, color: "var(--text-secondary)", lineHeight: 1.7 }}>
            {getContextMessage(phase, cycleDay)}
          </p>
        </div>

        {/* Fuel + Anatomy — glassy, side by side */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, alignItems: "start" }}>
          <div style={glassStyle(phase)}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "var(--text-secondary)", display: "block", marginBottom: 8 }}>
              Fuel
            </span>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 400, color: "var(--text-secondary)", lineHeight: 1.6 }}>
              {getNutritionNudge(phase)}
            </p>
          </div>
          <div style={glassStyle(phase)}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "var(--text-secondary)", display: "block", marginBottom: 8 }}>
              Anatomy
            </span>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 400, color: "var(--text-secondary)", lineHeight: 1.6 }}>
              {getScienceSnippet(phase)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
