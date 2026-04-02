import { motion } from "framer-motion";
import type { WorkoutType, SuggestedWorkout, Phase } from "../../models/types";

interface TypePickerProps {
  onSelect: (type: WorkoutType) => void;
  onClose: () => void;
  suggestion: SuggestedWorkout | null;
  phase: Phase;
}

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

const workoutTypes: { type: WorkoutType; label: string }[] = [
  { type: "strength", label: "Strength" },
  { type: "pilates", label: "Pilates" },
  { type: "yoga", label: "Yoga" },
  { type: "mobility", label: "Mobility / Stretches" },
  { type: "walk", label: "Walk" },
  { type: "cardio", label: "Cardio" },
];

export function TypePicker({ onSelect, onClose, suggestion, phase }: TypePickerProps) {
  const suggestedType = suggestion?.type ?? null;
  const color = phaseColorMap[phase];
  const muted = phaseMutedMap[phase];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.3)",
        zIndex: 300,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      <motion.div
        initial={{ y: 300 }}
        animate={{ y: 0 }}
        exit={{ y: 300 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 420,
          background: "var(--bg-primary)",
          borderRadius: "20px 20px 0 0",
          padding: "24px 20px calc(24px + env(safe-area-inset-bottom))",
          boxShadow: "0 -4px 20px rgba(0,0,0,0.08)",
        }}
      >
        <p className="display-heading" style={{ marginBottom: 6 }}>
          Log Movement
        </p>

        {suggestion && (
          <p className="body-small" style={{ color: "var(--text-secondary)", marginBottom: 16, lineHeight: 1.5 }}>
            {suggestion.message}
          </p>
        )}

        {workoutTypes.map(({ type, label }) => {
          const isSuggested = type === suggestedType && !suggestion?.isRest;
          return (
            <motion.button
              key={type}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(type)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                textAlign: "left",
                padding: "14px 16px",
                marginBottom: 8,
                background: isSuggested ? muted : "var(--bg-elevated)",
                border: isSuggested ? `1px solid ${color}` : "none",
                borderRadius: "var(--radius-md)",
                fontFamily: "var(--font-body)",
                fontSize: 16,
                fontWeight: isSuggested ? 600 : 500,
                color: isSuggested ? color : "var(--text-primary)",
                cursor: "pointer",
              }}
            >
              <span>
                {label}
                {isSuggested && suggestion?.focus ? ` — ${suggestion.focus}` : ""}
              </span>
              {isSuggested && (
                <span style={{ fontSize: 12, fontWeight: 500, opacity: 0.8 }}>
                  Suggested
                </span>
              )}
            </motion.button>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
