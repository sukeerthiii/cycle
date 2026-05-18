import { useState } from "react";
import type { WorkoutSection, Phase, RunInterval } from "../../models/types";

interface RunningLogProps {
  onSave: (section: WorkoutSection) => void;
  onClose: () => void;
  initialData?: WorkoutSection;
  phase: Phase;
}

const phaseColorMap: Record<Phase, string> = {
  menstrual: "var(--phase-menstrual)",
  follicular: "var(--phase-follicular)",
  ovulatory: "var(--phase-ovulatory)",
  luteal: "var(--phase-luteal)",
};

export function RunningLog({ onSave, onClose, initialData, phase }: RunningLogProps) {
  const [intervals, setIntervals] = useState<RunInterval[]>(
    initialData?.intervals ?? [
      { type: "run", durationSeconds: 120 },
      { type: "walk", durationSeconds: 60 },
    ]
  );
  const [distance, setDistance] = useState(initialData?.distance?.toString() ?? "");
  const [notes, setNotes] = useState(initialData?.notes ?? "");
  const color = phaseColorMap[phase];

  const totalRun = intervals.filter((i) => i.type === "run").reduce((a, i) => a + i.durationSeconds, 0);
  const totalWalk = intervals.filter((i) => i.type === "walk").reduce((a, i) => a + i.durationSeconds, 0);
  const totalTime = totalRun + totalWalk;
  const runPct = totalTime > 0 ? Math.round((totalRun / totalTime) * 100) : 0;

  function updateInterval(idx: number, changes: Partial<RunInterval>) {
    setIntervals((prev) => prev.map((iv, i) => i === idx ? { ...iv, ...changes } : iv));
  }

  function addInterval() {
    const lastType = intervals[intervals.length - 1]?.type ?? "walk";
    setIntervals((prev) => [...prev, { type: lastType === "run" ? "walk" : "run", durationSeconds: 60 }]);
  }

  function removeInterval(idx: number) {
    setIntervals((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleSave() {
    if (intervals.length === 0) return;
    onSave({
      type: "running",
      exercises: [],
      duration: Math.ceil(totalTime / 60),
      steps: null,
      distance: distance ? parseFloat(distance) : null,
      notes: notes.trim() || null,
      intervals,
    });
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(255, 255, 255, 0.75)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", zIndex: 350, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px" }}>
        <button onClick={onClose} style={headerBtnStyle}>Cancel</button>
        <span className="display-heading" style={{ fontSize: 18 }}>Running</span>
        <button onClick={handleSave} style={{ ...headerBtnStyle, color }}>Save</button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 120px" }}>
        {/* Summary */}
        <div style={{
          display: "flex", justifyContent: "space-around", padding: "12px 0 16px",
          borderBottom: "1px solid var(--bg-deep)", marginBottom: 16,
        }}>
          <SummaryItem label="Run" value={formatSec(totalRun)} color={color} />
          <SummaryItem label="Walk" value={formatSec(totalWalk)} color="var(--text-tertiary)" />
          <SummaryItem label="Run %" value={`${runPct}%`} color={color} />
        </div>

        {/* Intervals */}
        {intervals.map((iv, idx) => (
          <div key={idx} style={{
            display: "flex", alignItems: "center", gap: 10, marginBottom: 8,
            background: "var(--bg-elevated)", borderRadius: "var(--radius-md)", padding: "10px 14px",
          }}>
            {/* Type toggle */}
            <button
              onClick={() => updateInterval(idx, { type: iv.type === "run" ? "walk" : "run" })}
              style={{
                fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600,
                color: iv.type === "run" ? color : "var(--text-tertiary)",
                background: "var(--bg-primary)", border: "none", borderRadius: "var(--radius-sm)",
                padding: "4px 10px", cursor: "pointer", minWidth: 44, textAlign: "center",
              }}
            >
              {iv.type === "run" ? "Run" : "Walk"}
            </button>

            {/* Duration — minutes and seconds */}
            <div style={{ display: "flex", alignItems: "center", gap: 4, flex: 1 }}>
              <DurationInput
                value={Math.floor(iv.durationSeconds / 60)}
                onChange={(m) => updateInterval(idx, { durationSeconds: m * 60 + (iv.durationSeconds % 60) })}
                label="min"
                color={color}
              />
              <span style={{ color: "var(--text-tertiary)" }}>:</span>
              <DurationInput
                value={iv.durationSeconds % 60}
                onChange={(s) => updateInterval(idx, { durationSeconds: Math.floor(iv.durationSeconds / 60) * 60 + s })}
                label="sec"
                color={color}
              />
            </div>

            <button onClick={() => removeInterval(idx)} style={{
              background: "none", border: "none", color: "var(--text-tertiary)", fontSize: 14, cursor: "pointer",
            }}>✕</button>
          </div>
        ))}

        <button onClick={addInterval} style={{
          display: "block", width: "100%", padding: "12px", marginTop: 8,
          background: "var(--bg-elevated)", border: "none", borderRadius: "var(--radius-md)",
          fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 500, color, cursor: "pointer",
        }}>
          + Add interval
        </button>

        {/* Distance */}
        <div style={{ marginTop: 20 }}>
          <label className="body-small" style={{ color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Distance (km)</label>
          <input
            type="text" inputMode="decimal" placeholder="e.g. 2.5"
            value={distance} onChange={(e) => setDistance(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Notes */}
        <div style={{ marginTop: 16 }}>
          <label className="body-small" style={{ color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Notes</label>
          <textarea
            placeholder="e.g. felt good after interval 3"
            value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
            style={{ ...inputStyle, resize: "none" as const }}
          />
        </div>
      </div>
    </div>
  );
}

function SummaryItem({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <span style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color }}>{value}</span>
      <span style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--text-tertiary)", display: "block", marginTop: 2 }}>{label}</span>
    </div>
  );
}

function DurationInput({ value, onChange, label, color }: {
  value: number; onChange: (v: number) => void; label: string; color: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  function start() { setDraft(value.toString()); setEditing(true); }
  function commit() {
    const v = parseInt(draft, 10);
    if (!isNaN(v) && v >= 0) onChange(v);
    setEditing(false);
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
      <button onClick={() => onChange(Math.max(0, value - (label === "min" ? 1 : 5)))} style={stepBtnStyle(color)}>−</button>
      {editing ? (
        <input autoFocus type="text" inputMode="numeric" value={draft}
          onChange={(e) => setDraft(e.target.value)} onBlur={commit}
          onKeyDown={(e) => { if (e.key === "Enter") commit(); }}
          style={{ width: 30, fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 500, textAlign: "center",
            background: "transparent", border: "none", borderBottom: `2px solid ${color}`, outline: "none",
            color: "var(--text-primary)", fontVariantNumeric: "tabular-nums",
          }}
        />
      ) : (
        <span onClick={start} style={{
          fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 500, color: "var(--text-primary)",
          minWidth: 24, textAlign: "center", cursor: "pointer", fontVariantNumeric: "tabular-nums",
        }}>{value}</span>
      )}
      <button onClick={() => onChange(value + (label === "min" ? 1 : 5))} style={stepBtnStyle(color)}>+</button>
      <span style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "var(--text-tertiary)", marginLeft: 1 }}>{label}</span>
    </div>
  );
}

function formatSec(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return sec > 0 ? `${m}:${String(sec).padStart(2, "0")}` : `${m}:00`;
}

function stepBtnStyle(color: string): React.CSSProperties {
  return {
    background: "none", border: "none", color, fontSize: 16,
    fontFamily: "var(--font-body)", fontWeight: 600, cursor: "pointer",
    padding: "2px 6px", WebkitTapHighlightColor: "transparent",
  };
}

const headerBtnStyle: React.CSSProperties = {
  background: "none", border: "none", fontFamily: "var(--font-body)",
  fontSize: 16, fontWeight: 500, color: "var(--text-secondary)", cursor: "pointer", padding: 4,
};

const inputStyle: React.CSSProperties = {
  width: "100%", fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 400,
  color: "var(--text-primary)", background: "var(--bg-elevated)", border: "none",
  borderRadius: "var(--radius-md)", padding: "10px 14px", outline: "none",
};
