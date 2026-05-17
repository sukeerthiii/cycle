import { db } from "../db/database";

export async function exportJSON(): Promise<void> {
  const cycleLogs = await db.cycleLogs.toArray();
  const dailyLogs = await db.dailyLogs.toArray();
  const exercises = await db.exercises.toArray();
  const settings = await db.settings.toArray();

  const data = {
    exportDate: new Date().toISOString(),
    version: 1,
    cycleLogs,
    dailyLogs,
    exercises: exercises.filter((e) => e.isCustom),
    settings,
  };

  downloadFile(
    JSON.stringify(data, null, 2),
    `cycle-backup-${todayStr()}.json`,
    "application/json"
  );
}

export async function exportCSV(): Promise<void> {
  const dailyLogs = await db.dailyLogs.orderBy("date").toArray();

  const rows: string[] = ["Date,Phase,Type,Exercise,Pattern,Sets Detail,Volume (lb),Steps,Notes"];

  for (const log of dailyLogs) {
    let sections: {
      type: string;
      exercises: { exercise: { name: string; movementPattern?: string | null }; sets: { reps: number; weight: number | null; isBodyweight?: boolean }[] }[];
      duration: number | null;
      steps: number | null;
      distance: number | null;
      notes: string | null;
      intervals?: { type: string; durationSeconds: number }[];
    }[] = [];
    try { sections = JSON.parse(log.sections); } catch { continue; }

    if (sections.length === 0 && log.steps == null) continue;

    for (const section of sections) {
      if (section.exercises.length > 0) {
        for (const entry of section.exercises) {
          const setsDetail = entry.sets.map((s) => {
            const w = s.isBodyweight ? "BW" : `${s.weight ?? 0}`;
            return `${s.reps}x${w}`;
          }).join(", ");

          let volume = 0;
          for (const set of entry.sets) {
            volume += set.reps * (set.weight ?? 0);
          }

          rows.push([
            log.date,
            log.phase,
            section.type,
            `"${entry.exercise.name}"`,
            entry.exercise.movementPattern ?? "",
            `"${setsDetail}"`,
            volume.toString(),
            "",
            `"${(section.notes ?? "").replace(/"/g, '""')}"`,
          ].join(","));
        }
      } else {
        // Session-type workouts (pilates, yoga, cardio, walk, running)
        let detail = "";
        if (section.duration) detail = `${section.duration}m`;
        if (section.intervals) {
          detail = section.intervals.map((iv) => `${iv.type} ${Math.floor(iv.durationSeconds / 60)}:${String(iv.durationSeconds % 60).padStart(2, "0")}`).join(", ");
        }

        rows.push([
          log.date,
          log.phase,
          section.type,
          "",
          "",
          `"${detail}"`,
          "",
          (section.steps ?? "").toString(),
          `"${(section.notes ?? "").replace(/"/g, '""')}"`,
        ].join(","));
      }
    }

    // Steps-only days
    if (sections.length === 0 && log.steps != null) {
      rows.push([log.date, log.phase, "", "", "", "", "", log.steps.toString(), ""].join(","));
    }
  }

  downloadFile(rows.join("\n"), `cycle-export-${todayStr()}.csv`, "text/csv");
}

export async function importJSON(file: File): Promise<{ success: boolean; message: string }> {
  try {
    const text = await file.text();
    const data = JSON.parse(text);

    if (!data.version || !data.cycleLogs || !data.dailyLogs) {
      return { success: false, message: "Invalid backup file." };
    }

    await db.cycleLogs.bulkPut(data.cycleLogs);
    await db.dailyLogs.bulkPut(data.dailyLogs);
    if (data.exercises) await db.exercises.bulkPut(data.exercises);
    if (data.settings) await db.settings.bulkPut(data.settings);

    return { success: true, message: `Restored ${data.dailyLogs.length} days of data.` };
  } catch {
    return { success: false, message: "Failed to read backup file." };
  }
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}
