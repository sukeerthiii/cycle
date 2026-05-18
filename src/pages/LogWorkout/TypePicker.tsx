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


const workoutTypes: { type: WorkoutType; label: string }[] = [
  { type: "strength", label: "Strength" },
  { type: "pilates", label: "Pilates" },
  { type: "yoga", label: "Yoga" },
  { type: "mobility", label: "Mobility / Stretches" },
  { type: "walk", label: "Walk" },
  { type: "cardio", label: "Cardio" },
  { type: "running", label: "Running" },
];

export function TypePicker({ onSelect, onClose, suggestion, phase }: TypePickerProps) {
  const suggestedType = suggestion?.type ?? null;
  const color = phaseColorMap[phase];

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
        touchAction: "none",
        overscrollBehavior: "contain",
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
          background: "rgba(255, 255, 255, 0.6)",
          backdropFilter: "blur(30px)",
          WebkitBackdropFilter: "blur(30px)",
          borderRadius: "20px 20px 0 0",
          border: "1px solid rgba(255, 255, 255, 0.6)",
          boxShadow: "0 -4px 24px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
          padding: `24px 20px calc(24px + var(--tab-bar-height) + env(safe-area-inset-bottom))`,
        }}
      >
        <p className="section-label" style={{ marginBottom: 6, fontSize: 11 }}>
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
                background: isSuggested ? "rgba(255, 255, 255, 0.5)" : "rgba(255, 255, 255, 0.35)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: isSuggested ? `1px solid ${color}` : "1px solid rgba(255, 255, 255, 0.5)",
                borderRadius: "var(--radius-md)",
                boxShadow: "0 1px 6px rgba(0, 0, 0, 0.03), inset 0 1px 0 rgba(255, 255, 255, 0.4)",
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
