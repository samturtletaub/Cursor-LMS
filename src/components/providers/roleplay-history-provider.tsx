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

import { useProgress } from "@/components/providers/progress-provider";
import type { WeaknessSignal } from "@/lib/coach/types";
import {
  loadHistoryFromStorage,
  normalizeHistoryState,
  saveHistoryToStorage,
  upsertSessionInState,
} from "@/lib/roleplay/history-storage";
import type {
  RoleplayHistoryState,
  RoleplaySession,
} from "@/lib/roleplay/history-types";

type UpsertInput = Omit<RoleplaySession, "updatedAt"> & {
  updatedAt?: string;
};

type RoleplayHistoryContextValue = {
  ready: boolean;
  sessions: RoleplaySession[];
  getSession: (id: string) => RoleplaySession | undefined;
  upsertSession: (input: UpsertInput) => void;
  finalizeSession: (
    id: string,
    patch: {
      feedback?: string;
      endedAt?: string;
      signals?: WeaknessSignal[];
    },
  ) => void;
  pullNow: () => Promise<void>;
  pushNow: () => Promise<void>;
};

const RoleplayHistoryContext =
  createContext<RoleplayHistoryContextValue | null>(null);

export function RoleplayHistoryProvider({ children }: { children: ReactNode }) {
  const { syncCode } = useProgress();

  const [ready, setReady] = useState(false);
  const [state, setState] = useState<RoleplayHistoryState>(() =>
    normalizeHistoryState(null),
  );

  const syncCodeRef = useRef<string | null>(null);
  useEffect(() => {
    syncCodeRef.current = syncCode;
  }, [syncCode]);

  const pushTimerRef = useRef<number | null>(null);

  const pushInner = useCallback(
    async (next: RoleplayHistoryState, maybeCode?: string | null) => {
      const code = (maybeCode ?? syncCodeRef.current)?.trim().toLowerCase();
      if (!code) return;

      try {
        const res = await fetch("/api/roleplay/history/push", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ syncCode: code, state: next }),
        });

        if (!res.ok) return;

        const data = (await res.json()) as {
          ok?: boolean;
          conflict?: boolean;
          state?: RoleplayHistoryState;
        };

        if (data.conflict && data.state) {
          const server = normalizeHistoryState(data.state);
          saveHistoryToStorage(server);
          setState(server);
        }
      } catch {
        // best-effort, local still works
      }
    },
    [],
  );

  const schedulePush = useCallback(
    (next: RoleplayHistoryState) => {
      if (typeof window === "undefined") return;
      if (pushTimerRef.current) window.clearTimeout(pushTimerRef.current);
      pushTimerRef.current = window.setTimeout(() => {
        void pushInner(next, syncCodeRef.current);
      }, 900);
    },
    [pushInner],
  );

  const commit = useCallback(
    (updater: (prev: RoleplayHistoryState) => RoleplayHistoryState) => {
      setState((prev) => {
        const next = normalizeHistoryState(updater(prev));
        saveHistoryToStorage(next);
        schedulePush(next);
        return next;
      });
    },
    [schedulePush],
  );

  useEffect(() => {
    const local = loadHistoryFromStorage();
    startTransition(() => {
      setState(local);
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (!syncCode) return;
    let cancelled = false;

    void (async () => {
      try {
        const res = await fetch("/api/roleplay/history/pull", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ syncCode }),
        });
        if (!res.ok) return;

        const data = (await res.json()) as {
          ok?: boolean;
          state?: RoleplayHistoryState | null;
        };
        if (cancelled || !data.ok || !data.state) return;

        const server = normalizeHistoryState(data.state);
        setState((current) => {
          if (server.updatedAt > current.updatedAt) {
            saveHistoryToStorage(server);
            return server;
          }
          return current;
        });
      } catch {
        // ignore
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [syncCode]);

  const upsertSession = useCallback(
    (input: UpsertInput) => {
      const updatedAt = input.updatedAt ?? new Date().toISOString();
      const next: RoleplaySession = { ...input, updatedAt };
      commit((prev) => upsertSessionInState(prev, next));
    },
    [commit],
  );

  const finalizeSession = useCallback(
    (
      id: string,
      patch: {
        feedback?: string;
        endedAt?: string;
        signals?: WeaknessSignal[];
      },
    ) => {
      commit((prev) => {
        const existing = prev.sessions.find((s) => s.id === id);
        if (!existing) return prev;
        const merged: RoleplaySession = {
          ...existing,
          feedback: patch.feedback ?? existing.feedback,
          endedAt: patch.endedAt ?? existing.endedAt ?? new Date().toISOString(),
          signals:
            patch.signals && patch.signals.length > 0
              ? patch.signals
              : existing.signals,
          updatedAt: new Date().toISOString(),
        };
        return upsertSessionInState(prev, merged);
      });
    },
    [commit],
  );

  const getSession = useCallback(
    (id: string) => state.sessions.find((s) => s.id === id),
    [state.sessions],
  );

  const pullNow = useCallback(async () => {
    const code = syncCodeRef.current?.trim().toLowerCase();
    if (!code) return;
    try {
      const res = await fetch("/api/roleplay/history/pull", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ syncCode: code }),
      });
      if (!res.ok) return;
      const data = (await res.json()) as {
        ok?: boolean;
        state?: RoleplayHistoryState | null;
      };
      if (!data.ok || !data.state) return;

      const server = normalizeHistoryState(data.state);
      setState((current) => {
        if (server.updatedAt > current.updatedAt) {
          saveHistoryToStorage(server);
          return server;
        }
        return current;
      });
    } catch {
      // ignore
    }
  }, []);

  const pushNow = useCallback(async () => {
    await pushInner(loadHistoryFromStorage(), syncCodeRef.current);
  }, [pushInner]);

  const value = useMemo<RoleplayHistoryContextValue>(
    () => ({
      ready,
      sessions: state.sessions,
      getSession,
      upsertSession,
      finalizeSession,
      pullNow,
      pushNow,
    }),
    [
      ready,
      state.sessions,
      getSession,
      upsertSession,
      finalizeSession,
      pullNow,
      pushNow,
    ],
  );

  return (
    <RoleplayHistoryContext.Provider value={value}>
      {children}
    </RoleplayHistoryContext.Provider>
  );
}

export function useRoleplayHistory() {
  const ctx = useContext(RoleplayHistoryContext);
  if (!ctx) {
    throw new Error(
      "useRoleplayHistory must be used within RoleplayHistoryProvider",
    );
  }
  return ctx;
}
