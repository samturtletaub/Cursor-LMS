import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const quizDir = path.join(root, "content", "quizzes");
const flashDir = path.join(root, "content", "flashcards");

fs.mkdirSync(quizDir, { recursive: true });
fs.mkdirSync(flashDir, { recursive: true });

const modules = [
  {
    id: 1,
    topic: "SDLC & developer personas",
    stems: [
      "Which phase of the SDLC is most associated with validating change via automated checks?",
      "Which role is most likely to care about team throughput and sprint predictability?",
      "Which surface is typically the system of record for proposed code changes?",
      "A developer complaining about 'context switching' is most likely describing friction between:",
      "In many engineering orgs, who is frequently an economic buyer for strategic platform purchases?",
      "Which item is a common 'developer friction' theme relevant to AI coding tools?",
      "What is the primary purpose of a pull request in typical workflows?",
      "Which persona is most likely to ask about SSO, SCIM, and audit evidence first?",
      "Which buying pattern is common for developer tools?",
      "Which question is most diagnostic in discovery with an engineering leader?",
    ],
  },
  {
    id: 2,
    topic: "AI coding assistant category",
    stems: [
      "What does a larger effective context window most directly influence?",
      "MCP is best described as:",
      "An 'agentic' workflow most directly implies:",
      "Autocomplete differs from multi-file editing primarily because:",
      "Why do enterprises ask about model choice and governance?",
      "Which statement about retrieval-augmented workflows is most accurate?",
      "Which category shift creates new security conversations?",
      "What is a realistic buyer concern about autonomous changes?",
      "Which question tests whether 'AI' is being bought as a feature vs a workflow change?",
      "Which framing helps a seller sound credible with senior engineers?",
    ],
  },
  {
    id: 3,
    topic: "Cursor product",
    stems: [
      "Which Cursor surface maps best to exploratory questions while coding?",
      "Enterprise buyers frequently evaluate Cursor alongside questions about:",
      "A strong product demo story connects a feature to:",
      "Why do 'background' or agent-style workflows raise governance questions?",
      "Which proof point should be treated as a hypothesis until validated in-account?",
      "Bugbot is best positioned as:",
      "Which control helps organizations restrict integrations and tool access?",
      "When a buyer asks about Privacy Mode / data handling, the best response pattern is:",
      "Which mistake most often hurts credibility in front of a CTO?",
      "Which discovery question helps you map how Cursor would be adopted in a large eng org?",
    ],
  },
  {
    id: 4,
    topic: "Personas & buying centers",
    stems: [
      "A champion who talks about keyboard flow and PR cycle time is most likely:",
      "Security is most likely to raise concerns about:",
      "Procurement is most likely to focus on:",
      "A VP Engineering is most likely to optimize for:",
      "Which dynamic is common in dev-tool expansion motions?",
      "Which question helps uncover the real economic buyer?",
      "Which stakeholder is most likely to care about developer retention signals?",
      "Which trap should sellers avoid in multi-threaded deals?",
      "Which question helps you learn the customer's decision criteria early?",
      "Land-and-expand in dev tools often starts with:",
    ],
  },
  {
    id: 5,
    topic: "Competitive landscape",
    stems: [
      "When a buyer says 'We already have Copilot,' the best next step is:",
      "GitHub Copilot's strongest structural advantage in many accounts is:",
      "A credible competitive conversation should anchor in:",
      "Terminal-native agent workflows are most associated with which competitive theme?",
      "JetBrains AI is most likely to resonate when:",
      "Which question helps you identify whether a deal is real vs a checkbox exercise?",
      "Which behavior wins in strategic accounts?",
      "Which mistake makes a seller sound unprepared?",
      "Which item is a good 'landmine question' in competitive discovery?",
      "Positioning should be tested against:",
    ],
  },
  {
    id: 6,
    topic: "Enterprise sales motion",
    stems: [
      "A strong ROI narrative should begin with:",
      "In dev-tool ROI, which input is most often misunderstood or exaggerated?",
      "Which topic is commonly part of enterprise security review?",
      "MEDDPICC 'Metrics' in a Cursor deal might include:",
      "Land-and-expand becomes credible when:",
      "Which stakeholder pairing most often needs shared language?",
      "Procurement traps in AI tooling often include:",
      "Which behavior demonstrates strategic maturity?",
      "When you don't know a security fact, the best move is:",
      "An enterprise standardization story should end with:",
    ],
  },
];

