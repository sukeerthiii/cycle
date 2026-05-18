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
        background: "rgba(255, 255, 255, 0.45)",
        backdropFilter: "blur(24px) saturate(1.2)",
        WebkitBackdropFilter: "blur(24px) saturate(1.2)",
        borderRadius: "var(--radius-lg)",
        border: "1px solid rgba(255, 255, 255, 0.65)",
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.03), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
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
