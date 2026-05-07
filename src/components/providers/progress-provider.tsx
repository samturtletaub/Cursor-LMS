"use client";

import {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  decayWeakAreas,
  decreaseForPractice,
  mergeSignals,
  openWeakAreaCount,
} from "@/lib/coach/state";
import type { WeaknessSignal } from "@/lib/coach/types";
import { QUIZ_PASS_THRESHOLD } from "@/lib/progress/constants";
import { applyGotIt, applyNeedReview } from "@/lib/spaced-repetition";
import {
  averageLatestQuizScore,
  computeCompletedCount,
  normalizeProgressState,
} from "@/lib/progress/state";
import type { ProgressState } from "@/lib/progress/types";
import {
  generateSyncCode,
  loadProgressFromStorage,
  loadSyncCodeFromStorage,
  saveProgressToStorage,
  saveSyncCodeToStorage,
} from "@/lib/progress/storage";

type ProgressContextValue = {
  ready: boolean;
  syncCode: string | null;
  state: ProgressState;
  passThreshold: number;
  setSyncCode: (code: string) => void;
  recordVisit: (moduleId: string) => void;
  setReadComplete: (moduleId: string, done: boolean) => void;
  recordQuizAttempt: (moduleId: string, scorePercent: number) => void;
  updateFlashcard: (
    moduleId: string,
    cardId: string,
    outcome: "got-it" | "review",
    conceptTagsForPractice?: string[],
  ) => void;
  recordWeaknessSignals: (
    sessionId: string,
    signals: WeaknessSignal[],
  ) => void;
  markPracticed: (
    conceptTags: string[] | undefined,
    kind: "flashcard" | "quiz",
  ) => void;
  pullRemote: (maybeCode?: string) => Promise<void>;
  pushRemote: () => Promise<void>;
  completedCount: number;
  overallPercent: number;
  avgQuiz: number;
  openWeakAreas: number;
};

const ProgressContext = createContext<ProgressContextValue | null>(null);

