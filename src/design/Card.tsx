import { type ReactNode, type CSSProperties } from "react";

type Phase = "menstrual" | "follicular" | "ovulatory" | "luteal";

interface CardProps {
  children: ReactNode;
  phase?: Phase;
  onClick?: () => void;
  style?: CSSProperties;
  className?: string;
}

const phaseColors: Record<Phase, string> = {
  menstrual: "var(--phase-menstrual)",
  follicular: "var(--phase-follicular)",
  ovulatory: "var(--phase-ovulatory)",
  luteal: "var(--phase-luteal)",
};

export function Card({ children, phase, onClick, style, className }: CardProps) {
  return (
    <div
      className={`card ${className ?? ""}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      style={{
        position: "relative",
        background: "var(--bg-elevated)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-card)",
        padding: "14px 16px",
        overflow: "hidden",
        cursor: onClick ? "pointer" : undefined,
        ...style,
      }}
    >
      {phase && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 3,
            background: phaseColors[phase],
          }}
        />
      )}
      {children}
    </div>
  );
}
