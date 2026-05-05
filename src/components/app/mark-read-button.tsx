"use client";

import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { useProgress } from "@/components/providers/progress-provider";
import { isModuleComplete } from "@/lib/progress/state";

export function MarkReadButton({ moduleId }: { moduleId: string }) {
  const { ready, state, setReadComplete, passThreshold } = useProgress();

  const progress = state.modules[moduleId];
  const complete = useMemo(
    () => isModuleComplete(progress, passThreshold),
    [passThreshold, progress],
  );

  if (!ready) {
    return (
      <Button type="button" disabled className="w-full sm:w-auto">
        Loading progress…
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <Button
        type="button"
        variant={progress.readComplete ? "secondary" : "default"}
        className="w-full sm:w-auto"
        onClick={() => setReadComplete(moduleId, !progress.readComplete)}
      >
        {progress.readComplete ? "Marked read (undo)" : "Mark as read"}
      </Button>
      <div className="text-sm text-muted-foreground">
        {complete
          ? "Module complete: read + quiz passed."
          : `Complete requires read + quiz ≥ ${passThreshold}%.`}
      </div>
    </div>
  );
}
