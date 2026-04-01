import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDailyLog } from "../../db/hooks";
import type { Phase, WorkoutSection, WorkoutType } from "../../models/types";

interface DayDetailSheetProps {
  date: string;
  isToday: boolean;
  isFuture: boolean;
  phase: Phase | null;
  onClose: () => void;
  onAddWorkout: () => void;
  onEditSection: (sectionIndex: number, section: WorkoutSection) => void;
  onDeleteSection: (sectionIndex: number) => void;
  onPlanWorkout: (date: string, type: WorkoutType, notes: string) => void;
}

const phaseLabels: Record<Phase, string> = {
  menstrual: "Menstrual",
  follicular: "Follicular",
  ovulatory: "Ovulatory",
  luteal: "Luteal",
};

const workoutTypes: { type: WorkoutType; label: string }[] = [
  { type: "strength", label: "Strength" },
  { type: "pilates", label: "Pilates" },
  { type: "yoga", label: "Yoga" },
  { type: "mobility", label: "Mobility / Stretches" },
  { type: "walk", label: "Walk" },
];

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatDayName(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-IN", { weekday: "long" });
}

export function DayDetailSheet({
  date,
  isToday,
  isFuture,
  phase,
  onClose,
  onAddWorkout,
  onEditSection,
  onDeleteSection,
  onPlanWorkout,
}: DayDetailSheetProps) {
  const dailyLog = useDailyLog(date);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [showPlanPicker, setShowPlanPicker] = useState(false);
  const [planNotes, setPlanNotes] = useState("");

  let sections: WorkoutSection[] = [];
  try {
    if (dailyLog?.sections) {
      sections = JSON.parse(dailyLog.sections) as WorkoutSection[];
    }
  } catch { /* empty */ }

  const plannedWorkout = dailyLog?.plannedWorkout
    ? JSON.parse(dailyLog.plannedWorkout) as { type: string; notes: string | null }
    : null;

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
          maxHeight: "70vh",
          overflowY: "auto",
          background: "var(--bg-elevated)",
          borderRadius: "20px 20px 0 0",
          padding: "24px 20px calc(24px + env(safe-area-inset-bottom))",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <p className="display-heading" style={{ fontSize: 18 }}>
              {isToday ? "Today" : formatDate(date)}
            </p>
            {phase && (
              <span className="display-phase" style={{
                color: `var(--phase-${phase})`,
                fontSize: 11,
              }}>
                {phaseLabels[phase]}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-tertiary)",
              fontSize: 18,
              cursor: "pointer",
              fontFamily: "var(--font-body)",
            }}
          >
            ✕
          </button>
        </div>

        {/* Future day */}
        {isFuture && (
          <div style={{ marginBottom: 16 }}>
            <p className="body-primary" style={{ color: "var(--text-secondary)", marginBottom: 12 }}>
              {phase ? `You'll likely be in ${phaseLabels[phase].toLowerCase()}.` : ""}
            </p>

            {/* Existing plan */}
            {plannedWorkout && (
              <div style={{
                padding: "12px 14px",
                background: "var(--accent-muted)",
                borderRadius: "var(--radius-md)",
                borderLeft: "3px solid var(--accent)",
                marginBottom: 12,
              }}>
                <span style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600, color: "var(--accent)" }}>
                  Planned: {plannedWorkout.type}
                </span>
                {plannedWorkout.notes && (
                  <p className="body-caption" style={{ marginTop: 4, color: "var(--text-secondary)" }}>
                    {plannedWorkout.notes}
                  </p>
                )}
              </div>
            )}

            {/* Plan workout button */}
            {!showPlanPicker ? (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowPlanPicker(true)}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "13px",
                  background: "var(--accent)",
                  color: "var(--bg-primary)",
                  border: "none",
                  borderRadius: "var(--radius-md)",
                  fontFamily: "var(--font-body)",
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {plannedWorkout ? "Change plan" : `Plan workout for ${formatDayName(date)}`}
              </motion.button>
            ) : (
              <div>
                <p className="body-small" style={{ color: "var(--text-secondary)", marginBottom: 10 }}>
                  What are you planning?
                </p>
                {workoutTypes.map(({ type, label }) => (
                  <motion.button
                    key={type}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      onPlanWorkout(date, type, planNotes.trim());
                      setShowPlanPicker(false);
                      setPlanNotes("");
                    }}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      padding: "11px 14px",
                      marginBottom: 6,
                      background: "var(--bg-primary)",
                      border: "none",
                      borderRadius: "var(--radius-sm)",
                      fontFamily: "var(--font-body)",
                      fontSize: 15,
                      fontWeight: 500,
                      color: "var(--text-primary)",
                      cursor: "pointer",
                    }}
                  >
                    {label}
                  </motion.button>
                ))}
                <input
                  type="text"
                  placeholder="Notes (optional) e.g. lower body focus"
                  value={planNotes}
                  onChange={(e) => setPlanNotes(e.target.value)}
                  style={{
                    width: "100%",
                    marginTop: 6,
                    fontFamily: "var(--font-body)",
                    fontSize: 14,
                    fontWeight: 400,
                    color: "var(--text-primary)",
                    background: "var(--bg-primary)",
                    border: "none",
                    borderRadius: "var(--radius-sm)",
                    padding: "10px 14px",
                    outline: "none",
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* Logged workouts — tap to edit */}
        {sections.length > 0 ? (
          sections.map((section, i) => (
            <WorkoutSectionCard
              key={i}
              section={section}
              onTap={() => onEditSection(i, section)}
              onDelete={() => setConfirmDelete(i)}
            />
          ))
        ) : (
          !isFuture && (
            <p className="body-small" style={{ color: "var(--text-tertiary)", padding: "16px 0" }}>
              {isToday ? "No workouts logged yet today." : "No workouts logged."}
            </p>
          )
        )}

        {/* Steps */}
        {dailyLog?.steps != null && (
          <div style={{
            marginTop: 12,
            padding: "10px 14px",
            background: "var(--bg-primary)",
            borderRadius: "var(--radius-md)",
            display: "flex",
            justifyContent: "space-between",
          }}>
            <span className="body-small" style={{ color: "var(--text-secondary)" }}>Steps</span>
            <span className="body-small" style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
              {dailyLog.steps.toLocaleString()}
            </span>
          </div>
        )}

        {/* Add workout button */}
        {!isFuture && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onAddWorkout}
            style={{
              display: "block",
              width: "100%",
              padding: "13px",
              marginTop: 16,
              background: "var(--accent)",
              color: "var(--bg-primary)",
              border: "none",
              borderRadius: "var(--radius-md)",
              fontFamily: "var(--font-body)",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            + Add workout
          </motion.button>
        )}
      </motion.div>

      {/* Delete confirmation */}
      <AnimatePresence>
        {confirmDelete !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setConfirmDelete(null)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.6)",
              zIndex: 500,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: 280,
                background: "var(--bg-elevated)",
                borderRadius: "var(--radius-lg)",
                padding: "24px 20px",
                textAlign: "center",
              }}
            >
              <p className="display-heading" style={{ fontSize: 17, marginBottom: 8 }}>
                Delete workout?
              </p>
              <p className="body-small" style={{ color: "var(--text-secondary)", marginBottom: 20 }}>
                This can't be undone.
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => setConfirmDelete(null)}
                  style={{
                    flex: 1,
                    padding: "11px",
                    background: "var(--bg-primary)",
                    border: "none",
                    borderRadius: "var(--radius-md)",
                    fontFamily: "var(--font-body)",
                    fontSize: 15,
                    fontWeight: 500,
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onDeleteSection(confirmDelete);
                    setConfirmDelete(null);
                  }}
                  style={{
                    flex: 1,
                    padding: "11px",
                    background: "var(--phase-menstrual)",
                    border: "none",
                    borderRadius: "var(--radius-md)",
                    fontFamily: "var(--font-body)",
                    fontSize: 15,
                    fontWeight: 600,
                    color: "var(--bg-primary)",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function WorkoutSectionCard({ section, onTap, onDelete }: { section: WorkoutSection; onTap: () => void; onDelete: () => void }) {
  const typeLabel: Record<string, string> = {
    strength: "Strength",
    pilates: "Pilates",
    yoga: "Yoga",
    mobility: "Mobility",
    walk: "Walk",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onTap}
      style={{
        display: "block",
        width: "100%",
        textAlign: "left",
        background: "var(--bg-primary)",
        borderRadius: "var(--radius-md)",
        padding: "12px 14px",
        marginBottom: 8,
        border: "none",
        cursor: "pointer",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>
          {typeLabel[section.type] ?? section.type}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {section.duration && (
            <span className="body-caption">
              {section.duration >= 60
                ? `${Math.floor(section.duration / 60)}h ${section.duration % 60}m`
                : `${section.duration}m`}
            </span>
          )}
          <span style={{ color: "var(--text-tertiary)", fontSize: 12 }}>Edit →</span>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            style={{
              background: "none",
              border: "none",
              color: "var(--phase-menstrual)",
              fontSize: 12,
              fontFamily: "var(--font-body)",
              fontWeight: 500,
              cursor: "pointer",
              padding: "2px 4px",
            }}
          >
            Delete
          </button>
        </div>
      </div>

      {section.exercises.map((entry, ei) => (
        <div key={ei} style={{ marginTop: 4 }}>
          <span className="body-small" style={{ color: "var(--text-secondary)" }}>
            {entry.exercise.name}
          </span>
          <span className="body-caption" style={{ marginLeft: 8 }}>
            {entry.sets.length} × {entry.sets[0]?.reps ?? 0}
            {entry.sets[0]?.isBodyweight
              ? " BW"
              : entry.sets[0]?.weight
                ? ` @ ${entry.sets[0].weight} lb`
                : ""}
          </span>
        </div>
      ))}

      {section.type === "walk" && section.steps && (
        <span className="body-caption" style={{ display: "block", marginTop: 4 }}>
          {section.steps.toLocaleString()} steps
          {section.distance ? ` · ${section.distance} km` : ""}
        </span>
      )}

      {section.notes && (
        <p className="body-caption" style={{ marginTop: 6, fontStyle: "italic", color: "var(--text-tertiary)" }}>
          {section.notes}
        </p>
      )}
    </motion.button>
  );
}