function makeQuiz(module) {
  return module.stems.map((stem, idx) => {
    const options = [
      `Best: Tie ${module.topic} to workflow outcomes, governance, and proof—then validate in discovery.`,
      "Weak: Lead with generic AI hype and avoid specifics about review, security, and adoption.",
      "Misconception: Assume a single persona owns the entire decision in enterprise accounts.",
      "Irrelevant: Focus on discounts before you’ve anchored value and success metrics.",
    ];

    return {
      id: `m${module.id}-q${idx + 1}`,
      question: stem,
      options,
      correctIndex: 0,
      explanation:
        "Strong answers connect the idea to how engineering organizations buy, govern, and measure outcomes—not slogans.",
      sourceUrl: "https://cursor.com/docs",
    };
  });
}

function makeFlashcards(module) {
  const cards = [
    {
      front: `Define the headline goal of Module ${module.id} in one sentence.`,
      back: `Build sales-credible fluency on ${module.topic} without sounding like you memorized marketing copy.`,
    },
    {
      front: "What is the buyer really optimizing for in this module?",
      back: "Time-to-value, risk reduction, governance, and measurable engineering outcomes—phrased in their KPI language.",
    },
    {
      front: "Name one discovery question you’d ask a VP Engineering after this module.",
      back: "Ask how multi-file changes are reviewed, measured, and governed as usage scales.",
    },
    {
      front: "What is a common mistake sellers make here?",
      back: "Feature dumping instead of mapping to workflow, proof, and procurement reality.",
    },
    {
      front: "What proof should you prepare before a second meeting?",
      back: "Security artifacts directionally, evaluation design, and success metrics tied to their stack.",
    },
    {
      front: "What should you verify externally before quoting compliance claims?",
      back: "Primary trust/security documentation and the customer’s own requirements—not rumors.",
    },
    {
      front: "What is the ‘next step’ after learning this module?",
      back: "Flashcards until fast recall, then quiz until you can explain wrong answers cleanly.",
    },
    {
      front: "How does this module connect to MEDDPICC?",
      back: "It helps you identify metrics, stakeholders, criteria, and paper process risks specific to dev tools.",
    },
    {
      front: "What is a strong ‘translation’ skill for this topic?",
      back: "Turn engineering jargon into business risk and business questions into engineering workflows.",
    },
    {
      front: "What is one sign you truly understand the material?",
      back: "You can teach it briefly using examples from a realistic enterprise account.",
    },
    {
      front: "What is the capstone behavior this LMS is training?",
      back: "Run credible discovery and multi-threading without losing technical precision.",
    },
    {
      front: "What should you do if information goes stale?",
      back: "Update sources and re-check primary docs—especially fast-moving product facts.",
    },
  ];

  return cards.map((c, i) => ({
    id: `m${module.id}-c${i + 1}`,
    front: c.front,
    back: c.back,
    sourceUrl: "https://cursor.com/docs",
  }));
}

for (const m of modules) {
  fs.writeFileSync(
    path.join(quizDir, `module-${m.id}.json`),
    `${JSON.stringify(makeQuiz(m), null, 2)}\n`,
  );
  fs.writeFileSync(
    path.join(flashDir, `module-${m.id}.json`),
    `${JSON.stringify(makeFlashcards(m), null, 2)}\n`,
  );
}

console.log("Wrote quiz + flashcard JSON for modules 1–6.");
