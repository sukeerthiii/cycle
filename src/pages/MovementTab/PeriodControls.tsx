import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { addCycleLog, useLatestCycleLog, updateCycleLog } from "../../db/hooks";

export function PeriodControls() {
  const latestCycle = useLatestCycleLog();
  const [showDatePicker, setShowDatePicker] = useState<"start" | "end" | null>(null);
  const [pickedDate, setPickedDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });

  const periodActive = latestCycle && !latestCycle.periodEndDate;

  async function handleLogStart() {
    if (!latestCycle) return;
    await addCycleLog({
      periodStartDate: pickedDate,
      periodEndDate: null,
      cycleLength: latestCycle.cycleLength,
      periodLength: latestCycle.periodLength,
    });
    setShowDatePicker(null);
  }

  async function handleLogEnd() {
    if (!latestCycle?.id) return;
    await updateCycleLog(latestCycle.id, { periodEndDate: pickedDate });
    setShowDatePicker(null);
  }

  const confirmColor = showDatePicker === "start"
    ? "var(--phase-menstrual)"
    : "var(--phase-follicular)";

  return (
    <>
      <div style={{ display: "flex", gap: 10 }}>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowDatePicker("start")}
          style={periodBtnStyle("var(--phase-menstrual)")}
        >
          Log period start
        </motion.button>
        {periodActive && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowDatePicker("end")}
            style={periodBtnStyle("var(--phase-follicular)")}
          >
            Log period end
          </motion.button>
        )}
      </div>

      <AnimatePresence>
        {showDatePicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDatePicker(null)}
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
              initial={{ y: 200 }}
              animate={{ y: 0 }}
              exit={{ y: 200 }}
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
                padding: "24px 20px calc(24px + env(safe-area-inset-bottom))",
              }}
            >
              <p style={{ fontFamily: "var(--font-body)", fontSize: 16, fontWeight: 500, marginBottom: 16 }}>
                {showDatePicker === "start" ? "Period started" : "Period ended"}
              </p>

              <input
                type="date"
                value={pickedDate}
                onChange={(e) => setPickedDate(e.target.value)}
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 18,
                  fontWeight: 500,
                  color: "var(--text-primary)",
                  background: "var(--bg-elevated)",
                  border: "none",
                  borderRadius: "var(--radius-md)",
                  padding: "12px 16px",
                  width: "100%",
                  colorScheme: "light",
                  marginBottom: 20,
                }}
              />

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={showDatePicker === "start" ? handleLogStart : handleLogEnd}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: confirmColor,
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "var(--radius-md)",
                  fontFamily: "var(--font-body)",
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Confirm
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function periodBtnStyle(color: string): React.CSSProperties {
  return {
    flex: 1,
    padding: "12px 16px",
    background: "var(--bg-elevated)",
    border: "none",
    borderRadius: "var(--radius-md)",
    fontFamily: "var(--font-body)",
    fontSize: 14,
    fontWeight: 600,
    color,
    cursor: "pointer",
    WebkitTapHighlightColor: "transparent",
    boxShadow: "var(--shadow-card)",
  };
}
