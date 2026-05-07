/**
 * One-shot Claude tagger.
 *
 * Walks every quiz JSON in content/quizzes/ and every flashcard JSON in
 * content/flashcards/, asks Claude to assign 1–3 conceptTags from the
 * controlled vocabulary defined alongside the coach loop, and writes
 * the tags back into the same JSON files.
 *
 * Run locally with:
 *   ANTHROPIC_API_KEY=... node scripts/tag-content.mjs
 *
 * Optional flags:
 *   --dry      Don't write files, just print proposed tags + diff summary
 *   --module N Only re-tag module-N (number 1..6)
 *   --kind quiz|flashcards  Only re-tag one kind
 *   --force    Re-tag entries that already have conceptTags
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const args = new Set(process.argv.slice(2));
const valueArg = (flag) => {
  const idx = process.argv.indexOf(flag);
  return idx >= 0 ? process.argv[idx + 1] : undefined;
};
const DRY = args.has("--dry");
const ONLY_MODULE = valueArg("--module");
const ONLY_KIND = valueArg("--kind");
const FORCE = args.has("--force");

if (!process.env.ANTHROPIC_API_KEY) {
  console.error(
    "ANTHROPIC_API_KEY is not set. Source .env.local or export it before running.",
  );
  process.exit(1);
}

const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";

// Vocabulary kept in sync with src/lib/coach/concepts.ts. We duplicate it here
// so this script can run as plain Node without TS tooling.
const CONCEPTS = {
  "m1.sdlc-phases": "SDLC loop and what each phase produces",
  "m1.persona-incentives": "Mapping role -> incentives -> objections",
  "m1.collaboration-stack": "IDE/PR/CI/chat/tickets surfaces",
  "m1.discovery-workflow-anchored": "Concrete workflow questions, not trivia",
  "m1.value-frame": "Less context switching, multi-file work",
  "m2.category-spectrum": "Autocomplete/chat/multi-file/agentic",
  "m2.context-and-retrieval": "Context window + retrieval realities",
  "m2.mcp-governance": "MCP as integration boundaries",
  "m2.workflow-vs-feature": "AI as workflow change, not feature",
  "m2.security-translation": "Data egress, exfiltration, policy gates",
  "m3.surface-to-workflow": "Each surface mapped to a workflow",
  "m3.enterprise-controls-vocab": "SSO/SCIM/model+MCP controls",
  "m3.trust-source-discipline": "Cite trust docs, never bluff",
  "m3.proof-as-hypothesis": "Marketing stats validated in-account",
  "m4.buying-committee-shape": "Common stakeholders and order",
  "m4.land-and-expand-stages": "Individual -> team -> enterprise",
  "m4.persona-language-fit": "EM vs VP vs CTO vs Security vocabulary",
  "m4.shared-language": "Surface definitional gaps early",
  "m5.competitive-posture": "Curious + specific, not tribal",
  "m5.copilot-objection": "Bundling objection handled with discovery",
  "m5.evaluation-vs-demo": "POC success criteria up front",
  "m5.battle-card-structure": "Trigger / landmines / proof",
  "m6.roi-structure": "Baseline / lever / range / risk-adjusted",
  "m6.meddpicc-fit": "Champion / EB / DC / paper process",
  "m6.security-conversation-discipline": "Specialist escalation, sourcing",
  "m6.deal-sequencing": "Which proof in which order to which persona",
  "cross.source-discipline": "Sourcing claims, not improvising",
  "cross.honest-uncertainty": "Saying 'I don't know' credibly",
  "cross.workflow-anchoring": "Anchor every claim to a workflow",
};
const CONCEPT_KEYS = new Set(Object.keys(CONCEPTS));

const SYSTEM_PROMPT = `You are tagging short sales-training assets with concept tags from a fixed vocabulary.

Rules:
- Return ONLY a JSON array of 1–3 strings, where each string is an exact key from the vocabulary.
- Prefer the most specific module-prefixed tags that match (m1..m6.*) over the cross-cutting ones.
- Use cross.* tags only when the asset is genuinely cross-module (e.g. about source discipline or honest uncertainty regardless of module).
- If no tag truly fits, return an empty array [].
- No prose, no markdown, no explanation — just the JSON array.

Vocabulary (key → meaning):
${Object.entries(CONCEPTS)
  .map(([k, v]) => `- ${k}: ${v}`)
  .join("\n")}`;

async function callClaude(userText) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 200,
      temperature: 0,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userText }],
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Claude HTTP ${res.status}: ${errText.slice(0, 400)}`);
  }

  const json = await res.json();
  const text = (json?.content ?? [])
    .filter((c) => c.type === "text")
    .map((c) => c.text)
    .join("\n")
    .trim();
  return text;
}

function parseTags(text) {
  if (!text) return [];
  let cleaned = text.trim();
  // strip ``` fences if present
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");
  // try direct JSON, otherwise grab the first [...] block
  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    const m = cleaned.match(/\[[\s\S]*\]/);
    if (!m) return [];
    try {
      parsed = JSON.parse(m[0]);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(parsed)) return [];
  const valid = [];
  for (const item of parsed) {
    if (typeof item !== "string") continue;
    if (!CONCEPT_KEYS.has(item)) continue;
    if (!valid.includes(item)) valid.push(item);
    if (valid.length >= 3) break;
  }
  return valid;
}

function describeQuiz(q) {
  return `Quiz question (id ${q.id}):
Question: ${q.question}
Correct answer: ${q.options[q.correctIndex]}
Explanation: ${q.explanation}`;
}

function describeFlashcard(c) {
  return `Flashcard (id ${c.id}):
Front: ${c.front}
Back: ${c.back}`;
}

async function tagFile({ kind, modId, filePath }) {
  const before = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  if (!Array.isArray(before)) {
    console.warn(`Skipping ${filePath}: not an array.`);
    return { changed: 0, total: 0 };
  }

  let changed = 0;
  let skipped = 0;
  const out = [];

  for (const entry of before) {
    if (
      Array.isArray(entry.conceptTags) &&
      entry.conceptTags.length > 0 &&
      !FORCE
    ) {
      out.push(entry);
      skipped += 1;
      continue;
    }

    const userText =
      kind === "quiz" ? describeQuiz(entry) : describeFlashcard(entry);

    let tags = [];
    let attempts = 0;
    while (attempts < 2) {
      try {
        const raw = await callClaude(userText);
        tags = parseTags(raw);
        break;
      } catch (err) {
        attempts += 1;
        if (attempts >= 2) {
          console.warn(`  ! ${entry.id}: ${err.message}`);
        } else {
          await new Promise((r) => setTimeout(r, 750));
        }
      }
    }

    const next = { ...entry };
    if (tags.length > 0) {
      next.conceptTags = tags;
      changed += 1;
    } else if (Array.isArray(next.conceptTags) && next.conceptTags.length === 0) {
      delete next.conceptTags;
    }
    console.log(`  ${entry.id} -> ${tags.length ? tags.join(", ") : "(no tag)"}`);
    out.push(next);
  }

  if (!DRY) {
    fs.writeFileSync(filePath, `${JSON.stringify(out, null, 2)}\n`);
  }
  console.log(
    `${kind} module-${modId}: ${changed} tagged, ${skipped} skipped (had tags), ${before.length} total${
      DRY ? "  (dry run, no write)" : ""
    }`,
  );
  return { changed, total: before.length };
}

function listTargets() {
  const targets = [];
  const kinds =
    ONLY_KIND === "quiz"
      ? ["quiz"]
      : ONLY_KIND === "flashcards"
        ? ["flashcards"]
        : ["quiz", "flashcards"];

  for (const kind of kinds) {
    const dir = path.join(
      root,
      "content",
      kind === "quiz" ? "quizzes" : "flashcards",
    );
    const files = fs
      .readdirSync(dir)
      .filter((f) => /^module-\d+\.json$/.test(f));
    for (const file of files) {
      const modId = file.match(/^module-(\d+)\.json$/)[1];
      if (ONLY_MODULE && String(ONLY_MODULE) !== modId) continue;
      targets.push({ kind, modId, filePath: path.join(dir, file) });
    }
  }
  targets.sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === "quiz" ? -1 : 1;
    return Number(a.modId) - Number(b.modId);
  });
  return targets;
}

async function main() {
  const targets = listTargets();
  if (targets.length === 0) {
    console.error("No content files matched.");
    process.exit(1);
  }

  console.log(
    `Tagging ${targets.length} file(s) with model ${MODEL}${
      DRY ? "  (dry run)" : ""
    }${FORCE ? "  (force re-tag)" : ""}.\n`,
  );

  let totalChanged = 0;
  let totalEntries = 0;
  for (const t of targets) {
    console.log(`-- ${t.kind} module-${t.modId} (${path.relative(root, t.filePath)}) --`);
    const { changed, total } = await tagFile(t);
    totalChanged += changed;
    totalEntries += total;
    console.log("");
  }

  console.log(
    `Done. Tagged ${totalChanged}/${totalEntries} entries across ${targets.length} files.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
