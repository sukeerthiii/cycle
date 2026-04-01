import { useState, useEffect, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { GrainOverlay } from "./design/Grain";
import { FAB } from "./design/FAB";
import { CycleHome } from "./pages/CycleTab";
import { Movement } from "./pages/MovementTab";
import { History } from "./pages/HistoryTab";
import { Trends } from "./pages/TrendsTab";
import { Onboarding } from "./pages/Onboarding";
import { Settings } from "./pages/Settings";
import { TypePicker } from "./pages/LogWorkout/TypePicker";
import { StrengthLog } from "./pages/LogWorkout/StrengthLog";
import { SessionLog } from "./pages/LogWorkout/SessionLog";
import { WalkLog } from "./pages/LogWorkout/WalkLog";
import { calculatePhase } from "./engine/phaseEngine";
import {
  useLatestCycleLog,
  useDailyLog,
  updateDailyLogSteps,
  upsertDailyLog,
  replaceSectionInDailyLog,
  deleteSectionFromDailyLog,
  savePlannedWorkout,
  useSetting,
} from "./db/hooks";
import { seedExercises } from "./db/seed";
import type { WorkoutType, WorkoutSection, Phase, SuggestedWorkout } from "./models/types";
import { generateSuggestion } from "./engine/suggestionEngine";
import "./App.css";

type Tab = "cycle" | "movement" | "trends" | "history";

interface LogState {
  type: WorkoutType;
  date: string;
  editIndex?: number;
  editSection?: WorkoutSection;
}

function todayISO() {
  return new Date().toISOString().split("T")[0]!;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("cycle");
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [typePickerDate, setTypePickerDate] = useState<string>("");
  const [activeLog, setActiveLog] = useState<LogState | null>(null);
  const [ready, setReady] = useState(false);
  const [suggestion, setSuggestion] = useState<SuggestedWorkout | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const onboardedSetting = useSetting("onboarded");
  const isOnboarded = onboardedSetting?.value === "true";

  const latestCycle = useLatestCycleLog();
  const today = todayISO();
  const dailyLog = useDailyLog(today);

  useEffect(() => {
    seedExercises().then(() => setReady(true));
  }, []);

  const phaseForDate = useCallback(
    (dateStr: string): Phase | null => {
      if (!latestCycle) return null;
      return calculatePhase(
        latestCycle.periodStartDate,
        latestCycle.cycleLength,
        latestCycle.periodLength,
        dateStr
      ).phase;
    },
    [latestCycle]
  );

  const phaseData = latestCycle
    ? calculatePhase(
        latestCycle.periodStartDate,
        latestCycle.cycleLength,
        latestCycle.periodLength
      )
    : null;

  useEffect(() => {
    if (!phaseData) return;
    generateSuggestion(phaseData.phase, phaseData.cycleDay, today).then(setSuggestion);
  }, [phaseData, today, dailyLog]);

  const handleStepsChange = useCallback(
    (steps: number | null) => {
      if (phaseData) {
        updateDailyLogSteps(today, phaseData.phase, steps);
      }
    },
    [today, phaseData]
  );

  // Open type picker for a specific date
  const handleOpenLog = useCallback((date: string) => {
    setTypePickerDate(date);
    setShowTypePicker(true);
  }, []);

  // Open editor for an existing section
  const handleEditSection = useCallback((date: string, sectionIndex: number, section: WorkoutSection) => {
    setActiveLog({
      type: section.type,
      date,
      editIndex: sectionIndex,
      editSection: section,
    });
  }, []);

  const handlePlanWorkout = useCallback(
    (date: string, type: WorkoutType, notes: string) => {
      const phase = phaseForDate(date);
      if (!phase) return;
      savePlannedWorkout(date, phase, type, notes);
    },
    [phaseForDate]
  );

  const handleTypeSelect = useCallback((type: WorkoutType) => {
    setShowTypePicker(false);
    setActiveLog({ type, date: typePickerDate || today });
  }, [typePickerDate, today]);

  const handleSaveWorkout = useCallback(
    async (section: WorkoutSection) => {
      if (!activeLog) return;
      const date = activeLog.date;
      const phase = phaseForDate(date);
      if (!phase) return;

      if (activeLog.editIndex !== undefined) {
        await replaceSectionInDailyLog(date, activeLog.editIndex, section);
      } else {
        let walkSteps: number | null = null;
        if (section.type === "walk" && section.steps) {
          const todayLog = date === today ? dailyLog : null;
          const currentSteps = todayLog?.steps ?? 0;
          walkSteps = currentSteps + section.steps;
        }

        await upsertDailyLog(date, phase, {
          section,
          ...(walkSteps !== null && { steps: walkSteps }),
        });
      }
      setActiveLog(null);
    },
    [activeLog, phaseForDate, today, dailyLog]
  );

  if (!ready || onboardedSetting === undefined) return null;

  if (!isOnboarded) {
    return (
      <>
        <GrainOverlay />
        <Onboarding onComplete={() => {}} />
      </>
    );
  }

  if (!phaseData) {
    return (
      <div className="app">
        <GrainOverlay />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100dvh" }}>
          <span className="body-primary" style={{ color: "var(--text-tertiary)" }}>Loading...</span>
        </div>
      </div>
    );
  }

  const { phase, cycleDay, totalDays } = phaseData;
  const steps = dailyLog?.steps ?? null;
  const hasLogged = dailyLog ? dailyLog.sections !== "[]" : false;

  return (
    <div className="app">
      <GrainOverlay />

      <main className="app-content">
        {activeTab === "cycle" && (
          <CycleHome
            cycleDay={cycleDay}
            totalDays={totalDays}
            phase={phase}
            steps={steps}
            onStepsChange={handleStepsChange}
            onOpenSettings={() => setShowSettings(true)}
          />
        )}
        {activeTab === "movement" && (
          <Movement
            onAddWorkout={handleOpenLog}
            onEditSection={handleEditSection}
            onDeleteSection={deleteSectionFromDailyLog}
            onPlanWorkout={handlePlanWorkout}
          />
        )}
        {activeTab === "trends" && <Trends />}
        {activeTab === "history" && <History />}
      </main>

      {/* Type picker */}
      <AnimatePresence>
        {showTypePicker && (
          <TypePicker
            onSelect={handleTypeSelect}
            onClose={() => setShowTypePicker(false)}
            suggestion={suggestion}
          />
        )}
      </AnimatePresence>

      {/* Log screens */}
      <AnimatePresence>
        {activeLog?.type === "strength" && (
          <StrengthLog
            onSave={handleSaveWorkout}
            onClose={() => setActiveLog(null)}
            initialData={activeLog.editSection}
          />
        )}
        {(activeLog?.type === "pilates" ||
          activeLog?.type === "yoga" ||
          activeLog?.type === "mobility") && (
          <SessionLog
            type={activeLog.type}
            onSave={handleSaveWorkout}
            onClose={() => setActiveLog(null)}
            initialData={activeLog.editSection}
          />
        )}
        {activeLog?.type === "walk" && (
          <WalkLog
            onSave={handleSaveWorkout}
            onClose={() => setActiveLog(null)}
            initialData={activeLog.editSection}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSettings && <Settings onClose={() => setShowSettings(false)} />}
      </AnimatePresence>

      <FAB
        hasLoggedToday={hasLogged}
        onClick={() => handleOpenLog(today)}
      />

      <nav className="tab-bar">
        {(["cycle", "movement", "trends", "history"] as Tab[]).map((tab) => (
          <button
            key={tab}
            className={`tab-item ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            <span className="tab-label">{tab}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

