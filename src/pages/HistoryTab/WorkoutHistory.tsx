import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDailyLogs } from "../../db/hooks";
import type { WorkoutSection, Phase } from "../../models/types";

const phaseLabels: Record<Phase, string> = {
  menstrual: "Menstrual",
  follicular: "Follicular",
  ovulatory: "Ovulatory",
  luteal: "Luteal",
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

export function WorkoutHistory() {
  const logs = useDailyLogs();
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  if (!logs || logs.length === 0) {
    return (
      <p className="body-small" style={{ color: "var(--text-tertiary)", textAlign: "center", marginTop: 40 }}>
        No workouts logged yet.
      </p>
    );
  }

  // Filter to only days with actual data
  const withData = logs.filter((l) => l.sections !== "[]" || l.steps != null);

  return (
    <div>
      {/* Column headers */}
      <div style={headerRowStyle}>
        <span style={{ flex: 1.2 }}>Date</span>
        <span style={{ flex: 1 }}>Phase</span>
        <span style={{ flex: 1.2 }}>Type</span>
        <span style={{ flex: 0.8, textAlign: "right" }}>Steps</span>
      </div>

      {withData.map((log) => {
        let sections: WorkoutSection[] = [];
        try {
          sections = JSON.parse(log.sections) as WorkoutSection[];
        } catch { /* empty */ }
        const types = sections.map((s) => s.type).join(", ");
        const phase = log.phase as Phase;
        const isExpanded = expandedDate === log.date;

        return (
          <div key={log.date}>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setExpandedDate(isExpanded ? null : log.date)}
              style={rowStyle}
            >
              <span style={{ flex: 1.2, fontVariantNumeric: "tabular-nums" }}>
                {formatDate(log.date)}
              </span>
              <span style={{
                flex: 1,
                color: `var(--phase-${phase})`,
                fontSize: 13,
              }}>
                {phaseLabels[phase] ?? phase}
              </span>
              <span style={{ flex: 1.2, textTransform: "capitalize" }}>
                {types || "—"}
              </span>
              <span style={{ flex: 0.8, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                {log.steps != null ? log.steps.toLocaleString() : "—"}
              </span>
            </motion.button>

            <AnimatePresence>
              {isExpanded && sections.length > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ overflow: "hidden" }}
                >
                  <div style={{
                    padding: "8px 12px 12px",
                    background: "var(--bg-elevated)",
                    borderRadius: "0 0 var(--radius-md) var(--radius-md)",
                    marginTop: -2,
                    marginBottom: 4,
                  }}>
                    {sections.map((section, si) => (
                      <div key={si} style={{ marginBottom: si < sections.length - 1 ? 10 : 0 }}>
                        <span style={{
                          fontFamily: "var(--font-body)",
                          fontSize: 13,
                          fontWeight: 600,
                          color: "var(--text-primary)",
                          textTransform: "capitalize",
                        }}>
                          {section.type}
                          {section.duration ? ` · ${section.duration}m` : ""}
                        </span>

                        {section.exercises.map((entry, ei) => (
                          <div key={ei} style={{ marginTop: 3, paddingLeft: 8 }}>
                            <span className="body-caption" style={{ color: "var(--text-secondary)" }}>
                              {entry.exercise.name}
                            </span>
                            {entry.sets.map((set, si2) => (
                              <span key={si2} className="body-caption" style={{ marginLeft: 6 }}>
                                {set.reps}×{set.isBodyweight ? "BW" : `${set.weight ?? 0}lb`}
                                {si2 < entry.sets.length - 1 ? "," : ""}
                              </span>
                            ))}
                          </div>
                        ))}

                        {section.notes && (
                          <p className="body-caption" style={{
                            marginTop: 4,
                            fontStyle: "italic",
                            color: "var(--text-tertiary)",
                            paddingLeft: 8,
                          }}>
                            {section.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

const headerRowStyle: React.CSSProperties = {
  display: "flex",
  padding: "8px 12px",
  fontFamily: "var(--font-body)",
  fontSize: 12,
  fontWeight: 500,
  color: "var(--text-tertiary)",
  borderBottom: "1px solid var(--bg-elevated)",
  marginBottom: 4,
};

const rowStyle: React.CSSProperties = {
  display: "flex",
  width: "100%",
  padding: "10px 12px",
  background: "none",
  border: "none",
  borderBottom: "1px solid var(--bg-elevated)",
  fontFamily: "var(--font-body)",
  fontSize: 14,
  fontWeight: 400,
  color: "var(--text-primary)",
  cursor: "pointer",
  textAlign: "left",
  WebkitTapHighlightColor: "transparent",
};
