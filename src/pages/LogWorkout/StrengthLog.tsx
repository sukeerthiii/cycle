import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExerciseSearch } from "./ExerciseSearch";
import { addExercise } from "../../db/hooks";
import type { Exercise, ExerciseEntry, SetEntry, WorkoutSection, MovementPattern, Phase } from "../../models/types";
import { profile } from "../../models/profile";

interface StrengthLogProps {
  onSave: (section: WorkoutSection) => void;
  onClose: () => void;
  initialData?: WorkoutSection;
  phase: Phase;
}

const WEIGHT_INCREMENT = 5;

const phaseColorMap: Record<Phase, string> = {
  menstrual: "var(--phase-menstrual)",
  follicular: "var(--phase-follicular)",
  ovulatory: "var(--phase-ovulatory)",
  luteal: "var(--phase-luteal)",
};

const phaseMutedMap: Record<Phase, string> = {
  menstrual: "var(--phase-menstrual-muted)",
  follicular: "var(--phase-follicular-muted)",
  ovulatory: "var(--phase-ovulatory-muted)",
  luteal: "var(--phase-luteal-muted)",
};

export function StrengthLog({ onSave, onClose, initialData, phase }: StrengthLogProps) {
  const [exercises, setExercises] = useState<ExerciseEntry[]>(initialData?.exercises ?? []);
  const [notes, setNotes] = useState(initialData?.notes ?? "");
  const [showSearch, setShowSearch] = useState(false);

  const color = phaseColorMap[phase];
  const muted = phaseMutedMap[phase];

  const addExerciseEntry = useCallback((exercise: Exercise) => {
    setExercises((prev) => [
      ...prev,
      {
        exercise,
        sets: [{ reps: 10, weight: null, isBodyweight: false, duration: null }],
      },
    ]);
    setShowSearch(false);
  }, []);

  const handleCreateCustom = useCallback(async (name: string, pattern: MovementPattern | null) => {
    const id = "custom-" + name.toLowerCase().replace(/[\s/]+/g, "-");
    const exercise: Exercise = {
      id, name, category: "strength", movementPattern: pattern, isCustom: true,
    };
    await addExercise({ id, name, category: "strength", movementPattern: pattern, isCustom: true });
    addExerciseEntry(exercise);
  }, [addExerciseEntry]);

  function updateSet(exIdx: number, setIdx: number, changes: Partial<SetEntry>) {
    setExercises((prev) =>
      prev.map((entry, ei) =>
        ei !== exIdx ? entry : {
          ...entry,
          sets: entry.sets.map((s, si) => si !== setIdx ? s : { ...s, ...changes }),
        }
      )
    );
  }

  function addSet(exIdx: number) {
    setExercises((prev) =>
      prev.map((entry, ei) => {
        if (ei !== exIdx) return entry;
        const lastSet = entry.sets[entry.sets.length - 1];
        const newSet: SetEntry = lastSet ? { ...lastSet } : { reps: 10, weight: null, isBodyweight: false, duration: null };
        return { ...entry, sets: [...entry.sets, newSet] };
      })
    );
  }

  function removeSet(exIdx: number, setIdx: number) {
    setExercises((prev) =>
      prev.map((entry, ei) =>
        ei !== exIdx ? entry : { ...entry, sets: entry.sets.filter((_, si) => si !== setIdx) }
      )
    );
  }

  function removeExercise(exIdx: number) {
    setExercises((prev) => prev.filter((_, i) => i !== exIdx));
  }

  function handleSave() {
    if (exercises.length === 0) return;
    onSave({
      type: "strength", exercises, duration: null, steps: null, distance: null, notes: notes.trim() || null,
    });
  }

  return (
    <>
      <div style={{ position: "fixed", inset: 0, background: "var(--bg-primary)", zIndex: 350, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px" }}>
          <button onClick={onClose} style={headerBtnStyle}>Cancel</button>
          <span className="display-heading" style={{ fontSize: 18 }}>Strength</span>
          <button onClick={handleSave} style={{ ...headerBtnStyle, color: exercises.length > 0 ? color : "var(--text-tertiary)" }}>
            Save
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 120px" }}>
          {exercises.map((entry, exIdx) => (
            <ExerciseBlock
              key={`${entry.exercise.id}-${exIdx}`}
              entry={entry} exIdx={exIdx}
              onUpdateSet={updateSet} onAddSet={addSet} onRemoveSet={removeSet} onRemoveExercise={removeExercise}
              color={color} muted={muted}
            />
          ))}

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowSearch(true)}
            style={{
              display: "block", width: "100%", padding: "14px", marginTop: 16,
              background: "var(--bg-elevated)", border: "none", borderRadius: "var(--radius-md)",
              fontFamily: "var(--font-body)", fontSize: 16, fontWeight: 500, color, cursor: "pointer",
            }}
          >
            + Add Exercise
          </motion.button>

          {exercises.length > 0 && (
            <textarea
              placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
              style={{
                marginTop: 20, width: "100%", fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 400,
                color: "var(--text-primary)", background: "var(--bg-elevated)", border: "none",
                borderRadius: "var(--radius-md)", padding: "12px 14px", resize: "none", outline: "none",
              }}
            />
          )}
        </div>
      </div>

      <AnimatePresence>
        {showSearch && (
          <ExerciseSearch
            category="strength" onSelect={addExerciseEntry} onCreateCustom={handleCreateCustom}
            onClose={() => setShowSearch(false)} phase={phase}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function ExerciseBlock({
  entry, exIdx, onUpdateSet, onAddSet, onRemoveSet, onRemoveExercise, color, muted,
}: {
  entry: ExerciseEntry; exIdx: number;
  onUpdateSet: (exIdx: number, setIdx: number, changes: Partial<SetEntry>) => void;
  onAddSet: (exIdx: number) => void;
  onRemoveSet: (exIdx: number, setIdx: number) => void;
  onRemoveExercise: (exIdx: number) => void;
  color: string; muted: string;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const unit = profile.unitWeight;

  return (
    <div style={{ marginTop: 16, background: "var(--bg-elevated)", borderRadius: "var(--radius-lg)", padding: "14px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={() => setCollapsed(!collapsed)} style={{
          background: "none", border: "none", fontFamily: "var(--font-body)", fontSize: 16, fontWeight: 600,
          color: "var(--text-primary)", cursor: "pointer", padding: 0, textAlign: "left",
        }}>
          {entry.exercise.name}
          {entry.exercise.movementPattern && (
            <span style={{ color: "var(--text-tertiary)", fontWeight: 400, fontSize: 13, marginLeft: 8 }}>
              {entry.exercise.movementPattern}
            </span>
          )}
        </button>
        <button onClick={() => onRemoveExercise(exIdx)} style={{
          background: "none", border: "none", color: "var(--text-tertiary)", fontSize: 14, cursor: "pointer", fontFamily: "var(--font-body)",
        }}>✕</button>
      </div>

      {!collapsed && (
        <div style={{ marginTop: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "40px 1fr 1fr 32px", gap: 8, marginBottom: 6 }}>
            <span className="body-caption" style={{ textAlign: "center" }}>Set</span>
            <span className="body-caption" style={{ textAlign: "center" }}>Reps</span>
            <span className="body-caption" style={{ textAlign: "center" }}>{unit}</span>
            <span />
          </div>

          {entry.sets.map((set, setIdx) => (
            <SetRow key={setIdx} set={set} setNum={setIdx + 1}
              onUpdate={(changes) => onUpdateSet(exIdx, setIdx, changes)}
              onRemove={() => onRemoveSet(exIdx, setIdx)}
              color={color} muted={muted}
            />
          ))}

          <button onClick={() => onAddSet(exIdx)} style={{
            background: "none", border: "none", fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 500,
            color, cursor: "pointer", padding: "8px 0 0",
          }}>+ Add Set</button>
        </div>
      )}
    </div>
  );
}

function SetRow({
  set, setNum, onUpdate, onRemove, color, muted,
}: {
  set: SetEntry; setNum: number;
  onUpdate: (changes: Partial<SetEntry>) => void;
  onRemove: () => void;
  color: string; muted: string;
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "40px 1fr 1fr 32px", gap: 8, alignItems: "center", marginBottom: 6 }}>
      <span className="body-small" style={{ textAlign: "center", color: "var(--text-tertiary)" }}>{setNum}</span>

      <StepperField value={set.reps} onChange={(v) => onUpdate({ reps: v })} step={1} min={1} color={color} />

      {set.isBodyweight ? (
        <button onClick={() => onUpdate({ isBodyweight: false, weight: 0 })} style={{
          fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 500, color,
          background: muted, border: "none", borderRadius: "var(--radius-sm)", padding: "6px 0",
          cursor: "pointer", textAlign: "center",
        }}>BW</button>
      ) : (
        <StepperField value={set.weight ?? 0} onChange={(v) => onUpdate({ weight: v })}
          step={WEIGHT_INCREMENT} min={0} color={color}
          onLongPress={() => onUpdate({ isBodyweight: true, weight: null })}
        />
      )}

      <button onClick={onRemove} style={{
        background: "none", border: "none", color: "var(--text-tertiary)", fontSize: 12, cursor: "pointer", padding: 4,
      }}>✕</button>
    </div>
  );
}

function StepperField({
  value, onChange, step, min, onLongPress, color,
}: {
  value: number; onChange: (v: number) => void; step: number; min: number;
  onLongPress?: () => void; color: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-primary)", borderRadius: "var(--radius-sm)", gap: 2 }}>
      <button onClick={() => onChange(Math.max(min, value - step))} style={stepBtn(color)}>−</button>
      <span onClick={onLongPress} style={{
        fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 500, color: "var(--text-primary)",
        minWidth: 36, textAlign: "center", cursor: onLongPress ? "pointer" : "default",
        fontVariantNumeric: "tabular-nums", padding: "6px 0",
      }}>{value}</span>
      <button onClick={() => onChange(value + step)} style={stepBtn(color)}>+</button>
    </div>
  );
}

function stepBtn(color: string): React.CSSProperties {
  return {
    background: "none", border: "none", color, fontSize: 18,
    fontFamily: "var(--font-body)", fontWeight: 600, cursor: "pointer",
    padding: "6px 10px", WebkitTapHighlightColor: "transparent",
  };
}

const headerBtnStyle: React.CSSProperties = {
  background: "none", border: "none", fontFamily: "var(--font-body)",
  fontSize: 16, fontWeight: 500, color: "var(--text-secondary)", cursor: "pointer", padding: 4,
};
