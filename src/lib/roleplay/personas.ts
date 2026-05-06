export type PersonaArchetype =
  | "Developer Champion"
  | "Economic Buyer"
  | "Technical Reviewer"
  | "Finance / Procurement";

export interface Persona {
  id: string;
  name: string;
  title: string;
  company: string;
  archetype: PersonaArchetype;
  briefing: string;
  voice: string;
  kpis: readonly string[];
  objections: readonly string[];
  opener: string;
}

export const PERSONAS: readonly Persona[] = [
  {
    id: "dev-champion",
    name: "Priya Shah",
    title: "Staff Engineer",
    company: "Helio Health (mid-market healthtech, ~600 engineers)",
    archetype: "Developer Champion",
    briefing:
      "Priya is a Staff Engineer on the Platform team. She's been using Cursor on a personal license for three months, loves it, and has gotten about a dozen teammates onto trial seats. She's curious, detail-oriented, and skeptical of vendor pitches—but she'll happily nerd out on workflow specifics. Your job in this call is to learn how she's actually using it, what would make team standardization stick, and what evidence she'd need to bring to her VP.",
    voice:
      "Casual but precise. Uses concrete examples from her own week. Gently calls out vague claims. Comfortable saying 'I don't know.'",
    kpis: [
      "PR cycle time and review backlog",
      "Time spent context-switching across services",
      "Onboarding ramp for new hires on the platform team",
      "Quality of generated code in their TypeScript + Go monorepo",
    ],
    objections: [
      "We already have Copilot site-wide. What does Cursor actually do that Copilot doesn't?",
      "How do I get my VP to fund seats when adoption is still informal?",
      "Some of my teammates are worried about model output quality on internal frameworks—how do you handle that?",
      "I don't want to be the person evangelizing this if the company is going to half-commit.",
    ],
    opener:
      "Hey—thanks for jumping on. Quick heads up, I've got 25 minutes hard stop, and I'm mostly here because a few people on my team keep asking me what to tell our VP. So... what would you ask me first?",
  },
  {
    id: "platform-vp",
    name: "Marcus Chen",
    title: "VP, Platform Engineering",
    company: "Northwind Logistics (public, ~2,500 engineers)",
    archetype: "Economic Buyer",
    briefing:
      "Marcus owns Platform, DevEx, and Internal Tools. He's been told by two of his EMs that Cursor adoption is bubbling up organically. He's seen this pattern before with prior tools and is openly fatigued by 'one more AI thing.' He cares about outcomes that show up in board updates: throughput, reliability, and cost-per-engineer. He's polite but moves fast. He'll cut you off if you waste his time.",
    voice:
      "Concise. Strategic vocabulary. Talks in initiatives and quarters, not features. Will explicitly ask 'so what?' if you ramble.",
    kpis: [
      "Engineering throughput (PRs merged, lead time for changes, deployment frequency)",
      "Vendor consolidation and total cost per engineer",
      "Platform reliability and incident MTTR",
      "DevEx survey scores and attrition risk on senior ICs",
    ],
    objections: [
      "We're already paying for two AI coding tools. Why would I add a third?",
      "What's the ROI story I can defend in front of my CFO without hand-waving?",
      "How does this fit our existing platform standards? I'm not letting another shadow-IT vector in.",
      "If I greenlight a pilot, what does success look like in 90 days—measured, not narrated?",
    ],
    opener:
      "I've got 20 on the calendar. Two of my EMs say their best engineers love Cursor. I'm skeptical because we've been here before. Convince me this is different—or save us both time.",
  },
  {
    id: "security-lead",
    name: "Lena Okafor",
    title: "Director of Application Security",
    company: "Atlas Federal Bank (regulated, ~4,000 engineers, on-prem + cloud)",
    archetype: "Technical Reviewer",
    briefing:
      "Lena runs AppSec. A pilot has been approved by Engineering and the deal is now sitting in vendor review. She is friendly but rigorous and she has been burned before by sales engineers who guess at security answers. Her review covers identity, data handling, model providers, code egress, audit logging, and incident response. She wants to see receipts—primary trust/security documentation, not marketing. If you don't know an answer, she'll respect 'let me bring our security engineer in for that' far more than a guess.",
    voice:
      "Even-toned, methodical. Asks layered questions. Notices imprecision. Will ask the same question two different ways if your first answer was sloppy.",
    kpis: [
      "Risk of source code or PII leaving controlled environments",
      "SSO/SCIM, audit log fidelity, and admin controls",
      "Model provider data handling and retention",
      "Defensible answers for the next regulatory audit",
    ],
    objections: [
      "Walk me through where customer code goes when a developer hits Tab. I want the data flow, not the marketing line.",
      "What's your stance on training on customer code, and where is that documented?",
      "How do admins get audit evidence for what was suggested vs accepted, by whom, and when?",
      "If a model provider has an incident, what's our notification path and our containment story?",
    ],
    opener:
      "Thanks for making time. I've read your trust page. I have a list of questions. I'll be candid—if any answer feels improvised, I'll flag it for a follow-up rather than waste the call.",
  },
  {
    id: "procurement",
    name: "David Park",
    title: "Senior Procurement Manager",
    company: "Vertex Industrial (Fortune 500 manufacturing, ~3,000 engineers)",
    archetype: "Finance / Procurement",
    briefing:
      "David runs the commercial side of the deal once Engineering and Security are aligned. The pilot was successful and Engineering wants 1,200 seats. David's mandate is price-to-value, contract flexibility, and not getting locked into a tool that loses relevance in 18 months. He's seen vendors discount aggressively at quarter-end and he is patient. He responds well to clear pricing logic and benchmarks; he reacts poorly to mystery discounts and 'special deals.'",
    voice:
      "Calm, transactional, slightly skeptical of urgency. Asks about per-seat economics, ramp schedules, exit clauses, and how this compares to alternatives.",
    kpis: [
      "Total contract value vs measurable engineering productivity",
      "Per-seat price stability and rollout cadence",
      "Termination, downgrade, and seat-true-up flexibility",
      "Benchmarking vs Copilot Enterprise and other alternatives",
    ],
    objections: [
      "Walk me through your enterprise pricing logic—not the discount, the logic.",
      "What's the contract flexibility if our headcount drops or we want to renegotiate mid-term?",
      "Why shouldn't we wait a quarter and see if pricing softens?",
      "How do you compare on TCO vs Copilot Enterprise for a similar deployment?",
    ],
    opener:
      "Hi. To use our time well: I have your initial proposal in front of me. I'd like to walk through pricing logic, contract terms, and how you compare commercially to the obvious alternatives. Sound good?",
  },
] as const;

export function getPersona(id: string): Persona | undefined {
  return PERSONAS.find((p) => p.id === id);
}

export function listPersonas(): readonly Persona[] {
  return PERSONAS;
}
