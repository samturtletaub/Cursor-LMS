"use client";

import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";

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
import { decayWeakAreas, topWeakAreas } from "@/lib/coach/state";
import { conceptLabel } from "@/lib/coach/concepts";

export function CoachDashboardWidget() {
  const { ready, state } = useProgress();

  if (!ready) return null;

  const decayed = decayWeakAreas(state.weakAreas, Date.now());
  const top = topWeakAreas(decayed, 3);
  const openCount = Object.values(decayed).filter((a) => a.score > 0).length;

  return (
    <Card className="ring-1 ring-border/60">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Compass className="size-4 opacity-80" />
              Adaptive coach
            </CardTitle>
            <CardDescription>
              {openCount > 0
                ? `Coach plan ready · ${openCount} weak area${openCount === 1 ? "" : "s"}, about ${Math.max(5, openCount * 5)} min.`
                : "Run a roleplay and end with feedback to populate a personalized plan."}
            </CardDescription>
          </div>
          <Link
            href="/coach"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Open coach
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </CardHeader>
      {top.length > 0 ? (
        <CardContent>
          <div className="flex flex-wrap gap-1.5">
            {top.map((area) => (
              <Badge
                key={area.conceptTag}
                variant="outline"
                className="font-normal"
                title={area.conceptTag}
              >
                {conceptLabel(area.conceptTag)}
              </Badge>
            ))}
          </div>
        </CardContent>
      ) : null}
    </Card>
  );
}
