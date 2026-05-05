import type { Metadata } from "next";

import { NewsFeed } from "@/components/app/news-feed";
import { fetchCursorNews } from "@/lib/news/fetch-cursor-blog";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "News · Cursor LMS",
  description:
    "Latest from Cursor: blog posts, customer stories, and press coverage.",
};

export default async function NewsPage() {
  const items = await fetchCursorNews();

  return (
    <div className="flex w-full flex-col gap-8">
      <section className="glass-panel rounded-2xl p-6 sm:p-8">
        <div className="space-y-3">
          <h1 className="font-heading text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            Latest from Cursor
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
            Blog posts, customer stories, and press coverage pulled directly
            from{" "}
            <a
              href="https://cursor.com/blog"
              target="_blank"
              rel="noreferrer"
              className="text-[#b6d9fc] underline underline-offset-4"
            >
              cursor.com/blog
            </a>
            . Refreshed every 30 minutes.
          </p>
        </div>
      </section>

      <NewsFeed items={items} />
    </div>
  );
}
