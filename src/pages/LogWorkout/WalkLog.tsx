import { useState } from "react";
import { motion } from "framer-motion";
import type { WorkoutSection } from "../../models/types";

interface WalkLogProps {
  onSave: (section: WorkoutSection) => void;
  onClose: () => void;
  initialData?: WorkoutSection;
}

export function WalkLog({ onSave, onClose, initialData }: WalkLogProps) {
  const initMinutes = initialData?.duration ?? 30;
  const [hours, setHours] = useState(Math.floor(initMinutes / 60));
  const [minutes, setMinutes] = useState(initMinutes % 60);
  const [steps, setSteps] = useState(initialData?.steps?.toString() ?? "");
  const [distance, setDistance] = useState(initialData?.distance?.toString() ?? "");
  const [notes, setNotes] = useState(initialData?.notes ?? "");

  function handleSave() {
    const totalMinutes = hours * 60 + minutes;
    if (totalMinutes === 0) return;
    const section: WorkoutSection = {
      type: "walk",
      exercises: [],
      duration: totalMinutes,
      steps: steps ? parseInt(steps, 10) : null,
      distance: distance ? parseFloat(distance) : null,
      notes: notes.trim() || null,
    };
    onSave(section);
  }

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "var(--bg-primary)",
      zIndex: 350,
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 20px",
      }}>
        <button onClick={onClose} style={headerBtnStyle}>Cancel</button>
        <span className="display-heading" style={{ fontSize: 18 }}>Walk</span>
        <button
          onClick={handleSave}
          style={{ ...headerBtnStyle, color: "var(--accent)" }}
        >
          Save
        </button>
      </div>

      <div style={{ padding: "24px 20px" }}>
        {/* Duration */}
        <label className="body-small" style={{ color: "var(--text-secondary)", display: "block", marginBottom: 8 }}>
          Duration
        </label>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <DurationField value={hours} onChange={setHours} label="hr" max={5} />
          <span style={{ color: "var(--text-tertiary)", fontSize: 20 }}>:</span>
          <DurationField value={minutes} onChange={setMinutes} label="min" max={59} />
        </div>

        {/* Steps */}
        <InputField
          label="Steps (auto-adds to daily total)"
          placeholder="e.g. 4500"
          value={steps}
          onChange={setSteps}
          inputMode="numeric"
        />

        {/* Distance */}
        <InputField
          label="Distance (km)"
          placeholder="e.g. 3.5"
          value={distance}
          onChange={setDistance}
          inputMode="decimal"
        />

        {/* Notes */}
        <label className="body-small" style={{ color: "var(--text-secondary)", display: "block", marginBottom: 8 }}>
          Notes
        </label>
        <textarea
          placeholder="e.g. evening walk, park"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          style={textareaStyle}
        />
      </div>
    </div>
  );
}

function InputField({
  label,
  placeholder,
  value,
  onChange,
  inputMode,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  inputMode: "numeric" | "decimal";
}) {
  return (
    <div style={{ marginBottom: 24 }}>
      <label className="body-small" style={{ color: "var(--text-secondary)", display: "block", marginBottom: 8 }}>
        {label}
      </label>
      <input
        type="text"
        inputMode={inputMode}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={inputStyle}
      />
    </div>
  );
}

function DurationField({
  value,
  onChange,
  label,
  max,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
  max: number;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => onChange(Math.max(0, value - 1))}
        style={stepBtnStyle}
      >
        −
      </motion.button>
      <div style={{ textAlign: "center", minWidth: 48 }}>
        <span style={{
          fontFamily: "var(--font-body)",
          fontSize: 28,
          fontWeight: 700,
          color: "var(--text-primary)",
          fontVariantNumeric: "tabular-nums",
        }}>
          {value}
        </span>
        <span className="body-caption" style={{ display: "block", marginTop: -2 }}>
          {label}
        </span>
      </div>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => onChange(Math.min(max, value + 1))}
        style={stepBtnStyle}
      >
        +
      </motion.button>
    </div>
  );
}

const headerBtnStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  fontFamily: "var(--font-body)",
  fontSize: 16,
  fontWeight: 500,
  color: "var(--text-secondary)",
  cursor: "pointer",
  padding: 4,
};

const stepBtnStyle: React.CSSProperties = {
  background: "var(--bg-elevated)",
  border: "none",
  borderRadius: "var(--radius-sm)",
  color: "var(--accent)",
  fontSize: 20,
  fontFamily: "var(--font-body)",
  fontWeight: 600,
  width: 40,
  height: 40,
  cursor: "pointer",
  WebkitTapHighlightColor: "transparent",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  fontFamily: "var(--font-body)",
  fontSize: 16,
  fontWeight: 400,
  color: "var(--text-primary)",
  background: "var(--bg-elevated)",
  border: "none",
  borderRadius: "var(--radius-md)",
  padding: "12px 14px",
  outline: "none",
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  fontFamily: "var(--font-body)",
  fontSize: 16,
  fontWeight: 400,
  color: "var(--text-primary)",
  background: "var(--bg-elevated)",
  border: "none",
  borderRadius: "var(--radius-md)",
  padding: "12px 14px",
  resize: "none",
  outline: "none",
};
