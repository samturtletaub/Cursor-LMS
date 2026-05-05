import GitHubSlugger from "github-slugger";

import type { TocItem } from "./types";

function stripCodeFences(markdown: string) {
  return markdown.replace(/```[\s\S]*?```/g, "");
}

export function extractToc(markdown: string): TocItem[] {
  const slugger = new GitHubSlugger();
  const cleaned = stripCodeFences(markdown);
  const items: TocItem[] = [];

  for (const rawLine of cleaned.split("\n")) {
    const line = rawLine.trim();
    const match = /^(#{2,3})\s+(.+?)\s*$/.exec(line);
    if (!match) continue;

    const level = match[1].length === 2 ? 2 : 3;
    const text = match[2].replace(/\s+#+\s*$/, "").trim();
    if (!text) continue;

    const slug = slugger.slug(text);
    items.push({ level: level as 2 | 3, text, slug });
  }

  return items;
}
