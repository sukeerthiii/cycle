import { Card } from "../../design/Card";
import type { Phase } from "../../models/types";

interface VolumeByPhaseProps {
  volumes: Record<Phase, number>;
}

const phases: { phase: Phase; label: string; color: string }[] = [
  { phase: "menstrual", label: "Menstrual", color: "var(--phase-menstrual)" },
  { phase: "follicular", label: "Follicular", color: "var(--phase-follicular)" },
  { phase: "ovulatory", label: "Ovulatory", color: "var(--phase-ovulatory)" },
  { phase: "luteal", label: "Luteal", color: "var(--phase-luteal)" },
];

export function VolumeByPhase({ volumes }: VolumeByPhaseProps) {
  const maxVol = Math.max(...Object.values(volumes), 1);

  return (
    <Card>
      <span style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, color: "var(--text-primary)", display: "block", marginBottom: 14 }}>
        Volume by Phase
      </span>

      {phases.map(({ phase, label, color }) => {
        const vol = volumes[phase] ?? 0;
        const pct = (vol / maxVol) * 100;
        return (
          <div key={phase} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
              <span style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 500, color }}>
                {label}
              </span>
              <span style={{
                fontFamily: "var(--font-body)",
                fontSize: 13,
                fontWeight: 400,
                color: "var(--text-secondary)",
                fontVariantNumeric: "tabular-nums",
              }}>
                {vol > 0 ? `${(vol / 1000).toFixed(1)}k lb` : "—"}
              </span>
            </div>
            <div style={{
              height: 6,
              borderRadius: 3,
              background: "var(--bg-primary)",
              overflow: "hidden",
            }}>
              <div style={{
                height: "100%",
                width: `${pct}%`,
                background: color,
                borderRadius: 3,
                transition: "width 0.4s ease",
              }} />
            </div>
          </div>
        );
      })}
    </Card>
  );
}
