import { useState } from "react";
import { motion } from "framer-motion";
import { addCycleLog, setSetting } from "../db/hooks";
import { profile } from "../models/profile";

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [cycleLength, setCycleLength] = useState(profile.defaultCycleLength);
  const [periodLength, setPeriodLength] = useState(profile.defaultPeriodLength);
  const [lastPeriod, setLastPeriod] = useState(profile.lastPeriodStart);
  const [saving, setSaving] = useState(false);

  async function handleDone() {
    if (saving) return;
    setSaving(true);

    await addCycleLog({
      periodStartDate: lastPeriod,
      periodEndDate: null,
      cycleLength,
      periodLength,
    });

    await setSetting("onboarded", "true");
    await setSetting("cycleLength", String(cycleLength));
    await setSetting("periodLength", String(periodLength));

    onComplete();
  }

  return (
    <div style={{
      minHeight: "100dvh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      padding: "32px 24px",
      paddingTop: "calc(32px + env(safe-area-inset-top))",
      background: "var(--bg-primary)",
      color: "var(--text-primary)",
      maxWidth: 420,
      margin: "0 auto",
      width: "100%",
      boxSizing: "border-box",
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="display-heading" style={{ marginBottom: 8 }}>
          Cycle
        </h1>
        <p className="body-primary" style={{ color: "var(--text-secondary)", marginBottom: 48 }}>
          Three things, then we're in.
        </p>

        {/* Cycle length */}
        <Field label="Average cycle length (days)">
          <NumberStepper value={cycleLength} onChange={setCycleLength} min={20} max={45} />
        </Field>

        {/* Period length */}
        <Field label="Period length (days)">
          <NumberStepper value={periodLength} onChange={setPeriodLength} min={2} max={10} />
        </Field>

        {/* Last period start */}
        <Field label="When did your last period start?">
          <input
            type="date"
            value={lastPeriod}
            onChange={(e) => setLastPeriod(e.target.value)}
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 16,
              fontWeight: 500,
              color: "var(--text-primary)",
              background: "var(--bg-elevated)",
              border: "none",
              borderRadius: "var(--radius-md)",
              padding: "12px 16px",
              width: "100%",
              maxWidth: "100%",
              colorScheme: "light",
              WebkitAppearance: "none",
              appearance: "none" as const,
            }}
          />
        </Field>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleDone}
          disabled={saving}
          style={{
            marginTop: 48,
            width: "100%",
            padding: "14px",
            background: "var(--accent)",
            color: "#FFFFFF",
            border: "none",
            borderRadius: "var(--radius-md)",
            fontFamily: "var(--font-body)",
            fontSize: 17,
            fontWeight: 600,
            cursor: "pointer",
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? "Setting up..." : "Done"}
        </motion.button>
      </motion.div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <label
        className="body-small"
        style={{ display: "block", color: "var(--text-secondary)", marginBottom: 8 }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function NumberStepper({
  value,
  onChange,
  min,
  max,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
}) {
  return (
    <div style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 16,
      background: "var(--bg-elevated)",
      borderRadius: "var(--radius-md)",
      padding: "10px 20px",
    }}>
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        style={stepperBtnStyle}
      >
        −
      </button>
      <span
        className="display-heading"
        style={{ minWidth: 40, textAlign: "center", fontSize: 24 }}
      >
        {value}
      </span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        style={stepperBtnStyle}
      >
        +
      </button>
    </div>
  );
}

const stepperBtnStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "var(--accent)",
  fontSize: 24,
  fontFamily: "var(--font-body)",
  fontWeight: 600,
  cursor: "pointer",
  padding: "4px 12px",
  WebkitTapHighlightColor: "transparent",
};
