import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useLatestCycleLog, updateCycleLog, useSetting, setSetting } from "../db/hooks";
import { exportJSON, exportCSV, importJSON } from "../utils/export";
import { db } from "../db/database";
import type { Phase } from "../models/types";

interface SettingsProps {
  onClose: () => void;
  phase: Phase;
}

const phaseColorMap: Record<Phase, string> = {
  menstrual: "var(--phase-menstrual)",
  follicular: "var(--phase-follicular)",
  ovulatory: "var(--phase-ovulatory)",
  luteal: "var(--phase-luteal)",
};

export function Settings({ onClose, phase }: SettingsProps) {
  const latestCycle = useLatestCycleLog();
  const weightUnit = useSetting("weightUnit");
  const weightIncrement = useSetting("weightIncrement");

  const [cycleLength, setCycleLength] = useState<number | null>(null);
  const [periodLength, setPeriodLength] = useState<number | null>(null);
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const cl = cycleLength ?? latestCycle?.cycleLength ?? 30;
  const pl = periodLength ?? latestCycle?.periodLength ?? 5;
  const unit = weightUnit?.value ?? "lb";
  const increment = weightIncrement?.value ?? "5";
  const color = phaseColorMap[phase];

  async function saveCycleSettings() {
    if (!latestCycle?.id) return;
    await updateCycleLog(latestCycle.id, {
      cycleLength: cl,
      periodLength: pl,
    });
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await importJSON(file);
    setImportMsg(result.message);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleClearData() {
    if (!confirm("Delete all data? This cannot be undone.")) return;
    await db.delete();
    window.location.reload();
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
        overflowY: "auto",
      }}
    >
      <div style={{ padding: "16px 20px", maxWidth: 420, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <span className="display-heading">Settings</span>
          <button onClick={onClose} style={{
            background: "none",
            border: "none",
            fontFamily: "var(--font-body)",
            fontSize: 16,
            fontWeight: 600,
            color,
            cursor: "pointer",
          }}>Done</button>
        </div>

        {/* Cycle settings */}
        <Section title="Cycle">
          <Row label="Cycle length (days)">
            <Stepper value={cl} onChange={(v) => { setCycleLength(v); }} min={20} max={45} onBlur={saveCycleSettings} color={color} />
          </Row>
          <Row label="Period length (days)">
            <Stepper value={pl} onChange={(v) => { setPeriodLength(v); }} min={2} max={10} onBlur={saveCycleSettings} color={color} />
          </Row>
        </Section>

        {/* Units */}
        <Section title="Units">
          <Row label="Weight">
            <Toggle options={["lb", "kg"]} value={unit} onChange={(v) => setSetting("weightUnit", v)} />
          </Row>
          <Row label="Weight increment">
            <Toggle options={["2.5", "5"]} value={increment} onChange={(v) => setSetting("weightIncrement", v)} />
          </Row>
        </Section>

        {/* Export */}
        <Section title="Data">
          <ActionButton label="Export as JSON" onClick={exportJSON} />
          <ActionButton label="Export as CSV" onClick={exportCSV} />
          <ActionButton label="Import backup" onClick={() => fileRef.current?.click()} />
          <input
            ref={fileRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            style={{ display: "none" }}
          />
          {importMsg && (
            <p className="body-caption" style={{ color, marginTop: 8, padding: "0 16px" }}>
              {importMsg}
            </p>
          )}
        </Section>

        {/* Danger zone */}
        <Section title="Danger zone">
          <ActionButton
            label="Delete all data"
            onClick={handleClearData}
            color="var(--phase-menstrual)"
          />
        </Section>

        <div style={{ height: 60 }} />
      </div>
    </motion.div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <span style={{
        fontFamily: "var(--font-body)",
        fontSize: 13,
        fontWeight: 600,
        color: "var(--text-tertiary)",
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        display: "block",
        marginBottom: 12,
      }}>
        {title}
      </span>
      <div style={{
        background: "var(--bg-elevated)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
      }}>
        {children}
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "12px 16px",
      borderBottom: "1px solid var(--bg-primary)",
    }}>
      <span style={{ fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 400, color: "var(--text-primary)" }}>
        {label}
      </span>
      {children}
    </div>
  );
}

function Stepper({
  value,
  onChange,
  min,
  max,
  onBlur,
  color,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  onBlur: () => void;
  color: string;
}) {
  const btnStyle: React.CSSProperties = {
    background: "var(--bg-primary)",
    border: "none",
    borderRadius: "var(--radius-sm)",
    color,
    fontSize: 18,
    fontFamily: "var(--font-body)",
    fontWeight: 600,
    width: 32,
    height: 32,
    cursor: "pointer",
    WebkitTapHighlightColor: "transparent",
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <button onClick={() => { onChange(Math.max(min, value - 1)); setTimeout(onBlur, 50); }} style={btnStyle}>
        −
      </button>
      <span style={{
        fontFamily: "var(--font-display)",
        fontSize: 16,
        fontWeight: 600,
        minWidth: 28,
        textAlign: "center",
        fontVariantNumeric: "tabular-nums",
      }}>
        {value}
      </span>
      <button onClick={() => { onChange(Math.min(max, value + 1)); setTimeout(onBlur, 50); }} style={btnStyle}>
        +
      </button>
    </div>
  );
}

function Toggle({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ display: "flex", background: "var(--bg-primary)", borderRadius: "var(--radius-sm)", padding: 2 }}>
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          style={{
            padding: "5px 14px",
            background: value === opt ? "var(--bg-elevated)" : "transparent",
            border: "none",
            borderRadius: "var(--radius-sm)",
            fontFamily: "var(--font-body)",
            fontSize: 14,
            fontWeight: value === opt ? 600 : 400,
            color: value === opt ? "var(--text-primary)" : "var(--text-tertiary)",
            cursor: "pointer",
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  color = "var(--text-primary)",
}: {
  label: string;
  onClick: () => void;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "block",
        width: "100%",
        padding: "13px 16px",
        background: "transparent",
        border: "none",
        borderBottom: "1px solid var(--bg-primary)",
        fontFamily: "var(--font-body)",
        fontSize: 15,
        fontWeight: 500,
        color,
        textAlign: "left",
        cursor: "pointer",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {label}
    </button>
  );
}
