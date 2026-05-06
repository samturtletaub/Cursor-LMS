import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";

import { getPersona } from "@/lib/roleplay/personas";
import {
  buildFeedbackPrompt,
  type FeedbackTranscriptTurn,
} from "@/lib/roleplay/system-prompt";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL_ID = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";

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

    return Response.json({ feedback: result.text });
  } catch (err) {
    console.error("[roleplay/feedback] generateText failed:", err);
    return Response.json(
      { error: "Failed to generate feedback. Try again." },
      { status: 500 },
    );
  }
}
