import type { ConceptTag } from "./concepts";

export type Severity = "low" | "med" | "high";

export type WeaknessSignal = {
  conceptTag: ConceptTag;
  severity: Severity;
  evidence: string;
};

export type WeakArea = {
  conceptTag: ConceptTag;
  score: number;
  lastObservedAt: number;
  lastEvidence: string;
  sourceSessionIds: string[];
};

export type CoachPlanItemKind = "flashcard" | "quiz" | "persona";

export type CoachPlanItem = {
  kind: CoachPlanItemKind;
  conceptTag: ConceptTag;
  conceptLabel: string;
  href: string;
  title: string;
  subtitle: string;
  helper?: string;
};

export type CoachPlanWeakArea = {
  conceptTag: ConceptTag;
  conceptLabel: string;
  score: number;
  severity: Severity;
  moduleId: string | null;
  lastEvidence: string;
  lastObservedAt: number;
};

export type CoachPlan = {
  generatedAt: number;
  items: CoachPlanItem[];
  weakAreas: CoachPlanWeakArea[];
};

export const SEVERITY_TO_SCORE: Record<Severity, number> = {
  low: 0.5,
  med: 1,
  high: 1.5,
};

export const WEAK_AREA_MAX = 3;
export const WEAK_AREA_DECAY_PER_DAY = 0.05;
export const PRACTICE_DECREASE_FLASHCARD = 0.4;
export const PRACTICE_DECREASE_QUIZ = 0.3;

export function scoreToSeverity(score: number): Severity {
  if (score >= 2) return "high";
  if (score >= 1) return "med";
  return "low";
}
