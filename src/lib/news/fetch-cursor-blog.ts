import * as cheerio from "cheerio";

import type { NewsCategory, NewsItem } from "./types";

const BLOG_URL = "https://cursor.com/blog";
const REVALIDATE_SECONDS = 1800;

function absUrl(href: string | undefined): string | null {
  if (!href) return null;
  if (href.startsWith("http://") || href.startsWith("https://")) return href;
  if (href.startsWith("/")) return `https://cursor.com${href}`;
  return null;
}

function slugFromUrl(url: string): string {
  try {
    const u = new URL(url);
    const tail = u.pathname.replace(/\/$/, "").split("/").pop() ?? url;
    return `${u.hostname}:${tail}`;
  } catch {
    return url;
  }
}

function pickReadingTime(text: string): string | undefined {
  // Reading time on directory rows is rendered as e.g. "11m" or "10m" twice
  // (xl + responsive fallback). Last match suffices.
  const matches = text.match(/\b(\d+m)\b/g);
  return matches ? matches[matches.length - 1] : undefined;
}

function dedupeById(items: NewsItem[]): NewsItem[] {
  const seen = new Set<string>();
  const out: NewsItem[] = [];
  for (const item of items) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    out.push(item);
  }
  return out;
}

function sortByDateDesc(items: NewsItem[]): NewsItem[] {
  return [...items].sort((a, b) => {
    const da = Date.parse(a.publishedAt);
    const db = Date.parse(b.publishedAt);
    if (Number.isNaN(da) && Number.isNaN(db)) return 0;
    if (Number.isNaN(da)) return 1;
    if (Number.isNaN(db)) return -1;
    return db - da;
  });
}

function parse(html: string): NewsItem[] {
  const $ = cheerio.load(html);
  const items: NewsItem[] = [];

  const sectionFor = (heading: string) =>
    $("h2")
      .filter((_, h) => $(h).text().trim() === heading)
      .first()
      .parent();

  // Parse customer stories first so their URLs win over the same posts that
  // also appear in the recent blog list.
  const customerUrls = new Set<string>();
  sectionFor("Customer stories")
    .find('a[href^="/blog/"]')
    .each((_, el) => {
      const a = $(el);
      const url = absUrl(a.attr("href"));
      if (!url) return;
      // Skip "View all stories" CTA pointing to /blog/topic/customers.
      if (url.includes("/blog/topic/")) return;
      const time = a.find("time").first();
      const dateTime = time.attr("datetime") ?? time.attr("dateTime");
      const title = a.find("p").first().text().trim();
      if (!title || !dateTime) return;
      if (customerUrls.has(url)) return;
      customerUrls.add(url);
      items.push({
        id: slugFromUrl(url),
        title,
        url,
        publishedAt: dateTime,
        category: "customers",
        external: false,
      });
    });

  $("a.blog-directory__row").each((_, el) => {
    const a = $(el);
    const url = absUrl(a.attr("href"));
    if (!url) return;
    if (customerUrls.has(url)) return;
    const time = a.find("time").first();
    const dateTime = time.attr("datetime") ?? time.attr("dateTime");
    const title = a.find("p").first().text().trim();
    const topic = a.find("span.capitalize").first().text().trim() || undefined;
    const author = a.find("span.text-theme-text-mid").first().text().trim() || undefined;
    if (!title || !dateTime) return;
    items.push({
      id: slugFromUrl(url),
      title,
      url,
      publishedAt: dateTime,
      category: "blog",
      topic,
      author,
      readingTime: pickReadingTime(a.text()),
      external: false,
    });
  });

  sectionFor("Press")
    .find('a[target="_blank"]')
    .each((_, el) => {
      const a = $(el);
      const url = absUrl(a.attr("href"));
      if (!url) return;
      const time = a.find("time").first();
      const dateTime = time.attr("datetime") ?? time.attr("dateTime");
      const title = a.find("p").first().text().trim();
      if (!title || !dateTime) return;
      let source: string | undefined;
      try {
        source = new URL(url).hostname.replace(/^www\./, "");
      } catch {
        source = undefined;
      }
      items.push({
        id: slugFromUrl(url),
        title,
        url,
        publishedAt: dateTime,
        category: "press",
        source,
        external: true,
      });
    });

  return sortByDateDesc(dedupeById(items));
}

export async function fetchCursorNews(): Promise<NewsItem[]> {
  try {
    const res = await fetch(BLOG_URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; CursorLMS/1.0; +https://cursor.com)",
        Accept: "text/html,application/xhtml+xml",
      },
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) {
      console.error(
        `[fetchCursorNews] non-OK response from ${BLOG_URL}: ${res.status}`,
      );
      return [];
    }
    const html = await res.text();
    return parse(html);
  } catch (err) {
    console.error("[fetchCursorNews] failed to fetch/parse Cursor blog:", err);
    return [];
  }
}

export function groupByCategory(
  items: NewsItem[],
): Record<NewsCategory, NewsItem[]> {
  const out: Record<NewsCategory, NewsItem[]> = {
    blog: [],
    customers: [],
    press: [],
  };
  for (const item of items) {
    out[item.category].push(item);
  }
  return out;
}
