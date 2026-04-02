import type { MovementPattern, Phase } from "../../models/types";

const PATTERNS: { pattern: MovementPattern; label: string }[] = [
  { pattern: "squat", label: "Squat" },
  { pattern: "hinge", label: "Hinge" },
  { pattern: "lunge", label: "Lunge" },
  { pattern: "push", label: "Push" },
  { pattern: "pull", label: "Pull" },
  { pattern: "core", label: "Core" },
];

const phaseColorMap: Record<Phase, string> = {
  menstrual: "var(--phase-menstrual)",
  follicular: "var(--phase-follicular)",
  ovulatory: "var(--phase-ovulatory)",
  luteal: "var(--phase-luteal)",
};

interface PatternChecklistProps {
  patternsHit: Set<MovementPattern>;
  phase: Phase;
}

export function PatternChecklist({ patternsHit, phase }: PatternChecklistProps) {
  const fillColor = phaseColorMap[phase];

  return (
    <div>
      <span style={{
        fontFamily: "var(--font-display)",
        fontSize: 16,
        fontWeight: 600,
        color: "var(--text-primary)",
        display: "block",
        marginBottom: 10,
      }}>
        Strength Weekly Split
      </span>
      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        {PATTERNS.map(({ pattern, label }) => {
          const filled = patternsHit.has(pattern);
          return (
            <div key={pattern} style={{ textAlign: "center" }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  border: filled ? "none" : "2px solid var(--text-tertiary)",
                  background: filled ? fillColor : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto",
                  transition: "all 0.3s ease",
                }}
              >
                {filled && (
                  <span style={{ color: "#FFFFFF", fontSize: 14, fontWeight: 700 }}>✓</span>
                )}
              </div>
              <span style={{
                fontFamily: "var(--font-body)",
                fontSize: 10,
                fontWeight: 500,
                color: filled ? "var(--text-primary)" : "var(--text-tertiary)",
                marginTop: 4,
                display: "block",
              }}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
