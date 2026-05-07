import {
  PRACTICE_DECREASE_FLASHCARD,
  PRACTICE_DECREASE_QUIZ,
  SEVERITY_TO_SCORE,
  WEAK_AREA_DECAY_PER_DAY,
  WEAK_AREA_MAX,
  type WeakArea,
  type WeaknessSignal,
} from "./types";
import { isConceptTag } from "./concepts";

const DAY_MS = 24 * 60 * 60 * 1000;

function clamp(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

export function mergeSignals(
  existing: Record<string, WeakArea>,
  signals: WeaknessSignal[],
  sessionId: string,
  now: number,
): Record<string, WeakArea> {
  if (!signals || signals.length === 0) return existing;

  const next: Record<string, WeakArea> = { ...existing };

  for (const signal of signals) {
    if (!isConceptTag(signal.conceptTag)) continue;
    const bump = SEVERITY_TO_SCORE[signal.severity] ?? 1;
    const prev = next[signal.conceptTag];
    const prevSessions = prev?.sourceSessionIds ?? [];
    const sessionIds = sessionId
      ? Array.from(new Set([...prevSessions, sessionId])).slice(-10)
      : prevSessions;

    const nextScore = clamp((prev?.score ?? 0) + bump, 0, WEAK_AREA_MAX);

    next[signal.conceptTag] = {
      conceptTag: signal.conceptTag,
      score: nextScore,
      lastObservedAt: now,
      lastEvidence: signal.evidence || prev?.lastEvidence || "",
      sourceSessionIds: sessionIds,
    };
  }

  return next;
}

export function decayWeakAreas(
  state: Record<string, WeakArea>,
  now: number,
): Record<string, WeakArea> {
  let changed = false;
  const next: Record<string, WeakArea> = {};

  for (const [tag, area] of Object.entries(state)) {
    if (!area) continue;
    const last = area.lastObservedAt || now;
    const days = Math.max(0, (now - last) / DAY_MS);
    const decayed = area.score - days * WEAK_AREA_DECAY_PER_DAY;
    if (decayed <= 0) {
      changed = true;
      continue;
    }
    if (decayed === area.score) {
      next[tag] = area;
      continue;
    }
    changed = true;
    next[tag] = { ...area, score: decayed };
  }

  return changed ? next : state;
}

export function decreaseForPractice(
  state: Record<string, WeakArea>,
  conceptTags: string[] | undefined,
  kind: "flashcard" | "quiz",
): Record<string, WeakArea> {
  if (!conceptTags || conceptTags.length === 0) return state;

  const decrement =
    kind === "flashcard" ? PRACTICE_DECREASE_FLASHCARD : PRACTICE_DECREASE_QUIZ;

  let changed = false;
  const next: Record<string, WeakArea> = { ...state };

  for (const tag of conceptTags) {
    if (!isConceptTag(tag)) continue;
    const existing = next[tag];
    if (!existing) continue;

    const updatedScore = existing.score - decrement;
    if (updatedScore <= 0) {
      changed = true;
      delete next[tag];
      continue;
    }
    changed = true;
    next[tag] = { ...existing, score: updatedScore };
  }

  return changed ? next : state;
}

export function topWeakAreas(
  state: Record<string, WeakArea>,
  limit: number,
): WeakArea[] {
  return Object.values(state)
    .filter((a) => a.score > 0)
    .sort((a, b) => b.score - a.score || b.lastObservedAt - a.lastObservedAt)
    .slice(0, limit);
}

export function openWeakAreaCount(state: Record<string, WeakArea>): number {
  return Object.values(state).filter((a) => a.score > 0).length;
}
