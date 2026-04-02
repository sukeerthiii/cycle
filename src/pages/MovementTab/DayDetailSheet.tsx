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
  onEditSteps: (date: string, currentSteps: number | null) => void;
  onDeleteSteps: (date: string) => void;
}

const phaseLabels: Record<Phase, string> = {
  menstrual: "Menstrual",
  follicular: "Follicular",
  ovulatory: "Ovulatory",
  luteal: "Luteal",
};

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
];

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatDuration(mins: number): string {
  if (mins >= 60) return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  return `${mins}m`;
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
  onEditSteps,
  onDeleteSteps,
}: DayDetailSheetProps) {
  const dailyLog = useDailyLog(date);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [showPlanPicker, setShowPlanPicker] = useState(false);
  const [planNotes, setPlanNotes] = useState("");

  const phaseColor = phase ? phaseColorMap[phase] : "var(--text-secondary)";

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
          maxHeight: "70vh",
          overflowY: "auto",
          background: "var(--bg-primary)",
          borderRadius: "20px 20px 0 0",
          padding: "24px 20px calc(24px + env(safe-area-inset-bottom))",
          boxShadow: "0 -4px 20px rgba(0,0,0,0.08)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <p className="display-heading" style={{ fontSize: 18 }}>
              {isToday ? "Today" : formatDate(date)}
            </p>
            {phase && (
              <span className="display-phase" style={{ color: phaseColor, fontSize: 11 }}>
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

            {plannedWorkout && (
              <div style={{
                padding: "12px 14px",
                background: phase ? `var(--phase-${phase}-muted)` : "var(--bg-elevated)",
                borderRadius: "var(--radius-md)",
                marginBottom: 12,
              }}>
                <span style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600, color: phaseColor }}>
                  Planned: {plannedWorkout.type}
                </span>
                {plannedWorkout.notes && (
                  <p className="body-caption" style={{ marginTop: 4, color: "var(--text-secondary)" }}>
                    {plannedWorkout.notes}
                  </p>
                )}
              </div>
            )}

            {!showPlanPicker ? (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowPlanPicker(true)}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "13px",
                  background: phaseColor,
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "var(--radius-md)",
                  fontFamily: "var(--font-body)",
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {plannedWorkout ? "Change plan" : "Plan Movement"}
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
                      background: "var(--bg-elevated)",
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
                    background: "var(--bg-elevated)",
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

        {/* Logged workouts */}
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
              {isToday ? "No movement logged yet today." : "No movement logged."}
            </p>
          )
        )}

        {/* Steps */}
        {dailyLog?.steps != null && (
          <div style={{
            marginTop: 12,
            padding: "12px 14px",
            background: "var(--bg-elevated)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-card)",
          }}>
            <span style={{ fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 600, color: "var(--text-primary)", display: "block" }}>
              Steps
            </span>
            <span className="body-small" style={{ color: "var(--text-secondary)", fontVariantNumeric: "tabular-nums" }}>
              {dailyLog.steps.toLocaleString()}
            </span>
            <div style={{ display: "flex", gap: 16, marginTop: 10, paddingTop: 8, borderTop: "1px solid var(--bg-deep)" }}>
              <button onClick={() => onEditSteps(date, dailyLog.steps)} style={actionBtnStyle("var(--text-secondary)")}>
                Edit
              </button>
              <button onClick={() => onDeleteSteps(date)} style={actionBtnStyle("var(--phase-menstrual)")}>
                Delete
              </button>
            </div>
          </div>
        )}

        {/* Add Movement button */}
        {!isFuture && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onAddWorkout}
            style={{
              display: "block",
              width: "100%",
              padding: "13px",
              marginTop: 16,
              background: phaseColor,
              color: "#FFFFFF",
              border: "none",
              borderRadius: "var(--radius-md)",
              fontFamily: "var(--font-body)",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            + Add Movement
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
              background: "rgba(0,0,0,0.4)",
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
                boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
              }}
            >
              <p className="display-heading" style={{ fontSize: 17, marginBottom: 8 }}>
                Delete this entry?
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
                    background: "var(--bg-deep)",
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
                    color: "#FFFFFF",
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
    <div style={{
      background: "var(--bg-elevated)",
      borderRadius: "var(--radius-md)",
      padding: "12px 14px",
      marginBottom: 8,
      boxShadow: "var(--shadow-card)",
    }}>
      <span style={{ fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 600, color: "var(--text-primary)", display: "block" }}>
        {typeLabel[section.type] ?? section.type}
      </span>
      {section.duration && (
        <span className="body-caption" style={{ display: "block", marginTop: 1 }}>
          {formatDuration(section.duration)}
        </span>
      )}

      {section.exercises.map((entry, ei) => (
        <div key={ei} style={{ marginTop: 6 }}>
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

      <div style={{ display: "flex", gap: 16, marginTop: 10, paddingTop: 8, borderTop: "1px solid var(--bg-deep)" }}>
        <button onClick={onTap} style={actionBtnStyle("var(--text-secondary)")}>
          Edit
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} style={actionBtnStyle("var(--phase-menstrual)")}>
          Delete
        </button>
      </div>
    </div>
  );
}

function actionBtnStyle(color: string): React.CSSProperties {
  return {
    background: "none",
    border: "none",
    fontFamily: "var(--font-body)",
    fontSize: 13,
    fontWeight: 500,
    color,
    cursor: "pointer",
    padding: 0,
    WebkitTapHighlightColor: "transparent",
  };
}
