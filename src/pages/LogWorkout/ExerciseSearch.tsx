import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useExercises } from "../../db/hooks";
import type { Exercise, WorkoutType, MovementPattern, Phase } from "../../models/types";

interface ExerciseSearchProps {
  category: WorkoutType;
  onSelect: (exercise: Exercise) => void;
  onCreateCustom: (name: string, pattern: MovementPattern | null) => void;
  onClose: () => void;
  phase: Phase;
}

const phaseColorMap: Record<Phase, string> = {
  menstrual: "var(--phase-menstrual)",
  follicular: "var(--phase-follicular)",
  ovulatory: "var(--phase-ovulatory)",
  luteal: "var(--phase-luteal)",
};

const PATTERNS: { value: MovementPattern | null; label: string }[] = [
  { value: null, label: "Auto-detect" },
  { value: "squat", label: "Squat" },
  { value: "hinge", label: "Hinge" },
  { value: "lunge", label: "Lunge" },
  { value: "push", label: "Push" },
  { value: "pull", label: "Pull" },
  { value: "core", label: "Core" },
];

const AUTO_DETECT_KEYWORDS: Record<MovementPattern, string[]> = {
  squat: ["squat", "leg press", "leg extension", "wall sit", "hack"],
  hinge: ["deadlift", "rdl", "hip thrust", "glute", "swing", "curl", "good morning", "pull-through", "kickback", "back extension"],
  lunge: ["lunge", "split squat", "step-up", "step up", "curtsy"],
  push: ["press", "push", "dip", "fly", "raise", "tricep", "skull", "ohp", "shoulder"],
  pull: ["row", "pull", "chin", "curl", "face pull", "rear delt", "shrug", "lat"],
  core: ["plank", "dead bug", "pallof", "carry", "crunch", "twist", "mountain", "bird dog", "roll", "v-up", "flutter", "leg raise", "woodchop"],
};

function inferPattern(name: string): MovementPattern | null {
  const lower = name.toLowerCase();
  for (const [pattern, keywords] of Object.entries(AUTO_DETECT_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return pattern as MovementPattern;
    }
  }
  return null;
}

export function ExerciseSearch({
  category,
  onSelect,
  onCreateCustom,
  onClose,
  phase,
}: ExerciseSearchProps) {
  const color = phaseColorMap[phase];
  const [query, setQuery] = useState("");
  const [showTagPicker, setShowTagPicker] = useState(false);
  const allExercises = useExercises();

  const filtered = useMemo(() => {
    if (!allExercises) return [];
    const q = query.toLowerCase().trim();
    return allExercises
      .filter((ex) => ex.category === category)
      .filter((ex) => !q || ex.name.toLowerCase().includes(q));
  }, [allExercises, category, query]);

  const hasExactMatch = filtered.some(
    (ex) => ex.name.toLowerCase() === query.toLowerCase().trim()
  );

  const inferredPattern = query.trim() ? inferPattern(query.trim()) : null;

  function handlePatternSelect(pattern: MovementPattern | null) {
    const finalPattern = pattern ?? inferredPattern;
    onCreateCustom(query.trim(), finalPattern);
    setShowTagPicker(false);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--bg-primary)",
        zIndex: 400,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        padding: "16px 20px",
        gap: 12,
      }}>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "var(--text-secondary)",
            fontSize: 18,
            cursor: "pointer",
            fontFamily: "var(--font-body)",
          }}
        >
          ←
        </button>
        <input
          autoFocus
          type="text"
          placeholder="Search exercises..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            flex: 1,
            fontFamily: "var(--font-body)",
            fontSize: 16,
            fontWeight: 400,
            color: "var(--text-primary)",
            background: "var(--bg-elevated)",
            border: "none",
            borderRadius: "var(--radius-md)",
            padding: "10px 14px",
            outline: "none",
          }}
        />
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px" }}>
        {filtered.map((ex) => (
          <button
            key={ex.id}
            onClick={() =>
              onSelect({
                id: ex.id!,
                name: ex.name,
                category: ex.category as WorkoutType,
                movementPattern: ex.movementPattern as Exercise["movementPattern"],
                isCustom: ex.isCustom,
              })
            }
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              padding: "12px 0",
              background: "none",
              border: "none",
              borderBottom: "1px solid var(--bg-elevated)",
              fontFamily: "var(--font-body)",
              fontSize: 16,
              fontWeight: 400,
              color: "var(--text-primary)",
              cursor: "pointer",
            }}
          >
            {ex.name}
            {ex.movementPattern && (
              <span
                className="body-caption"
                style={{ marginLeft: 8, color: "var(--text-tertiary)" }}
              >
                {ex.movementPattern}
              </span>
            )}
          </button>
        ))}

        {/* Create custom */}
        {query.trim() && !hasExactMatch && (
          <button
            onClick={() => setShowTagPicker(true)}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              padding: "14px 0",
              background: "none",
              border: "none",
              fontFamily: "var(--font-body)",
              fontSize: 16,
              fontWeight: 500,
              color,
              cursor: "pointer",
            }}
          >
            + Create "{query.trim()}"
            {inferredPattern && (
              <span style={{ fontWeight: 400, color: "var(--text-tertiary)", marginLeft: 8, fontSize: 13 }}>
                detected: {inferredPattern}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Pattern tag picker sheet */}
      <AnimatePresence>
        {showTagPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowTagPicker(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              zIndex: 500,
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
              <p className="display-heading" style={{ marginBottom: 6, fontSize: 18 }}>
                Tag "{query.trim()}"
              </p>
              <p className="body-small" style={{ color: "var(--text-secondary)", marginBottom: 20 }}>
                Movement pattern for tracking coverage
              </p>

              {PATTERNS.map(({ value, label }) => {
                const isAutoDetect = value === null;
                const isInferred = isAutoDetect && inferredPattern;
                return (
                  <motion.button
                    key={label}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handlePatternSelect(value)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: "100%",
                      textAlign: "left",
                      padding: "13px 16px",
                      marginBottom: 6,
                      background: "var(--bg-primary)",
                      border: "none",
                      borderRadius: "var(--radius-md)",
                      fontFamily: "var(--font-body)",
                      fontSize: 15,
                      fontWeight: 500,
                      color: "var(--text-primary)",
                      cursor: "pointer",
                    }}
                  >
                    <span>{label}</span>
                    {isInferred && (
                      <span style={{ fontSize: 13, fontWeight: 400, color }}>
                        → {inferredPattern}
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
