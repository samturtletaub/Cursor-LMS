export interface FeedbackBullet {
  label: string;
  body: string;
}

export function parseBullets(text: string): FeedbackBullet[] {
  const lines = text.split(/\r?\n/);
  const bullets: FeedbackBullet[] = [];
  let current: FeedbackBullet | null = null;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    const m = line.match(/^[-*]\s*\*\*(.+?)\*\*\s*[—\-:]\s*(.*)$/);
    if (m) {
      if (current) bullets.push(current);
      current = { label: m[1].trim(), body: m[2].trim() };
      continue;
    }
    const fallback = line.match(/^[-*]\s*(.+)$/);
    if (fallback) {
      if (current) bullets.push(current);
      current = { label: "", body: fallback[1].trim() };
      continue;
    }
    if (current) {
      current.body = `${current.body} ${line}`.trim();
    }
  }
  if (current) bullets.push(current);
  return bullets;
}