function bumpUpdatedAt(state: ProgressState): ProgressState {
  return { ...state, updatedAt: Date.now() };
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [syncCode, setSyncCodeState] = useState<string | null>(null);
  const [state, setState] = useState<ProgressState>(() =>
    normalizeProgressState(null),
  );

  const syncCodeRef = useRef<string | null>(null);
  useEffect(() => {
    syncCodeRef.current = syncCode;
  }, [syncCode]);

  const pushTimerRef = useRef<number | null>(null);

  const pushRemoteInner = useCallback(
    async (next: ProgressState, maybeCode?: string | null) => {
    const code = (maybeCode ?? syncCodeRef.current)?.trim().toLowerCase();
    if (!code) return;

    try {
      const res = await fetch("/api/sync/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ syncCode: code, state: next }),
      });

      if (!res.ok) return;

      const data = (await res.json()) as {
        ok?: boolean;
        conflict?: boolean;
        state?: ProgressState;
      };

      if (data.conflict && data.state) {
        const server = normalizeProgressState(data.state);
        saveProgressToStorage(server);
        setState(server);
      }
    } catch {
      // Remote sync is best-effort; local progress still works.
    }
  },
  [],
  );

  const schedulePush = useCallback(
    (next: ProgressState) => {
      if (typeof window === "undefined") return;
      if (pushTimerRef.current) window.clearTimeout(pushTimerRef.current);
      pushTimerRef.current = window.setTimeout(() => {
        void pushRemoteInner(next, syncCodeRef.current);
      }, 900);
    },
    [pushRemoteInner],
  );

  const commit = useCallback(
    (updater: (prev: ProgressState) => ProgressState) => {
      setState((prev) => {
        const updated = updater(prev);
        const decayed = {
          ...updated,
          weakAreas: decayWeakAreas(updated.weakAreas, Date.now()),
        };
        const normalized = normalizeProgressState(decayed);
        const next = bumpUpdatedAt(normalized);
        saveProgressToStorage(next);
        schedulePush(next);
        return next;
      });
    },
    [schedulePush],
  );

  useEffect(() => {
    const local = loadProgressFromStorage();
    let code = loadSyncCodeFromStorage();
    if (!code) {
      code = generateSyncCode();
      saveSyncCodeToStorage(code);
    }

    const localDecayed: ProgressState = {
      ...local,
      weakAreas: decayWeakAreas(local.weakAreas, Date.now()),
    };

    startTransition(() => {
      setSyncCodeState(code);
      setState(normalizeProgressState(localDecayed));
      setReady(true);
    });

    void (async () => {
      try {
        const res = await fetch("/api/sync/pull", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ syncCode: code }),
        });
        if (!res.ok) return;

        const data = (await res.json()) as {
          ok?: boolean;
          state?: ProgressState | null;
        };

        if (!data.ok || !data.state) return;

        const server = normalizeProgressState(data.state);
        const serverDecayed: ProgressState = {
          ...server,
          weakAreas: decayWeakAreas(server.weakAreas, Date.now()),
        };
        setState((current) => {
          if (serverDecayed.updatedAt > current.updatedAt) {
            saveProgressToStorage(serverDecayed);
            return serverDecayed;
          }
          return current;
        });
      } catch {
        // ignore
      }
    })();
  }, []);

  const setSyncCode = useCallback((code: string) => {
    const normalized = code.trim().toLowerCase().replace(/\s+/g, "");
    saveSyncCodeToStorage(normalized);
    setSyncCodeState(normalized);
  }, []);

  const recordVisit = useCallback(
    (moduleId: string) => {
      commit((prev) => ({
        ...prev,
        modules: {
          ...prev.modules,
          [moduleId]: {
            ...prev.modules[moduleId],
            lastVisitedAt: new Date().toISOString(),
          },
        },
      }));
    },
    [commit],
  );

  const setReadComplete = useCallback(
    (moduleId: string, done: boolean) => {
      commit((prev) => ({
        ...prev,
        modules: {
          ...prev.modules,
          [moduleId]: {
            ...prev.modules[moduleId],
            readComplete: done,
          },
        },
      }));
    },
    [commit],
  );

  const recordQuizAttempt = useCallback(
    (moduleId: string, scorePercent: number) => {
      commit((prev) => {
        const current = prev.modules[moduleId];
        return {
          ...prev,
          modules: {
            ...prev.modules,
            [moduleId]: {
              ...current,
              lastQuizScore: scorePercent,
              lastQuizAt: new Date().toISOString(),
              quizAttempts: current.quizAttempts + 1,
            },
          },
        };
      });
    },
    [commit],
  );

  const updateFlashcard = useCallback(
    (
      moduleId: string,
      cardId: string,
      outcome: "got-it" | "review",
      conceptTagsForPractice?: string[],
    ) => {
      const now = Date.now();
      commit((prev) => {
        const mod = prev.modules[moduleId];
        const existing = mod.flashcards[cardId];
        const nextCard =
          outcome === "got-it"
            ? applyGotIt(now, existing)
            : applyNeedReview(now, existing);

        let weakAreas = prev.weakAreas;
        if (
          outcome === "got-it" &&
          conceptTagsForPractice &&
          conceptTagsForPractice.length > 0
        ) {
          weakAreas = decreaseForPractice(
            weakAreas,
            conceptTagsForPractice,
            "flashcard",
          );
        }

        return {
          ...prev,
          weakAreas,
          modules: {
            ...prev.modules,
            [moduleId]: {
              ...mod,
              flashcards: {
                ...mod.flashcards,
                [cardId]: nextCard,
              },
            },
          },
        };
      });
    },
    [commit],
  );

  const pullRemote = useCallback(async (maybeCode?: string) => {
    const code = (maybeCode ?? syncCodeRef.current)?.trim().toLowerCase();
    if (!code) return;

    const res = await fetch("/api/sync/pull", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ syncCode: code }),
    });
    if (!res.ok) return;

    const data = (await res.json()) as {
      ok?: boolean;
      state?: ProgressState | null;
    };
    if (!data.ok || !data.state) return;

    const server = normalizeProgressState(data.state);
    const serverDecayed: ProgressState = {
      ...server,
      weakAreas: decayWeakAreas(server.weakAreas, Date.now()),
    };
    setState((current) => {
      if (serverDecayed.updatedAt > current.updatedAt) {
        saveProgressToStorage(serverDecayed);
        return serverDecayed;
      }
      return current;
    });
  }, []);

  const pushRemote = useCallback(async () => {
    await pushRemoteInner(loadProgressFromStorage(), syncCodeRef.current);
  }, [pushRemoteInner]);

  const recordWeaknessSignals = useCallback(
    (sessionId: string, signals: WeaknessSignal[]) => {
      if (!signals || signals.length === 0) return;
      commit((prev) => ({
        ...prev,
        weakAreas: mergeSignals(
          prev.weakAreas,
          signals,
          sessionId,
          Date.now(),
        ),
      }));
    },
    [commit],
  );

  const markPracticed = useCallback(
    (conceptTags: string[] | undefined, kind: "flashcard" | "quiz") => {
      if (!conceptTags || conceptTags.length === 0) return;
      commit((prev) => ({
        ...prev,
        weakAreas: decreaseForPractice(prev.weakAreas, conceptTags, kind),
      }));
    },
    [commit],
  );

  const completedCount = useMemo(
    () => computeCompletedCount(state, QUIZ_PASS_THRESHOLD),
    [state],
  );

  const overallPercent = useMemo(
    () => Math.round((completedCount / 6) * 100),
    [completedCount],
  );

  const avgQuiz = useMemo(() => averageLatestQuizScore(state), [state]);

  const openWeakAreas = useMemo(() => {
    const decayed = decayWeakAreas(state.weakAreas, Date.now());
    return openWeakAreaCount(decayed);
  }, [state.weakAreas]);

  const value = useMemo<ProgressContextValue>(
    () => ({
      ready,
      syncCode,
      state,
      passThreshold: QUIZ_PASS_THRESHOLD,
      setSyncCode,
      recordVisit,
      setReadComplete,
      recordQuizAttempt,
      updateFlashcard,
      recordWeaknessSignals,
      markPracticed,
      pullRemote,
      pushRemote,
      completedCount,
      overallPercent,
      avgQuiz,
      openWeakAreas,
    }),
    [
      avgQuiz,
      completedCount,
      markPracticed,
      openWeakAreas,
      overallPercent,
      pullRemote,
      pushRemote,
      ready,
      recordQuizAttempt,
      recordVisit,
      recordWeaknessSignals,
      setReadComplete,
      setSyncCode,
      state,
      syncCode,
      updateFlashcard,
    ],
  );

  return (
    <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) {
    throw new Error("useProgress must be used within ProgressProvider");
  }
  return ctx;
}
