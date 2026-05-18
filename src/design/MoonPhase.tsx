import type { Phase } from "../models/types";

interface MoonPhaseProps {
  phase: Phase;
  size?: number;
}

export function MoonPhase({ phase, size = 28 }: MoonPhaseProps) {
  // Map cycle phases to moon illumination
  // menstrual = new moon (dark), follicular = waxing crescent,
  // ovulatory = full moon, luteal = waning gibbous
  const illumination: Record<Phase, number> = {
    menstrual: 0.05,
    follicular: 0.35,
    ovulatory: 1.0,
    luteal: 0.65,
  };

  const lit = illumination[phase];
  const r = size / 2;

  // Crescent effect using two overlapping circles
  const offset = r * (1 - lit * 2);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <mask id={`moon-mask-${phase}`}>
          <rect width={size} height={size} fill="white" />
          {lit < 1 && (
            <circle
              cx={r + offset}
              cy={r}
              r={r * 0.95}
              fill="black"
            />
          )}
        </mask>
      </defs>
      <circle
        cx={r}
        cy={r}
        r={r - 1}
        fill="rgba(255, 255, 255, 0.7)"
        mask={lit < 1 ? `url(#moon-mask-${phase})` : undefined}
      />
      <circle
        cx={r}
        cy={r}
        r={r - 1}
        fill="none"
        stroke="rgba(255, 255, 255, 0.3)"
        strokeWidth="0.5"
      />
    </svg>
  );
}
