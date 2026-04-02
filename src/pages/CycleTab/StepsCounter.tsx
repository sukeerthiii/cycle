import { useState, useRef } from "react";

type Phase = "menstrual" | "follicular" | "ovulatory" | "luteal";

interface StepsCounterProps {
  steps: number | null;
  target: number;
  onChange: (steps: number | null) => void;
  phase: Phase;
}

const phaseColorMap: Record<Phase, string> = {
  menstrual: "var(--phase-menstrual)",
  follicular: "var(--phase-follicular)",
  ovulatory: "var(--phase-ovulatory)",
  luteal: "var(--phase-luteal)",
};

export function StepsCounter({ steps, target, onChange, phase }: StepsCounterProps) {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const progress = steps ? Math.min(steps / target, 1) : 0;
  const display = steps !== null ? steps.toLocaleString() : "—";

  function handleTap() {
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function handleBlur() {
    setEditing(false);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.replace(/\D/g, "");
    onChange(val ? parseInt(val, 10) : null);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      setEditing(false);
      inputRef.current?.blur();
    }
  }

  return (
    <div style={{ textAlign: "center" }}>
      {/* Step count */}
      <div
        onClick={handleTap}
        style={{ cursor: "pointer", display: "inline-block" }}
      >
        {editing ? (
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={steps ?? ""}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 20,
              fontWeight: 600,
              color: "var(--text-primary)",
              background: "transparent",
              border: "none",
              borderBottom: `2px solid ${phaseColorMap[phase]}`,
              textAlign: "center",
              width: 120,
              outline: "none",
            }}
          />
        ) : (
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 20,
              fontWeight: 600,
              color: steps ? "var(--text-primary)" : "var(--text-tertiary)",
            }}
          >
            {display}
          </span>
        )}
      </div>

      <div
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 12,
          fontWeight: 400,
          color: "var(--text-secondary)",
          marginTop: 4,
        }}
      >
        steps · {target.toLocaleString()} goal
      </div>

      {/* Progress bar */}
      <div
        style={{
          marginTop: 8,
          height: 4,
          borderRadius: 2,
          background: "var(--bg-elevated)",
          width: "60%",
          marginInline: "auto",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress * 100}%`,
            background: phaseColorMap[phase],
            borderRadius: 2,
            transition: "width 0.4s ease",
          }}
        />
      </div>
    </div>
  );
}
