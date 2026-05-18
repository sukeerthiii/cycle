import type { Phase } from "../models/types";

interface PageBackgroundProps {
  phase: Phase;
}

const bgGradients: Record<Phase, string> = {
  menstrual: `
    radial-gradient(ellipse 80% 60% at 15% 10%, rgba(196, 112, 90, 0.22) 0%, transparent 55%),
    radial-gradient(ellipse 60% 50% at 85% 75%, rgba(123, 158, 189, 0.15) 0%, transparent 50%),
    radial-gradient(ellipse 40% 40% at 50% 50%, rgba(155, 126, 155, 0.08) 0%, transparent 45%),
    linear-gradient(170deg, rgba(196, 112, 90, 0.1) 0%, rgba(250, 250, 248, 1) 80%)
  `,
  follicular: `
    radial-gradient(ellipse 80% 60% at 80% 8%, rgba(139, 168, 136, 0.22) 0%, transparent 55%),
    radial-gradient(ellipse 60% 50% at 10% 70%, rgba(212, 133, 110, 0.15) 0%, transparent 50%),
    radial-gradient(ellipse 40% 40% at 50% 40%, rgba(212, 168, 67, 0.08) 0%, transparent 45%),
    linear-gradient(170deg, rgba(139, 168, 136, 0.1) 0%, rgba(250, 250, 248, 1) 80%)
  `,
  ovulatory: `
    radial-gradient(ellipse 80% 60% at 40% 8%, rgba(212, 168, 67, 0.22) 0%, transparent 55%),
    radial-gradient(ellipse 60% 50% at 85% 65%, rgba(142, 154, 184, 0.15) 0%, transparent 50%),
    radial-gradient(ellipse 40% 40% at 20% 50%, rgba(196, 112, 90, 0.08) 0%, transparent 45%),
    linear-gradient(170deg, rgba(212, 168, 67, 0.1) 0%, rgba(250, 250, 248, 1) 80%)
  `,
  luteal: `
    radial-gradient(ellipse 80% 60% at 65% 8%, rgba(155, 126, 155, 0.22) 0%, transparent 55%),
    radial-gradient(ellipse 60% 50% at 15% 70%, rgba(139, 168, 136, 0.15) 0%, transparent 50%),
    radial-gradient(ellipse 40% 40% at 50% 40%, rgba(123, 158, 189, 0.08) 0%, transparent 45%),
    linear-gradient(170deg, rgba(155, 126, 155, 0.1) 0%, rgba(250, 250, 248, 1) 80%)
  `,
};

export function PageBackground({ phase }: PageBackgroundProps) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: bgGradients[phase],
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}
