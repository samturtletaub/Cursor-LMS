import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";

import { normalizeHistoryState } from "@/lib/roleplay/history-storage";
import type { RoleplayHistoryState } from "@/lib/roleplay/history-types";
import { isValidSyncCode } from "@/lib/sync/sync-code";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      syncCode?: string;
      state?: RoleplayHistoryState;
    };

    const syncCode = String(body.syncCode ?? "")
      .trim()
      .toLowerCase();
    if (!isValidSyncCode(syncCode)) {
      return NextResponse.json(
        { ok: false, error: "Invalid sync code" },
        { status: 400 },
      );
    }

    const incoming = normalizeHistoryState(body.state ?? null);
    const key = `roleplay:${syncCode}`;

    const existingRaw = await kv.get<string>(key);
    if (existingRaw) {
      const existingParsed = (
        typeof existingRaw === "string"
          ? JSON.parse(existingRaw)
          : existingRaw
      ) as RoleplayHistoryState;
      const existing = normalizeHistoryState(existingParsed);

      if (existing.updatedAt > incoming.updatedAt) {
        return NextResponse.json({
          ok: true,
          conflict: true,
          state: existing,
        });
      }
    }

    await kv.set(key, JSON.stringify(incoming));
    return NextResponse.json({ ok: true, conflict: false });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Sync unavailable" },
      { status: 503 },
    );
  }
}
