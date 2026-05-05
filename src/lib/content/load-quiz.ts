import fs from "node:fs/promises";
import path from "node:path";

import type { QuizQuestion } from "@/lib/content/types";

export async function loadQuiz(moduleId: string): Promise<QuizQuestion[]> {
  const filePath = path.join(
    process.cwd(),
    "content",
    "quizzes",
    `module-${moduleId}.json`,
  );

  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw) as QuizQuestion[];
}
