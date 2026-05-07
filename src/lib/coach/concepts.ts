export const CONCEPTS = {
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
} as const;

export type ConceptTag = keyof typeof CONCEPTS;

export const CONCEPT_TAGS = Object.keys(CONCEPTS) as ConceptTag[];

export function isConceptTag(value: string): value is ConceptTag {
  return value in CONCEPTS;
}

export function conceptModuleId(tag: ConceptTag): string | null {
  const match = tag.match(/^m(\d+)\./);
  return match ? match[1] : null;
}

export function conceptLabel(tag: ConceptTag): string {
  return CONCEPTS[tag];
}

export const CONCEPT_TO_PERSONA: Partial<Record<ConceptTag, string>> = {
  "m1.discovery-workflow-anchored": "dev-champion",
  "m1.persona-incentives": "platform-vp",
  "m1.collaboration-stack": "dev-champion",
  "m1.value-frame": "platform-vp",

  "m2.category-spectrum": "dev-champion",
  "m2.context-and-retrieval": "dev-champion",
  "m2.mcp-governance": "security-lead",
  "m2.workflow-vs-feature": "platform-vp",
  "m2.security-translation": "security-lead",

  "m3.surface-to-workflow": "dev-champion",
  "m3.enterprise-controls-vocab": "security-lead",
  "m3.trust-source-discipline": "security-lead",
  "m3.proof-as-hypothesis": "platform-vp",

  "m4.buying-committee-shape": "platform-vp",
  "m4.land-and-expand-stages": "platform-vp",
  "m4.persona-language-fit": "platform-vp",
  "m4.shared-language": "platform-vp",

  "m5.competitive-posture": "platform-vp",
  "m5.copilot-objection": "platform-vp",
  "m5.evaluation-vs-demo": "platform-vp",
  "m5.battle-card-structure": "platform-vp",

  "m6.roi-structure": "procurement",
  "m6.meddpicc-fit": "platform-vp",
  "m6.security-conversation-discipline": "security-lead",
  "m6.deal-sequencing": "procurement",

  "cross.source-discipline": "security-lead",
  "cross.honest-uncertainty": "security-lead",
  "cross.workflow-anchoring": "dev-champion",
};

export const CONCEPT_FOCUS_PROMPT: Partial<Record<ConceptTag, string>> = {
  "m1.discovery-workflow-anchored":
    "Open with a workflow-anchored discovery question and stay there.",
  "m1.persona-incentives":
    "Speak to this buyer's specific incentives, not a generic pitch.",
  "m1.collaboration-stack":
    "Tie value to where work actually happens (IDE, PR, CI, chat, tickets).",
  "m1.value-frame":
    "Anchor every claim on less context switching across multi-file work.",

  "m2.category-spectrum":
    "Translate AI category words (autocomplete, chat, agent) into the buyer's workflow.",
  "m2.context-and-retrieval":
    "Talk about how the assistant finds the right slices of their repo.",
  "m2.mcp-governance":
    "Frame MCP as integration boundaries the enterprise controls.",
  "m2.workflow-vs-feature":
    "Probe whether they want AI as a feature or as a workflow change.",
  "m2.security-translation":
    "Translate AI category claims into security and data-handling terms.",

  "m3.surface-to-workflow":
    "Map each Cursor surface to a repeatable engineering workflow.",
  "m3.enterprise-controls-vocab":
    "Use SSO/SCIM/model and MCP controls vocabulary precisely.",
  "m3.trust-source-discipline":
    "Cite trust docs; never improvise a security commitment.",
  "m3.proof-as-hypothesis":
    "Treat marketing proof points as hypotheses to validate in-account.",

  "m4.buying-committee-shape":
    "Surface who else needs to be in the room and why.",
  "m4.land-and-expand-stages":
    "Place this account on the individual -> team -> enterprise arc.",
  "m4.persona-language-fit":
    "Speak in this persona's KPI language.",
  "m4.shared-language":
    "Force shared definitions when Security and Engineering use the same word differently.",

  "m5.competitive-posture":
    "Be curious and specific about competitors, never tribal.",
  "m5.copilot-objection":
    "Handle a 'we already have Copilot' objection with discovery, not dismissal.",
  "m5.evaluation-vs-demo":
    "Push toward in-repo evaluation with explicit success criteria.",
  "m5.battle-card-structure":
    "Use trigger / landmines / proof structure when competitors come up.",

  "m6.roi-structure":
    "Walk a clean baseline / lever / range / risk-adjusted ROI.",
  "m6.meddpicc-fit":
    "Map the deal to MEDDPICC without sounding like you read a checklist.",
  "m6.security-conversation-discipline":
    "Run the security conversation with sourcing and escalation discipline.",
  "m6.deal-sequencing":
    "Sequence proof per stakeholder so the deal moves without contradiction.",

  "cross.source-discipline":
    "Source every contestable claim or admit uncertainty.",
  "cross.honest-uncertainty":
    "Practice 'I don't know — let me confirm against the trust docs.'",
  "cross.workflow-anchoring":
    "Tie every value claim to a concrete workflow.",
};
