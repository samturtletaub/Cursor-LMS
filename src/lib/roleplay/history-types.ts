import type { WeaknessSignal } from "@/lib/coach/types";

export type RoleplayMessage = {
  role: "user" | "assistant";
  text: string;
  at: string;
};

export type RoleplaySession = {
  id: string;
  personaId: string;
  personaName: string;
  startedAt: string;
  updatedAt: string;
  endedAt?: string;
  messages: RoleplayMessage[];
  feedback?: string;
  signals?: WeaknessSignal[];
};

export type RoleplayHistoryState = {
  updatedAt: number;
  sessions: RoleplaySession[];
};

export const ROLEPLAY_HISTORY_STORAGE_KEY = "cursor-lms-roleplay-history-v1";
export const ROLEPLAY_HISTORY_MAX_SESSIONS = 20;
export const ROLEPLAY_HISTORY_MAX_MESSAGES_PER_SESSION = 200;
