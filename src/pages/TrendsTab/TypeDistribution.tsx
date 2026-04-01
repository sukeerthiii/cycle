import { Card } from "../../design/Card";

interface TypeDistributionProps {
  distribution: Record<string, number>;
}

const typeConfig: { type: string; label: string; color: string }[] = [
  { type: "strength", label: "Strength", color: "var(--accent)" },
  { type: "pilates", label: "Pilates", color: "var(--phase-follicular)" },
  { type: "yoga", label: "Yoga", color: "var(--phase-luteal)" },
  { type: "mobility", label: "Mobility", color: "var(--phase-ovulatory)" },
  { type: "walk", label: "Walk", color: "var(--text-secondary)" },
];

export function TypeDistribution({ distribution }: TypeDistributionProps) {
  const total = Object.values(distribution).reduce((a, b) => a + b, 0);
  if (total === 0) {
    return (
      <Card>
        <span style={{ fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 600, display: "block", marginBottom: 8 }}>
          Workout Types
        </span>
        <p className="body-caption" style={{ color: "var(--text-tertiary)" }}>No data yet.</p>
      </Card>
    );
  }

  return (
    <Card>
      <span style={{ fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 600, display: "block", marginBottom: 14 }}>
        Workout Types
      </span>

      {/* Stacked bar */}
      <div style={{ display: "flex", height: 12, borderRadius: 6, overflow: "hidden", marginBottom: 12 }}>
        {typeConfig.map(({ type, color }) => {
          const count = distribution[type] ?? 0;
          if (count === 0) return null;
          return (
            <div
              key={type}
              style={{
                flex: count,
                background: color,
                minWidth: count > 0 ? 4 : 0,
              }}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        {typeConfig.map(({ type, label, color }) => {
          const count = distribution[type] ?? 0;
          if (count === 0) return null;
          return (
            <div key={type} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
              <span style={{
                fontFamily: "var(--font-body)",
                fontSize: 12,
                color: "var(--text-secondary)",
              }}>
                {label} ({count})
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
