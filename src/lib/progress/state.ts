import { isConceptTag } from "@/lib/coach/concepts";
import type { WeakArea } from "@/lib/coach/types";
import { MODULE_COUNT } from "@/lib/progress/constants";
import type { ModuleProgress, ProgressState } from "@/lib/progress/types";

export function createEmptyModuleProgress(): ModuleProgress {
  return {
    readComplete: false,
    quizAttempts: 0,
    flashcards: {},
  };
}

function normalizeWeakAreas(
  input: Partial<ProgressState> | null,
): Record<string, WeakArea> {
  const out: Record<string, WeakArea> = {};
  const raw = input?.weakAreas;
  if (!raw || typeof raw !== "object") return out;

  for (const [tag, value] of Object.entries(raw)) {
    if (!value || typeof value !== "object") continue;
    if (!isConceptTag(tag)) continue;
    const score = typeof value.score === "number" ? value.score : 0;
    if (!Number.isFinite(score) || score <= 0) continue;
    out[tag] = {
      conceptTag: tag,
      score,
      lastObservedAt:
        typeof value.lastObservedAt === "number" ? value.lastObservedAt : 0,
      lastEvidence:
        typeof value.lastEvidence === "string" ? value.lastEvidence : "",
      sourceSessionIds: Array.isArray(value.sourceSessionIds)
        ? value.sourceSessionIds.filter((s) => typeof s === "string").slice(-10)
        : [],
    };
  }
  return out;
}

export function normalizeProgressState(input: Partial<ProgressState> | null): ProgressState {
  const modules: ProgressState["modules"] = {};

  for (let i = 1; i <= MODULE_COUNT; i += 1) {
    const id = String(i);
    const existing = input?.modules?.[id];
    modules[id] = {
      ...createEmptyModuleProgress(),
      ...existing,
      flashcards: { ...(existing?.flashcards ?? {}) },
    };
  }

  return {
    updatedAt: input?.updatedAt ?? 0,
    modules,
    weakAreas: normalizeWeakAreas(input),
  };
}

export function isModuleComplete(progress: ModuleProgress, passThreshold: number) {
  const quizScore = progress.lastQuizScore ?? 0;
  return progress.readComplete && quizScore >= passThreshold;
}

export function computeCompletedCount(
  state: ProgressState,
  passThreshold: number,
) {
  return Object.values(state.modules).filter((m) =>
    isModuleComplete(m, passThreshold),
  ).length;
}

export function averageLatestQuizScore(state: ProgressState) {
  const scores = Object.values(state.modules)
    .map((m) => m.lastQuizScore)
    .filter((s): s is number => typeof s === "number");

  if (scores.length === 0) return 0;
  return Math.round(
    scores.reduce((acc, s) => acc + s, 0) / scores.length,
  );
}

export function getModuleStatusLabel(
  progress: ModuleProgress,
  passThreshold: number,
): "Not started" | "In progress" | "Complete" {
  if (isModuleComplete(progress, passThreshold)) return "Complete";

  const touched =
    Boolean(progress.lastVisitedAt) ||
    progress.readComplete ||
    progress.quizAttempts > 0 ||
    Object.keys(progress.flashcards).length > 0;

  if (touched) return "In progress";
  return "Not started";
}
