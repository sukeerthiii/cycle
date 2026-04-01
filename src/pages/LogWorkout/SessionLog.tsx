import { useState } from "react";
import { motion } from "framer-motion";
import type { WorkoutType, WorkoutSection } from "../../models/types";

interface SessionLogProps {
  type: WorkoutType;
  onSave: (section: WorkoutSection) => void;
  onClose: () => void;
  initialData?: WorkoutSection;
}

const typeLabels: Partial<Record<WorkoutType, string>> = {
  pilates: "Pilates",
  yoga: "Yoga",
  mobility: "Mobility / Stretches",
};

export function SessionLog({ type, onSave, onClose, initialData }: SessionLogProps) {
  const initMinutes = initialData?.duration ?? 30;
  const [hours, setHours] = useState(Math.floor(initMinutes / 60));
  const [minutes, setMinutes] = useState(initMinutes % 60);
  const [notes, setNotes] = useState(initialData?.notes ?? "");

  function handleSave() {
    const totalMinutes = hours * 60 + minutes;
    if (totalMinutes === 0) return;
    const section: WorkoutSection = {
      type,
      exercises: [],
      duration: totalMinutes,
      steps: null,
      distance: null,
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
        <span className="display-heading" style={{ fontSize: 18 }}>
          {typeLabels[type] ?? type}
        </span>
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
          <DurationField
            value={hours}
            onChange={setHours}
            label="hr"
            max={5}
          />
          <span style={{ color: "var(--text-tertiary)", fontSize: 20 }}>:</span>
          <DurationField
            value={minutes}
            onChange={setMinutes}
            label="min"
            max={59}
          />
        </div>

        {/* Notes */}
        <label className="body-small" style={{ color: "var(--text-secondary)", display: "block", marginBottom: 8 }}>
          Notes
        </label>
        <textarea
          placeholder={type === "mobility" ? "e.g. hip focus, foam roll, 90/90s" : "e.g. reformer class, yin flow"}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          style={{
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
          }}
        />
      </div>
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
