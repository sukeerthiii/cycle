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

  const rows: string[] = ["Date,Phase,Type,Exercises,Sets,Volume (lb),Steps,Notes"];

  for (const log of dailyLogs) {
    let sections: { type: string; exercises: { exercise: { name: string }; sets: { reps: number; weight: number | null }[] }[]; duration: number | null; steps: number | null; notes: string | null }[] = [];
    try { sections = JSON.parse(log.sections); } catch { continue; }

    if (sections.length === 0 && log.steps == null) continue;

    for (const section of sections) {
      const exerciseNames = section.exercises.map((e) => e.exercise.name).join("; ");
      const totalSets = section.exercises.reduce((a, e) => a + e.sets.length, 0);
      let volume = 0;
      for (const entry of section.exercises) {
        for (const set of entry.sets) {
          volume += set.reps * (set.weight ?? 0);
        }
      }

      rows.push([
        log.date,
        log.phase,
        section.type,
        `"${exerciseNames}"`,
        totalSets.toString(),
        volume.toString(),
        (section.steps ?? log.steps ?? "").toString(),
        `"${(section.notes ?? "").replace(/"/g, '""')}"`,
      ].join(","));
    }

    if (sections.length === 0 && log.steps != null) {
      rows.push([log.date, log.phase, "", "", "", "", log.steps.toString(), ""].join(","));
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
