"use client";

import { useEffect } from "react";

import { useProgress } from "@/components/providers/progress-provider";

export function ModuleVisitTracker({ moduleId }: { moduleId: string }) {
  const { ready, recordVisit } = useProgress();

  useEffect(() => {
    if (!ready) return;
    recordVisit(moduleId);
  }, [moduleId, ready, recordVisit]);

  return null;
}
