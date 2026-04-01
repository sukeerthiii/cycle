import { motion } from "framer-motion";

type Phase = "menstrual" | "follicular" | "ovulatory" | "luteal";

interface PhaseRingProps {
  cycleDay: number;
  totalDays: number;
  phase: Phase;
  phaseName: string;
}

const phaseColorMap: Record<Phase, string> = {
  menstrual: "var(--phase-menstrual)",
  follicular: "var(--phase-follicular)",
  ovulatory: "var(--phase-ovulatory)",
  luteal: "var(--phase-luteal)",
};

const glowColorMap: Record<Phase, string> = {
  menstrual: "var(--phase-menstrual-glow)",
  follicular: "var(--phase-follicular-glow)",
  ovulatory: "var(--phase-ovulatory-glow)",
  luteal: "var(--phase-luteal-glow)",
};

const SIZE = 200;
const STROKE = 8;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const CENTER = SIZE / 2;

export function PhaseRing({ cycleDay, totalDays, phase, phaseName }: PhaseRingProps) {
  const progress = cycleDay / totalDays;
  const offset = CIRCUMFERENCE * (1 - progress);
  const color = phaseColorMap[phase];
  const glow = glowColorMap[phase];

  return (
    <div
      style={{
        position: "relative",
        width: SIZE,
        height: SIZE,
        margin: "0 auto",
      }}
    >
      {/* Glow */}
      <div
        style={{
          position: "absolute",
          inset: -20,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${glow} 0%, transparent 70%)`,
          filter: "blur(20px)",
        }}
      />

      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        style={{ position: "relative", transform: "rotate(-90deg)" }}
      >
        {/* Track */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          stroke="var(--bg-elevated)"
          strokeWidth={STROKE}
        />
        {/* Progress */}
        <motion.circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          initial={{ strokeDashoffset: CIRCUMFERENCE }}
          animate={{ strokeDashoffset: offset }}
          transition={{ type: "spring", stiffness: 60, damping: 20 }}
        />
      </svg>

      {/* Center text */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <span
          className="display-hero"
          style={{ color: "var(--text-primary)", lineHeight: 1 }}
        >
          {cycleDay}
        </span>
        <span className="display-phase" style={{ color }}>
          {phaseName}
        </span>
      </div>
    </div>
  );
}
