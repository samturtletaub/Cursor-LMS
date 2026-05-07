"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookMarked,
  Compass,
  ListChecks,
  MessagesSquare,
  Sparkles,
} from "lucide-react";

import { useProgress } from "@/components/providers/progress-provider";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prescribe, type ModuleAssetBundle } from "@/lib/coach/prescribe";
import type {
  CoachPlanItem,
  CoachPlanWeakArea,
  Severity,
} from "@/lib/coach/types";
import type { Persona } from "@/lib/roleplay/personas";
import { cn } from "@/lib/utils";

const SEVERITY_COPY: Record<Severity, string> = {
  high: "High",
  med: "Medium",
  low: "Low",
};

const SEVERITY_BAR: Record<Severity, string> = {
  high: "bg-destructive/70",
  med: "bg-amber-300/70",
  low: "bg-muted-foreground/40",
};

function ItemIcon({ kind }: { kind: CoachPlanItem["kind"] }) {
  if (kind === "flashcard") return <BookMarked className="size-4 opacity-80" />;
  if (kind === "quiz") return <ListChecks className="size-4 opacity-80" />;
  return <MessagesSquare className="size-4 opacity-80" />;
}

function WeakAreaChip({ area }: { area: CoachPlanWeakArea }) {
  const widthPct = Math.min(100, Math.round((area.score / 3) * 100));
  return (
    <div className="rounded-2xl border border-border/60 bg-muted/20 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="text-sm font-medium text-foreground">
            {area.conceptLabel}
          </div>
          <div className="font-mono text-[11px] text-muted-foreground">
            {area.conceptTag}
            {area.moduleId ? ` · Module ${area.moduleId}` : ""}
          </div>
        </div>
        <Badge variant="outline" className="font-normal">
          {SEVERITY_COPY[area.severity]} · {area.score.toFixed(1)}
        </Badge>
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted/40">
        <div
          className={cn("h-full rounded-full", SEVERITY_BAR[area.severity])}
          style={{ width: `${widthPct}%` }}
        />
      </div>
      {area.lastEvidence ? (
        <div className="mt-3 line-clamp-2 text-xs text-muted-foreground">
          “{area.lastEvidence}”
        </div>
      ) : null}
    </div>
  );
}

export function CoachPlanView({
  bundles,
  personas,
}: {
  bundles: ModuleAssetBundle[];
  personas: Persona[];
}) {
  const { ready, state } = useProgress();

  const plan = React.useMemo(
    () => prescribe(state, bundles, personas),
    [state, bundles, personas],
  );

  const minutes = Math.max(5, Math.round(plan.items.length * 2.5));

  return (
    <div className="flex w-full flex-col gap-8">
      <section className="glass-panel rounded-2xl p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">
            <Compass className="size-3" /> Adaptive coach
          </Badge>
          <Badge variant="secondary">Personalized</Badge>
        </div>
        <h1 className="mt-4 font-heading text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
          Today’s plan
        </h1>
        <p className="mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Built from your latest roleplay coach feedback. Practice these items
          and the weak areas below will fade. Run another roleplay any time to
          refresh.
        </p>
      </section>

      {!ready ? (
        <Card>
          <CardHeader>
            <CardTitle>Loading your plan…</CardTitle>
            <CardDescription>
              Reading local progress and weak-area state.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : plan.items.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-4 opacity-80" />
              No coach plan yet
            </CardTitle>
            <CardDescription>
              Run a roleplay session and end with feedback. The coach will turn
              that feedback into a focused study block here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/roleplay"
              className={buttonVariants({ variant: "default", size: "lg" })}
            >
              <MessagesSquare className="size-4" />
              Start a roleplay
            </Link>
          </CardContent>
        </Card>
      ) : (
        <section className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle>Today’s plan</CardTitle>
                  <CardDescription>
                    {plan.items.length} items · about {minutes} minutes.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="font-normal">
                  Targets your top weak areas
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-2">
                {plan.items.map((item, idx) => (
                  <li key={`${item.kind}-${item.title}-${idx}`}>
                    <Link
                      href={item.href}
                      className="block rounded-2xl border border-border/60 bg-muted/15 p-4 transition-colors hover:bg-muted/30"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                            <ItemIcon kind={item.kind} />
                            {item.kind === "flashcard"
                              ? "Flashcard"
                              : item.kind === "quiz"
                                ? "Quiz question"
                                : "Roleplay focus"}
                            <span aria-hidden>·</span>
                            <span className="font-mono normal-case">
                              {item.subtitle}
                            </span>
                          </div>
                          <div className="mt-1 line-clamp-2 text-sm text-foreground">
                            {item.title}
                          </div>
                          {item.helper ? (
                            <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                              {item.helper}
                            </div>
                          ) : null}
                        </div>
                        <div className="shrink-0 self-center text-muted-foreground">
                          <ArrowRight className="size-4" />
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Weak areas</CardTitle>
              <CardDescription>
                Severity decays over time and drops with practice.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {plan.weakAreas.map((area) => (
                <WeakAreaChip key={area.conceptTag} area={area} />
              ))}
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
