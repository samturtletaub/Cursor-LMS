import type { Flashcard, QuizQuestion } from "@/lib/content/types";
import type { ProgressState } from "@/lib/progress/types";
import type { Persona } from "@/lib/roleplay/personas";

import {
  CONCEPT_FOCUS_PROMPT,
  CONCEPT_TO_PERSONA,
  conceptLabel,
  conceptModuleId,
  isConceptTag,
  type ConceptTag,
} from "./concepts";
import { decayWeakAreas, topWeakAreas } from "./state";
import {
  scoreToSeverity,
  type CoachPlan,
  type CoachPlanItem,
  type CoachPlanWeakArea,
} from "./types";

export type ModuleAssetBundle = {
  moduleId: string;
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
};

const MAX_TOTAL_ITEMS = 6;
const MAX_FLASHCARDS_PER_TAG = 2;
const MAX_QUIZ_PER_TAG = 1;
const TOP_TAG_LIMIT = 3;

type AssetIndex = {
  flashcardsByTag: Map<ConceptTag, Array<{ card: Flashcard; moduleId: string }>>;
  quizByTag: Map<ConceptTag, Array<{ question: QuizQuestion; moduleId: string }>>;
};

function indexAssets(bundles: ModuleAssetBundle[]): AssetIndex {
  const flashcardsByTag = new Map<
    ConceptTag,
    Array<{ card: Flashcard; moduleId: string }>
  >();
  const quizByTag = new Map<
    ConceptTag,
    Array<{ question: QuizQuestion; moduleId: string }>
  >();

  for (const bundle of bundles) {
    for (const card of bundle.flashcards) {
      const tags = card.conceptTags ?? [];
      for (const tag of tags) {
        if (!isConceptTag(tag)) continue;
        const list = flashcardsByTag.get(tag) ?? [];
        list.push({ card, moduleId: bundle.moduleId });
        flashcardsByTag.set(tag, list);
      }
    }
    for (const q of bundle.quiz) {
      const tags = q.conceptTags ?? [];
      for (const tag of tags) {
        if (!isConceptTag(tag)) continue;
        const list = quizByTag.get(tag) ?? [];
        list.push({ question: q, moduleId: bundle.moduleId });
        quizByTag.set(tag, list);
      }
    }
  }

  return { flashcardsByTag, quizByTag };
}

function flashcardFreshness(
  state: ProgressState,
  moduleId: string,
  cardId: string,
): number {
  const mod = state.modules[moduleId];
  if (!mod) return 0;
  const fc = mod.flashcards[cardId];
  if (!fc) return 0;
  return fc.nextDue || 0;
}

function quizFreshness(state: ProgressState, moduleId: string): number {
  const mod = state.modules[moduleId];
  if (!mod) return 0;
  return mod.lastQuizAt ? new Date(mod.lastQuizAt).getTime() : 0;
}

export function prescribe(
  inputState: ProgressState,
  bundles: ModuleAssetBundle[],
  personas: readonly Persona[],
  now: number = Date.now(),
): CoachPlan {
  const decayed = decayWeakAreas(inputState.weakAreas, now);
  const top = topWeakAreas(decayed, TOP_TAG_LIMIT);

  const weakAreas: CoachPlanWeakArea[] = top.map((wa) => ({
    conceptTag: wa.conceptTag,
    conceptLabel: conceptLabel(wa.conceptTag),
    score: Math.round(wa.score * 100) / 100,
    severity: scoreToSeverity(wa.score),
    moduleId: conceptModuleId(wa.conceptTag),
    lastEvidence: wa.lastEvidence,
    lastObservedAt: wa.lastObservedAt,
  }));

  if (top.length === 0) {
    return { generatedAt: now, items: [], weakAreas: [] };
  }

  const index = indexAssets(bundles);
  const usedItems = new Set<string>();
  const items: CoachPlanItem[] = [];

  for (const area of top) {
    const tag = area.conceptTag;
    const label = conceptLabel(tag);

    const flashcardCandidates = (index.flashcardsByTag.get(tag) ?? [])
      .filter((c) => !usedItems.has(`flashcard:${c.card.id}`))
      .sort(
        (a, b) =>
          flashcardFreshness(inputState, a.moduleId, a.card.id) -
          flashcardFreshness(inputState, b.moduleId, b.card.id),
      )
      .slice(0, MAX_FLASHCARDS_PER_TAG);

    for (const c of flashcardCandidates) {
      if (items.length >= MAX_TOTAL_ITEMS) break;
      const key = `flashcard:${c.card.id}`;
      if (usedItems.has(key)) continue;
      usedItems.add(key);
      items.push({
        kind: "flashcard",
        conceptTag: tag,
        conceptLabel: label,
        href: `/modules/${c.moduleId}/flashcards`,
        title: c.card.front,
        subtitle: `Module ${c.moduleId} flashcard`,
        helper: label,
      });
    }

    if (items.length >= MAX_TOTAL_ITEMS) break;

    const quizCandidates = (index.quizByTag.get(tag) ?? [])
      .filter((q) => !usedItems.has(`quiz:${q.question.id}`))
      .sort(
        (a, b) => quizFreshness(inputState, a.moduleId) - quizFreshness(inputState, b.moduleId),
      )
      .slice(0, MAX_QUIZ_PER_TAG);

    for (const q of quizCandidates) {
      if (items.length >= MAX_TOTAL_ITEMS) break;
      const key = `quiz:${q.question.id}`;
      if (usedItems.has(key)) continue;
      usedItems.add(key);
      items.push({
        kind: "quiz",
        conceptTag: tag,
        conceptLabel: label,
        href: `/modules/${q.moduleId}/quiz`,
        title: q.question.question,
        subtitle: `Module ${q.moduleId} quiz`,
        helper: label,
      });
    }
  }

  if (items.length < MAX_TOTAL_ITEMS && top.length > 0) {
    const strongest = top[0];
    const personaId =
      CONCEPT_TO_PERSONA[strongest.conceptTag] ?? personas[0]?.id;
    const persona = personas.find((p) => p.id === personaId) ?? personas[0];
    if (persona) {
      const focus =
        CONCEPT_FOCUS_PROMPT[strongest.conceptTag] ??
        `Focus on ${conceptLabel(strongest.conceptTag)}.`;
      items.push({
        kind: "persona",
        conceptTag: strongest.conceptTag,
        conceptLabel: conceptLabel(strongest.conceptTag),
        href: `/roleplay/${persona.id}`,
        title: `Practice with ${persona.name}`,
        subtitle: `${persona.title} · ${persona.archetype}`,
        helper: focus,
      });
    }
  }

  return {
    generatedAt: now,
    items: items.slice(0, MAX_TOTAL_ITEMS),
    weakAreas,
  };
}
