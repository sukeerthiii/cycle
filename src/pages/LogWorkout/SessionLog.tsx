import { useState } from "react";
import { motion } from "framer-motion";
import type { WorkoutType, WorkoutSection, Phase } from "../../models/types";

interface SessionLogProps {
  type: WorkoutType;
  onSave: (section: WorkoutSection) => void;
  onClose: () => void;
  initialData?: WorkoutSection;
  phase: Phase;
}

const typeLabels: Partial<Record<WorkoutType, string>> = {
  pilates: "Pilates",
  yoga: "Yoga",
  mobility: "Mobility / Stretches",
  cardio: "Cardio",
};

const phaseColorMap: Record<Phase, string> = {
  menstrual: "var(--phase-menstrual)",
  follicular: "var(--phase-follicular)",
  ovulatory: "var(--phase-ovulatory)",
  luteal: "var(--phase-luteal)",
};

export function SessionLog({ type, onSave, onClose, initialData, phase }: SessionLogProps) {
  const initMinutes = initialData?.duration ?? 30;
  const [hours, setHours] = useState(Math.floor(initMinutes / 60));
  const [minutes, setMinutes] = useState(initMinutes % 60);
  const [notes, setNotes] = useState(initialData?.notes ?? "");
  const color = phaseColorMap[phase];

  function handleSave() {
    const totalMinutes = hours * 60 + minutes;
    if (totalMinutes === 0) return;
    onSave({ type, exercises: [], duration: totalMinutes, steps: null, distance: null, notes: notes.trim() || null });
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "var(--bg-primary)", zIndex: 350, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px" }}>
        <button onClick={onClose} style={headerBtnStyle}>Cancel</button>
        <span className="display-heading" style={{ fontSize: 18 }}>{typeLabels[type] ?? type}</span>
        <button onClick={handleSave} style={{ ...headerBtnStyle, color }}>Save</button>
      </div>

      <div style={{ padding: "24px 20px" }}>
        <label className="body-small" style={{ color: "var(--text-secondary)", display: "block", marginBottom: 8 }}>Duration</label>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <DurationField value={hours} onChange={setHours} label="hr" max={5} color={color} />
          <span style={{ color: "var(--text-tertiary)", fontSize: 20 }}>:</span>
          <DurationField value={minutes} onChange={setMinutes} label="min" max={59} color={color} />
        </div>

        <label className="body-small" style={{ color: "var(--text-secondary)", display: "block", marginBottom: 8 }}>Notes</label>
        <textarea
          placeholder={type === "mobility" ? "e.g. hip focus, foam roll, 90/90s" : "e.g. reformer class, yin flow"}
          value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
          style={{
            width: "100%", fontFamily: "var(--font-body)", fontSize: 16, fontWeight: 400,
            color: "var(--text-primary)", background: "var(--bg-elevated)", border: "none",
            borderRadius: "var(--radius-md)", padding: "12px 14px", resize: "none", outline: "none",
          }}
        />
      </div>
    </div>
  );
}

function DurationField({ value, onChange, label, max, color }: {
  value: number; onChange: (v: number) => void; label: string; max: number; color: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <motion.button whileTap={{ scale: 0.9 }} onClick={() => onChange(Math.max(0, value - 1))}
        style={stepBtn(color)}>−</motion.button>
      <div style={{ textAlign: "center", minWidth: 48 }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: "var(--text-primary)", fontVariantNumeric: "tabular-nums" }}>
          {value}
        </span>
        <span className="body-caption" style={{ display: "block", marginTop: -2 }}>{label}</span>
      </div>
      <motion.button whileTap={{ scale: 0.9 }} onClick={() => onChange(Math.min(max, value + 1))}
        style={stepBtn(color)}>+</motion.button>
    </div>
  );
}

function stepBtn(color: string): React.CSSProperties {
  return {
    background: "var(--bg-elevated)", border: "none", borderRadius: "var(--radius-sm)",
    color, fontSize: 20, fontFamily: "var(--font-body)", fontWeight: 600,
    width: 40, height: 40, cursor: "pointer", WebkitTapHighlightColor: "transparent",
  };
}

const headerBtnStyle: React.CSSProperties = {
  background: "none", border: "none", fontFamily: "var(--font-body)",
  fontSize: 16, fontWeight: 500, color: "var(--text-secondary)", cursor: "pointer", padding: 4,
};
