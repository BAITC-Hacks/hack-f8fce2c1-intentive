import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { cache } from "react";
import employees from "@/career_quest_dataset/employees.json";
import events from "@/career_quest_dataset/events.json";
import skills from "@/career_quest_dataset/skills.json";
import { importDataset } from "@/core/dataset/import";

/** Request-scoped loading. File access and the complete history stay on the server. */
export const loadStarterDataset = cache(async () => {
  const activityHistoryCsv = await readFile(join(process.cwd(), "career_quest_dataset", "activity_history.csv"), "utf8");
  return importDataset({ employees, events, skills, activityHistoryCsv });
});
