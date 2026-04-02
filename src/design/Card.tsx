import { type ReactNode, type CSSProperties } from "react";

interface CardProps {
  children: ReactNode;
  onClick?: () => void;
  style?: CSSProperties;
  className?: string;
}

export function Card({ children, onClick, style, className }: CardProps) {
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
      {children}
    </div>
  );
}
