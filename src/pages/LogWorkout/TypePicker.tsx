import { motion } from "framer-motion";
import type { WorkoutType, SuggestedWorkout } from "../../models/types";

interface TypePickerProps {
  onSelect: (type: WorkoutType) => void;
  onClose: () => void;
  suggestion: SuggestedWorkout | null;
}

const workoutTypes: { type: WorkoutType; label: string }[] = [
  { type: "strength", label: "Strength" },
  { type: "pilates", label: "Pilates" },
  { type: "yoga", label: "Yoga" },
  { type: "mobility", label: "Mobility / Stretches" },
  { type: "walk", label: "Walk" },
];

export function TypePicker({ onSelect, onClose, suggestion }: TypePickerProps) {
  const suggestedType = suggestion?.type ?? null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
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
          background: "var(--bg-elevated)",
          borderRadius: "20px 20px 0 0",
          padding: "24px 20px calc(24px + env(safe-area-inset-bottom))",
        }}
      >
        <p className="display-heading" style={{ marginBottom: 6 }}>
          Log workout
        </p>

        {/* Suggestion message */}
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
                background: isSuggested ? "var(--accent-muted)" : "var(--bg-primary)",
                border: isSuggested ? "1px solid var(--accent)" : "none",
                borderRadius: "var(--radius-md)",
                fontFamily: "var(--font-body)",
                fontSize: 16,
                fontWeight: isSuggested ? 600 : 500,
                color: isSuggested ? "var(--accent)" : "var(--text-primary)",
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
