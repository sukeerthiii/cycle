import { useState, useRef } from "react";

interface StepsCounterProps {
  steps: number | null;
  target: number;
  onChange: (steps: number | null) => void;
}

export function StepsCounter({ steps, target, onChange }: StepsCounterProps) {
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
              fontSize: 28,
              fontWeight: 400,
              color: "var(--text-primary)",
              background: "transparent",
              border: "none",
              borderBottom: "2px solid var(--accent)",
              textAlign: "center",
              width: 120,
              outline: "none",
            }}
          />
        ) : (
          <span
            className="display-heading"
            style={{
              color: steps ? "var(--text-primary)" : "var(--text-tertiary)",
              fontSize: 28,
            }}
          >
            {display}
          </span>
        )}
      </div>

      <div
        className="body-caption"
        style={{ marginTop: 4, color: "var(--text-secondary)" }}
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
            background: "var(--accent)",
            borderRadius: 2,
            transition: "width 0.4s ease",
          }}
        />
      </div>
    </div>
  );
}
