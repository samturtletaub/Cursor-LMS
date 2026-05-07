"use client";

import Link from "next/link";

import { CoachDashboardWidget } from "@/components/app/coach-dashboard-widget";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useProgress } from "@/components/providers/progress-provider";
import { getAllModuleSummaries } from "@/lib/content/modules-registry";
import {
  getModuleStatusLabel,
  isModuleComplete,
} from "@/lib/progress/state";

function formatDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

export function HomeDashboard() {
  const { ready, state, passThreshold, completedCount, overallPercent, avgQuiz } =
    useProgress();

  const modules = getAllModuleSummaries();

  const nextModule =
    modules.find((m) => !isModuleComplete(state.modules[m.id], passThreshold)) ??
    modules[0];

  if (!ready) {
    return (
      <div className="w-full text-sm text-muted-foreground">
        Loading your progress…
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-10">
      <section className="glass-panel rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">Self-paced</Badge>
            <Badge variant="secondary">Command center</Badge>
          </div>
          <div className="space-y-3">
            <h1 className="font-heading text-3xl font-medium tracking-tight text-foreground sm:text-4xl lg:text-[44px] lg:leading-[1.16]">
              Cursor Sales Enablement LMS
            </h1>
            <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
              Six modules to ramp on the SDLC, AI coding assistants, Cursor,
              buying centers, competition, and Cursor’s enterprise sales motion.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href={`/modules/${nextModule.id}`}
              className={buttonVariants({ variant: "default", size: "lg" })}
            >
              Continue: Module {nextModule.id}
            </Link>
            <Link
              href="/modules/1"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              Start from Module 1
            </Link>
          </div>
        </div>
      </section>

      <CoachDashboardWidget />

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Overall progress</CardTitle>
            <CardDescription>
              Stored locally. Sync across devices from the sidebar.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={overallPercent} className="w-full" />
            <div className="grid gap-2 text-sm text-muted-foreground">
              <div className="flex items-center justify-between gap-3">
                <span>Modules complete</span>
                <span className="font-mono text-xs text-foreground">
                  {completedCount} / 6
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Avg latest quiz</span>
                <span className="font-mono text-xs text-foreground">{avgQuiz}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Modules</CardTitle>
            <CardDescription>Read → flashcards → quiz. Pass at {passThreshold}%.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {modules.map((m) => {
                const p = state.modules[m.id];
                const status = getModuleStatusLabel(p, passThreshold);
                const lastScore =
                  typeof p.lastQuizScore === "number" ? `${p.lastQuizScore}%` : "—";

                return (
                  <Card
                    key={m.id}
                    className="border-border/70 shadow-none ring-1 ring-border/60"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <CardTitle className="text-base">{m.title}</CardTitle>
                        <Badge variant="secondary">{status}</Badge>
                      </div>
                      <CardDescription className="font-mono text-[11px]">
                        Quiz {lastScore} · Visited {formatDate(p.lastVisitedAt)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <Link
                        href={`/modules/${m.id}`}
                        className={buttonVariants({
                          variant: "secondary",
                          size: "sm",
                        })}
                      >
                        Read
                      </Link>
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/modules/${m.id}/flashcards`}
                          className={buttonVariants({
                            variant: "outline",
                            size: "sm",
                          })}
                        >
                          Flashcards
                        </Link>
                        <Link
                          href={`/modules/${m.id}/quiz`}
                          className={buttonVariants({
                            variant: "outline",
                            size: "sm",
                          })}
                        >
                          Quiz
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
