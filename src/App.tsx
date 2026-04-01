import { useState } from "react";
import { GrainOverlay } from "./design/Grain";
import { FAB } from "./design/FAB";
import { CycleHome } from "./pages/CycleTab";
import { calculatePhase } from "./engine/phaseEngine";
import { profile } from "./models/profile";
import "./App.css";

type Tab = "cycle" | "movement" | "trends" | "history";

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("cycle");
  const [steps, setSteps] = useState<number | null>(null);

  const { phase, cycleDay, totalDays } = calculatePhase(
    profile.lastPeriodStart,
    profile.defaultCycleLength,
    profile.defaultPeriodLength
  );

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
            onStepsChange={setSteps}
          />
        )}
        {activeTab === "movement" && <PlaceholderPage name="Movement" />}
        {activeTab === "trends" && <PlaceholderPage name="Trends" />}
        {activeTab === "history" && <PlaceholderPage name="History" />}
      </main>

      <FAB hasLoggedToday={false} onClick={() => {}} />

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

function PlaceholderPage({ name }: { name: string }) {
  return (
    <div className="placeholder-page">
      <span className="placeholder-label">{name}</span>
    </div>
  );
}
