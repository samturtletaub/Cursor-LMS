import fs from "node:fs/promises";
import path from "node:path";

import type { Flashcard } from "@/lib/content/types";

export async function loadFlashcards(moduleId: string): Promise<Flashcard[]> {
  const filePath = path.join(
    process.cwd(),
    "content",
    "flashcards",
    `module-${moduleId}.json`,
  );

  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw) as Flashcard[];
}
