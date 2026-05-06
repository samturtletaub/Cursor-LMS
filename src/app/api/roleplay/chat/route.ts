import { anthropic } from "@ai-sdk/anthropic";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

import { getPersona } from "@/lib/roleplay/personas";
import { buildSystemPrompt } from "@/lib/roleplay/system-prompt";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL_ID = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({
        error:
          "ANTHROPIC_API_KEY is not set. Add it to .env.local to run roleplay sessions.",
      }),
      { status: 503, headers: { "content-type": "application/json" } },
    );
  }

  let body: { messages?: UIMessage[]; personaId?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body." }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const { messages, personaId } = body;
  const persona = personaId ? getPersona(personaId) : undefined;
  if (!persona) {
    return new Response(
      JSON.stringify({ error: `Unknown personaId: ${String(personaId)}` }),
      { status: 400, headers: { "content-type": "application/json" } },
    );
  }
  if (!messages || !Array.isArray(messages)) {
    return new Response(JSON.stringify({ error: "Missing messages array." }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const result = streamText({
    model: anthropic(MODEL_ID),
    system: buildSystemPrompt(persona),
    messages: await convertToModelMessages(messages),
    temperature: 0.8,
  });

  return result.toUIMessageStreamResponse();
}
