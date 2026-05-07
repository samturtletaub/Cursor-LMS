import {
  ROLEPLAY_HISTORY_MAX_MESSAGES_PER_SESSION,
  ROLEPLAY_HISTORY_MAX_SESSIONS,
  ROLEPLAY_HISTORY_STORAGE_KEY,
  type RoleplayHistoryState,
  type RoleplayMessage,
  type RoleplaySession,
} from "@/lib/roleplay/history-types";

function assertBrowser() {
  if (typeof window === "undefined") {
    throw new Error("Roleplay history storage is browser-only.");
  }
}

function isRole(value: unknown): value is RoleplayMessage["role"] {
  return value === "user" || value === "assistant";
}

function normalizeMessage(input: unknown): RoleplayMessage | null {
  if (!input || typeof input !== "object") return null;
  const m = input as Partial<RoleplayMessage>;
  if (!isRole(m.role)) return null;
  if (typeof m.text !== "string" || m.text.trim().length === 0) return null;
  const at = typeof m.at === "string" && m.at.length > 0 ? m.at : new Date().toISOString();
  return { role: m.role, text: m.text, at };
}

function normalizeSession(input: unknown): RoleplaySession | null {
  if (!input || typeof input !== "object") return null;
  const s = input as Partial<RoleplaySession>;
  if (typeof s.id !== "string" || s.id.length === 0) return null;
  if (typeof s.personaId !== "string" || s.personaId.length === 0) return null;
  if (typeof s.personaName !== "string" || s.personaName.length === 0) return null;

  const startedAt =
    typeof s.startedAt === "string" && s.startedAt.length > 0
      ? s.startedAt
      : new Date().toISOString();
  const updatedAt =
    typeof s.updatedAt === "string" && s.updatedAt.length > 0 ? s.updatedAt : startedAt;

  const messages = Array.isArray(s.messages)
    ? (s.messages
        .map(normalizeMessage)
        .filter(Boolean) as RoleplayMessage[])
    : [];

  const cappedMessages =
    messages.length > ROLEPLAY_HISTORY_MAX_MESSAGES_PER_SESSION
      ? messages.slice(-ROLEPLAY_HISTORY_MAX_MESSAGES_PER_SESSION)
      : messages;

  return {
    id: s.id,
    personaId: s.personaId,
    personaName: s.personaName,
    startedAt,
    updatedAt,
    endedAt: typeof s.endedAt === "string" ? s.endedAt : undefined,
    messages: cappedMessages,
    feedback:
      typeof s.feedback === "string" && s.feedback.length > 0 ? s.feedback : undefined,
  };
}

export function normalizeHistoryState(
  input: Partial<RoleplayHistoryState> | null | undefined,
): RoleplayHistoryState {
  const rawSessions = Array.isArray(input?.sessions) ? input!.sessions : [];
  const normalized = rawSessions
    .map(normalizeSession)
    .filter(Boolean) as RoleplaySession[];

  normalized.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );

  return {
    updatedAt: typeof input?.updatedAt === "number" ? input!.updatedAt : 0,
    sessions: normalized.slice(0, ROLEPLAY_HISTORY_MAX_SESSIONS),
  };
}

export function loadHistoryFromStorage(): RoleplayHistoryState {
  assertBrowser();
  const raw = window.localStorage.getItem(ROLEPLAY_HISTORY_STORAGE_KEY);
  if (!raw) return normalizeHistoryState(null);

  try {
    const parsed = JSON.parse(raw) as Partial<RoleplayHistoryState>;
    return normalizeHistoryState(parsed);
  } catch {
    return normalizeHistoryState(null);
  }
}

export function saveHistoryToStorage(state: RoleplayHistoryState) {
  assertBrowser();
  window.localStorage.setItem(
    ROLEPLAY_HISTORY_STORAGE_KEY,
    JSON.stringify(state),
  );
}

export function upsertSessionInState(
  state: RoleplayHistoryState,
  session: RoleplaySession,
): RoleplayHistoryState {
  const existingIndex = state.sessions.findIndex((s) => s.id === session.id);
  const next = [...state.sessions];
  if (existingIndex >= 0) {
    next[existingIndex] = session;
  } else {
    next.unshift(session);
  }
  return normalizeHistoryState({
    updatedAt: Date.now(),
    sessions: next,
  });
}
