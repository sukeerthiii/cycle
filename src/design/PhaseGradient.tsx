import type { Phase } from "../models/types";

interface PhaseGradientProps {
  phase: Phase;
  height?: string;
}

// All four colors always present. The active phase is bigger/brighter.
// Positions shift per phase so the dominant color sits in a different zone.
const gradientConfigs: Record<Phase, string> = {
  menstrual: `
    radial-gradient(ellipse 80% 70% at 20% 30%, rgba(196, 112, 90, 0.7) 0%, transparent 55%),
    radial-gradient(ellipse 60% 50% at 80% 20%, rgba(155, 126, 155, 0.35) 0%, transparent 50%),
    radial-gradient(ellipse 50% 60% at 70% 80%, rgba(139, 168, 136, 0.25) 0%, transparent 50%),
    radial-gradient(ellipse 40% 40% at 30% 75%, rgba(123, 158, 189, 0.3) 0%, transparent 45%),
    linear-gradient(160deg, #8B6B60 0%, #A07878 30%, #7B8B7B 60%, #6B7B8B 100%)
  `,
  follicular: `
    radial-gradient(ellipse 80% 70% at 70% 25%, rgba(139, 168, 136, 0.65) 0%, transparent 55%),
    radial-gradient(ellipse 60% 60% at 15% 35%, rgba(212, 133, 110, 0.4) 0%, transparent 50%),
    radial-gradient(ellipse 50% 50% at 40% 80%, rgba(155, 126, 155, 0.25) 0%, transparent 45%),
    radial-gradient(ellipse 45% 45% at 85% 75%, rgba(212, 168, 67, 0.2) 0%, transparent 45%),
    linear-gradient(160deg, #7B8B6B 0%, #8BA888 30%, #A08878 60%, #8B7B8B 100%)
  `,
  ovulatory: `
    radial-gradient(ellipse 85% 70% at 40% 30%, rgba(212, 168, 67, 0.6) 0%, transparent 55%),
    radial-gradient(ellipse 60% 55% at 10% 60%, rgba(196, 112, 90, 0.4) 0%, transparent 50%),
    radial-gradient(ellipse 55% 50% at 80% 15%, rgba(142, 154, 184, 0.35) 0%, transparent 50%),
    radial-gradient(ellipse 40% 45% at 70% 80%, rgba(139, 168, 136, 0.2) 0%, transparent 45%),
    linear-gradient(160deg, #B09060 0%, #C0A070 30%, #908080 60%, #708080 100%)
  `,
  luteal: `
    radial-gradient(ellipse 80% 70% at 60% 25%, rgba(155, 126, 155, 0.6) 0%, transparent 55%),
    radial-gradient(ellipse 60% 55% at 10% 20%, rgba(196, 112, 90, 0.35) 0%, transparent 50%),
    radial-gradient(ellipse 55% 50% at 85% 70%, rgba(139, 168, 136, 0.3) 0%, transparent 50%),
    radial-gradient(ellipse 45% 45% at 30% 80%, rgba(142, 154, 184, 0.3) 0%, transparent 45%),
    linear-gradient(160deg, #8B7090 0%, #A08890 30%, #708B70 60%, #7080A0 100%)
  `,
};

export function PhaseGradient({ phase, height = "42vh" }: PhaseGradientProps) {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height,
        background: gradientConfigs[phase],
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}
