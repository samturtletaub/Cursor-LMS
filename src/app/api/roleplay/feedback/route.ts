import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";

import { isConceptTag } from "@/lib/coach/concepts";
import type { Severity, WeaknessSignal } from "@/lib/coach/types";
import { getPersona } from "@/lib/roleplay/personas";
import {
  buildFeedbackPrompt,
  type FeedbackTranscriptTurn,
} from "@/lib/roleplay/system-prompt";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL_ID = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";
const SIGNALS_DELIMITER = /^={3,}\s*SIGNALS\s*={3,}\s*$/im;
const SEVERITIES: readonly Severity[] = ["low", "med", "high"];

function parseSignals(raw: string): {
  feedback: string;
  signals: WeaknessSignal[];
} {
  const match = raw.match(SIGNALS_DELIMITER);
  if (!match || match.index === undefined) {
    return { feedback: raw.trim(), signals: [] };
  }

  const feedback = raw.slice(0, match.index).trim();
  const tail = raw.slice(match.index + match[0].length).trim();

  const signals: WeaknessSignal[] = [];
  if (!tail) return { feedback, signals };

  const cleaned = tail
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "");
  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    const arr = cleaned.match(/\[[\s\S]*\]/);
    if (!arr) return { feedback, signals };
    try {
      parsed = JSON.parse(arr[0]);
    } catch {
      return { feedback, signals };
    }
  }

  if (!Array.isArray(parsed)) return { feedback, signals };

  for (const item of parsed) {
    if (!item || typeof item !== "object") continue;
    const obj = item as Record<string, unknown>;
    const conceptTag = typeof obj.conceptTag === "string" ? obj.conceptTag : "";
    const severity =
      typeof obj.severity === "string" ? (obj.severity as Severity) : "med";
    const evidence =
      typeof obj.evidence === "string" ? obj.evidence.slice(0, 240).trim() : "";

    if (!conceptTag || !isConceptTag(conceptTag)) continue;
    if (!SEVERITIES.includes(severity)) continue;

    signals.push({ conceptTag, severity, evidence });
    if (signals.length >= 4) break;
  }

  return { feedback, signals };
}

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      {
        error:
          "ANTHROPIC_API_KEY is not set. Add it to .env.local to run roleplay sessions.",
      },
      { status: 503 },
    );
  }

  let body: { personaId?: string; transcript?: FeedbackTranscriptTurn[] };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const persona = body.personaId ? getPersona(body.personaId) : undefined;
  if (!persona) {
    return Response.json(
      { error: `Unknown personaId: ${String(body.personaId)}` },
      { status: 400 },
    );
  }

  const transcript = Array.isArray(body.transcript) ? body.transcript : [];

  const { system, prompt } = buildFeedbackPrompt(persona, transcript);

  try {
    const result = await generateText({
      model: anthropic(MODEL_ID),
      system,
      prompt,
      temperature: 0.4,
    });

    const { feedback, signals } = parseSignals(result.text);

    return Response.json({ feedback, signals });
  } catch (err) {
    console.error("[roleplay/feedback] generateText failed:", err);
    return Response.json(
      { error: "Failed to generate feedback. Try again." },
      { status: 500 },
    );
  }
}
