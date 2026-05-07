import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";

import { normalizeHistoryState } from "@/lib/roleplay/history-storage";
import type { RoleplayHistoryState } from "@/lib/roleplay/history-types";
import { isValidSyncCode } from "@/lib/sync/sync-code";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { syncCode?: string };
    const syncCode = String(body.syncCode ?? "")
      .trim()
      .toLowerCase();

    if (!isValidSyncCode(syncCode)) {
      return NextResponse.json(
        { ok: false, error: "Invalid sync code" },
        { status: 400 },
      );
    }

    const key = `roleplay:${syncCode}`;
    const raw = await kv.get<string>(key);
    if (!raw) {
      return NextResponse.json({ ok: true, state: null });
    }

    const parsed = (typeof raw === "string"
      ? JSON.parse(raw)
      : raw) as RoleplayHistoryState;
    return NextResponse.json({ ok: true, state: normalizeHistoryState(parsed) });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Sync unavailable" },
      { status: 503 },
    );
  }
}
