import Link from "next/link";
import { notFound } from "next/navigation";

import { FlashcardSession } from "@/components/app/flashcard-session";
import { buttonVariants } from "@/components/ui/button";
import { loadFlashcards } from "@/lib/content/load-flashcards";
import { isModuleId, MODULE_SUMMARIES } from "@/lib/content/modules-registry";
import { MODULE_IDS } from "@/lib/content/types";

export function generateStaticParams() {
  return MODULE_IDS.map((id) => ({ id }));
}

export default async function ModuleFlashcardsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isModuleId(id)) notFound();

  const summary = MODULE_SUMMARIES[id];
  const cards = await loadFlashcards(id);

  return (
    <div className="w-full max-w-3xl">
      <div className="mb-8 flex flex-col gap-3">
        <div className="font-mono text-xs text-muted-foreground">Module {id}</div>
        <h1 className="font-heading text-3xl font-medium tracking-tight text-foreground">
          Flashcards: {summary.title}
        </h1>
        <Link
          className={buttonVariants({ variant: "outline", size: "sm" })}
          href={`/modules/${id}`}
        >
          Back to module
        </Link>
      </div>

      <FlashcardSession moduleId={id} cards={cards} />
    </div>
  );
}
