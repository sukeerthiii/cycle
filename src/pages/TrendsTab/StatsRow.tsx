import type { Phase } from "../../models/types";

interface StatsRowProps {
  cycleDay: number;
  phase: Phase;
  compliance: number;
  sessions: number;
  targetSessions: number;
  volume: number;
}

const phaseLabels: Record<Phase, string> = {
  menstrual: "Menstrual",
  follicular: "Follicular",
  ovulatory: "Ovulatory",
  luteal: "Luteal",
};

export function StatsRow({
  cycleDay,
  phase,
  compliance,
  sessions,
  targetSessions,
  volume,
}: StatsRowProps) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: 8,
      marginBottom: 20,
    }}>
      <StatTile
        value={`Day ${cycleDay}`}
        label={phaseLabels[phase]}
        color={`var(--phase-${phase})`}
      />
      <StatTile
        value={`${compliance}%`}
        label="Compliance"
        color={compliance >= 70 ? "var(--phase-follicular)" : "var(--phase-menstrual)"}
      />
      <StatTile
        value={`${sessions}`}
        label={`of ${targetSessions}`}
        color="var(--text-primary)"
      />
      <StatTile
        value={volume > 0 ? `${(volume / 1000).toFixed(1)}k` : "0"}
        label="lb volume"
        color="var(--text-primary)"
      />
    </div>
  );
}

function StatTile({
  value,
  label,
  color,
}: {
  value: string;
  label: string;
  color: string;
}) {
  return (
    <div style={{
      background: "var(--bg-elevated)",
      borderRadius: "var(--radius-md)",
      padding: "12px 8px",
      textAlign: "center",
    }}>
      <div style={{
        fontFamily: "var(--font-display)",
        fontSize: 20,
        fontWeight: 700,
        color,
        lineHeight: 1.2,
        fontVariantNumeric: "tabular-nums",
      }}>
        {value}
      </div>
      <div style={{
        fontFamily: "var(--font-body)",
        fontSize: 11,
        fontWeight: 400,
        color: "var(--text-tertiary)",
        marginTop: 2,
      }}>
        {label}
      </div>
    </div>
  );
}
