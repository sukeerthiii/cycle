import { useState, useRef } from "react";

type Phase = "menstrual" | "follicular" | "ovulatory" | "luteal";

interface StepsCounterProps {
  steps: number | null;
  target: number;
  onChange: (steps: number | null) => void;
  phase: Phase;
}

export function StepsCounter({ steps, onChange, phase }: StepsCounterProps) {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const display = steps !== null ? steps.toLocaleString() : "—";

  function handleTap() {
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function handleBlur() { setEditing(false); }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.replace(/\D/g, "");
    onChange(val ? parseInt(val, 10) : null);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") { setEditing(false); inputRef.current?.blur(); }
  }

  return (
    <div onClick={handleTap} style={{ cursor: "pointer" }}>
      {editing ? (
        <input
          ref={inputRef} type="text" inputMode="numeric" pattern="[0-9]*"
          value={steps ?? ""} onChange={handleChange} onBlur={handleBlur} onKeyDown={handleKeyDown}
          style={{
            fontFamily: "var(--font-body)", fontSize: 20, fontWeight: 300,
            color: "var(--text-primary)", background: "transparent", border: "none",
            borderBottom: `2px solid var(--phase-${phase})`, width: 100, outline: "none",
          }}
        />
      ) : (
        <span style={{
          fontFamily: "var(--font-body)", fontSize: 20, fontWeight: 300,
          color: steps ? "var(--text-primary)" : "var(--text-tertiary)",
        }}>
          {display}
        </span>
      )}
    </div>
  );
}
