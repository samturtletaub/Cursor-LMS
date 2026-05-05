import type { ModuleSummary } from "./types";
import { MODULE_IDS, type ModuleId } from "./types";

export const MODULE_SUMMARIES: Record<ModuleId, ModuleSummary> = {
  "1": {
    id: "1",
    slug: "module-1",
    title: "The SDLC & Developer Persona Foundations",
    description:
      "A plain-English mental model of how software is built, who builds it, and what slows teams down.",
  },
  "2": {
    id: "2",
    slug: "module-2",
    title: "AI Coding Assistants: The Category",
    description:
      "From autocomplete to agents: category definitions, context windows, models, and MCP.",
  },
  "3": {
    id: "3",
    slug: "module-3",
    title: "Cursor the Product",
    description:
      "Cursor surfaces, enterprise controls, and proof points—framed for sales conversations.",
  },
  "4": {
    id: "4",
    slug: "module-4",
    title: "Personas & Buying Centers",
    description:
      "Who shows up in enterprise dev-tool deals, what they care about, and how to run discovery.",
  },
  "5": {
    id: "5",
    slug: "module-5",
    title: "Competitive Landscape",
    description:
      "One-line positioning for major alternatives and how to handle the Copilot objection.",
  },
  "6": {
    id: "6",
    slug: "module-6",
    title: "Enterprise Sales Motion",
    description:
      "Land-and-expand, ROI framing, security conversations, and MEDDPICC applied to Cursor.",
  },
};

export function isModuleId(value: string): value is ModuleId {
  return (MODULE_IDS as readonly string[]).includes(value);
}

export function getAllModuleSummaries(): ModuleSummary[] {
  return MODULE_IDS.map((id) => MODULE_SUMMARIES[id]);
}
