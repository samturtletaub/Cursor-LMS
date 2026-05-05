import {
  PROGRESS_STORAGE_KEY,
  SYNC_CODE_STORAGE_KEY,
} from "@/lib/progress/constants";
import { normalizeProgressState } from "@/lib/progress/state";
import type { ProgressState } from "@/lib/progress/types";

function assertBrowser() {
  if (typeof window === "undefined") {
    throw new Error("Progress storage is browser-only.");
  }
}

export function loadProgressFromStorage(): ProgressState {
  assertBrowser();
  const raw = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
  if (!raw) return normalizeProgressState(null);

  try {
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    return normalizeProgressState(parsed);
  } catch {
    return normalizeProgressState(null);
  }
}

export function saveProgressToStorage(state: ProgressState) {
  assertBrowser();
  window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(state));
}

export function loadSyncCodeFromStorage(): string | null {
  assertBrowser();
  return window.localStorage.getItem(SYNC_CODE_STORAGE_KEY);
}

export function saveSyncCodeToStorage(syncCode: string) {
  assertBrowser();
  window.localStorage.setItem(SYNC_CODE_STORAGE_KEY, syncCode);
}

export function generateSyncCode(length = 14) {
  const alphabet = "23456789abcdefghjkmnpqrstuvwxyz";
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}
