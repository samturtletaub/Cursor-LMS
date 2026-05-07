"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useProgress } from "@/components/providers/progress-provider";
import type { QuizQuestion } from "@/lib/content/types";

type PreparedQuestion = QuizQuestion & {
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
};

function shuffle<T>(items: T[]) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function prepare(questions: QuizQuestion[]): PreparedQuestion[] {
  const shuffledQuestions = shuffle(questions);

  return shuffledQuestions.map((q) => {
    const order = shuffle([0, 1, 2, 3] as const);
    const options = order.map((idx) => q.options[idx]) as [
      string,
      string,
      string,
      string,
    ];
    const correctIndex = order.indexOf(q.correctIndex) as 0 | 1 | 2 | 3;

    return {
      ...q,
      options,
      correctIndex,
    };
  });
}

export function QuizRunner({
  moduleId,
  questions,
}: {
  moduleId: string;
  questions: QuizQuestion[];
}) {
  const { recordQuizAttempt, markPracticed, passThreshold } = useProgress();

  const [attemptKey, setAttemptKey] = useState(0);
  const prepared = useMemo(() => {
    void attemptKey;
    return prepare(questions);
  }, [questions, attemptKey]);

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = prepared[index];
  const isLast = index === prepared.length - 1;

  const scorePercent = finished
    ? Math.round((correctCount / prepared.length) * 100)
    : 0;

  const restart = () => {
    setAttemptKey((k) => k + 1);
    setIndex(0);
    setSelected(null);
    setRevealed(false);
    setCorrectCount(0);
    setFinished(false);
  };

  if (finished) {
    const passed = scorePercent >= passThreshold;

    return (
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="font-heading text-xl">Quiz results</CardTitle>
          <CardDescription className="font-mono text-xs">
            Score: {scorePercent}% ({correctCount}/{prepared.length} correct) · Pass{" "}
            {passThreshold}%
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div>
            {passed
              ? "Nice—this module’s quiz requirement is met."
              : "Not quite—review the explanations and try again."}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 sm:flex-row">
          <Button type="button" onClick={restart} variant="secondary">
            Retake
          </Button>
          <Link
            className={buttonVariants({ variant: "outline", size: "lg" })}
            href={`/modules/${moduleId}`}
          >
            Back to module
          </Link>
        </CardFooter>
      </Card>
    );
  }

  const onPick = (optionIndex: number) => {
    if (revealed) return;
    setSelected(optionIndex);
    setRevealed(true);

    const isCorrect = optionIndex === q.correctIndex;
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      markPracticed(q.conceptTags, "quiz");
    }
  };

  const onNext = () => {
    if (!revealed) return;

    if (isLast) {
      const finalPercent = Math.round((correctCount / prepared.length) * 100);
      recordQuizAttempt(moduleId, finalPercent);
      setFinished(true);
      return;
    }

    setIndex((i) => i + 1);
    setSelected(null);
    setRevealed(false);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="text-xs font-mono tracking-wide text-muted-foreground uppercase">
          Question {index + 1} / {prepared.length}
        </CardTitle>
        <div className="pt-2 text-lg font-medium leading-snug text-foreground sm:text-xl">
          {q.question}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          {q.options.map((opt, i) => {
            const isSelected = selected === i;
            const isCorrect = i === q.correctIndex;
            const showState = revealed;

            return (
              <button
                key={i}
                type="button"
                onClick={() => onPick(i)}
                className={[
                  "rounded-full border px-4 py-3 text-left text-sm transition-colors",
                  "border-border bg-muted/15 hover:bg-muted/30",
                  "dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]",
                  showState && isCorrect &&
                    "border-[rgba(182,217,252,0.45)] bg-[rgba(182,217,252,0.10)] dark:border-[rgba(182,217,252,0.45)]",
                  showState && isSelected && !isCorrect &&
                    "border-destructive/35 bg-destructive/10",
                  showState && !isSelected && !isCorrect && "opacity-55",
                ].join(" ")}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {revealed ? (
          <div className="glass-panel rounded-2xl p-4 text-sm">
            <div className="font-medium text-foreground">Explanation</div>
            <div className="mt-1 text-muted-foreground">{q.explanation}</div>
            <div className="mt-3">
              <Link
                className="text-[#b6d9fc] underline underline-offset-4 dark:text-[#b6d9fc]"
                href={q.sourceUrl}
                target="_blank"
                rel="noreferrer"
              >
                Source
              </Link>
            </div>
          </div>
        ) : null}

        <Separator className="bg-border/60" />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="font-mono text-xs text-muted-foreground">
            Running score: {correctCount}/{prepared.length}
          </div>
          <Button type="button" size="lg" onClick={onNext} disabled={!revealed}>
            {isLast ? "Finish" : "Next"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
