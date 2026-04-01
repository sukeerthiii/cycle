import type { MovementPattern } from "../../models/types";

const PATTERNS: { pattern: MovementPattern; label: string }[] = [
  { pattern: "squat", label: "Squat" },
  { pattern: "hinge", label: "Hinge" },
  { pattern: "lunge", label: "Lunge" },
  { pattern: "push", label: "Push" },
  { pattern: "pull", label: "Pull" },
  { pattern: "core", label: "Core" },
];

interface PatternChecklistProps {
  patternsHit: Set<MovementPattern>;
}

export function PatternChecklist({ patternsHit }: PatternChecklistProps) {
  return (
    <div>
      <span className="body-caption" style={{ display: "block", marginBottom: 10 }}>
        This week's coverage
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
                  background: filled ? "var(--accent)" : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto",
                  transition: "all 0.3s ease",
                }}
              >
                {filled && (
                  <span style={{ color: "var(--bg-primary)", fontSize: 14, fontWeight: 700 }}>✓</span>
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
