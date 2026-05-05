"use client";

import Link from "next/link";
import { startTransition, useEffect, useMemo, useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useProgress } from "@/components/providers/progress-provider";
import type { Flashcard } from "@/lib/content/types";
import { getOrCreateCardProgress, isDue } from "@/lib/spaced-repetition";

export function FlashcardSession({
  moduleId,
  cards,
}: {
  moduleId: string;
  cards: Flashcard[];
}) {
  const { state, updateFlashcard } = useProgress();

  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    startTransition(() => setNow(Date.now()));
  }, [cards, moduleId, state.modules]);

  const ordered = useMemo(() => {
    const mod = state.modules[moduleId];
    const t = now ?? 0;

    return [...cards].sort((a, b) => {
      const pa = getOrCreateCardProgress(mod.flashcards[a.id]);
      const pb = getOrCreateCardProgress(mod.flashcards[b.id]);
      const da = isDue(t, pa) ? 0 : 1;
      const db = isDue(t, pb) ? 0 : 1;
      if (da !== db) return da - db;
      return pa.nextDue - pb.nextDue;
    });
  }, [cards, moduleId, now, state.modules]);

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const safeIndex = Math.min(index, Math.max(ordered.length - 1, 0));
  const card = ordered[safeIndex];

  const resetSession = () => {
    setIndex(0);
    setFlipped(false);
  };

  if (!card) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Flashcards</CardTitle>
          <CardDescription>No cards found for this module.</CardDescription>
        </CardHeader>
        <CardFooter>
          <Link className={buttonVariants({ variant: "outline" })} href={`/modules/${moduleId}`}>
            Back to module
          </Link>
        </CardFooter>
      </Card>
    );
  }

  const onOutcome = (outcome: "got-it" | "review") => {
    updateFlashcard(moduleId, card.id, outcome);
    setFlipped(false);
    setIndex((i) => (i + 1 < ordered.length ? i + 1 : 0));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Flashcards</CardTitle>
        <CardDescription>
          Leitner-style scheduling: due cards are prioritized. Tap the card to flip.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Card {safeIndex + 1} of {ordered.length}
        </div>

        <button
          type="button"
          className="glass-card w-full rounded-2xl px-4 py-10 text-left backdrop-blur-md transition-colors hover:bg-muted/30 dark:hover:bg-white/[0.05]"
          onClick={() => setFlipped((v) => !v)}
        >
          <div className="text-xs font-medium text-muted-foreground">
            {flipped ? "Back" : "Front"}
          </div>
          <div className="mt-2 text-base text-foreground">
            {flipped ? card.back : card.front}
          </div>
        </button>

        {flipped ? (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="button" onClick={() => onOutcome("got-it")}>
              Got it
            </Button>
            <Button type="button" variant="secondary" onClick={() => onOutcome("review")}>
              Need review
            </Button>
          </div>
        ) : null}

        {card.sourceUrl ? (
          <div className="text-sm">
            <Link
              className="underline underline-offset-4"
              href={card.sourceUrl}
              target="_blank"
              rel="noreferrer"
            >
              Source
            </Link>
          </div>
        ) : null}
      </CardContent>
      <CardFooter className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Button type="button" variant="outline" onClick={resetSession}>
          Reset session order
        </Button>
        <Link className={buttonVariants({ variant: "outline" })} href={`/modules/${moduleId}`}>
          Back to module
        </Link>
      </CardFooter>
    </Card>
  );
}
