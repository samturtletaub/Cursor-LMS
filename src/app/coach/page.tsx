import type { Metadata } from "next";

import { CoachPlanView } from "@/components/app/coach-plan";
import { loadFlashcards } from "@/lib/content/load-flashcards";
import { loadQuiz } from "@/lib/content/load-quiz";
import { MODULE_IDS } from "@/lib/content/types";
import { listPersonas } from "@/lib/roleplay/personas";
import type { ModuleAssetBundle } from "@/lib/coach/prescribe";

export const metadata: Metadata = {
  title: "Coach · Cursor LMS",
  description:
    "Today's adaptive plan: prescribed flashcards, quiz questions, and roleplay focus based on your weak areas.",
};

export const dynamic = "force-static";

export default async function CoachPage() {
  const bundles: ModuleAssetBundle[] = await Promise.all(
    MODULE_IDS.map(async (moduleId) => {
      const [flashcards, quiz] = await Promise.all([
        loadFlashcards(moduleId),
        loadQuiz(moduleId),
      ]);
      return { moduleId, flashcards, quiz };
    }),
  );

  const personas = listPersonas();

  return (
    <div className="flex w-full flex-col gap-8">
      <CoachPlanView bundles={bundles} personas={[...personas]} />
    </div>
  );
}
