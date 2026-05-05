"use client";

import { ArrowUpRight, Newspaper } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import type { NewsItem } from "@/lib/news/types";

function formatDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function NewsRow({ item }: { item: NewsItem }) {
  const meta: string[] = [];
  if (item.author) meta.push(item.author);
  if (item.readingTime) meta.push(item.readingTime);
  if (item.source) meta.push(`Read on ${item.source}`);

  return (
    <li>
      <a
        href={item.url}
        target={item.external ? "_blank" : "_self"}
        rel={item.external ? "noopener noreferrer" : undefined}
        className="group flex flex-col gap-2 rounded-xl px-4 py-4 ring-1 ring-transparent transition-colors hover:bg-muted/40 hover:ring-border/60 sm:flex-row sm:items-start sm:gap-4 sm:py-3"
      >
        <div className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground sm:w-44 sm:pt-0.5">
          <time dateTime={item.publishedAt} className="font-mono text-[11px]">
            {formatDate(item.publishedAt)}
          </time>
          {item.topic ? (
            <Badge variant="secondary" className="capitalize">
              {item.topic}
            </Badge>
          ) : null}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex min-w-0 items-start gap-2">
            <span className="min-w-0 text-sm font-medium text-foreground group-hover:text-primary">
              {item.title}
            </span>
            {item.external ? (
              <ArrowUpRight className="mt-0.5 size-3.5 shrink-0 text-muted-foreground group-hover:text-primary" />
            ) : null}
          </div>
          {meta.length > 0 ? (
            <div className="text-xs text-muted-foreground">
              {meta.join(" · ")}
            </div>
          ) : null}
        </div>
      </a>
    </li>
  );
}

function NewsList({ items }: { items: NewsItem[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/70 px-6 py-10 text-center text-sm text-muted-foreground">
        Nothing here yet. Try again in a few minutes, or{" "}
        <a
          href="https://cursor.com/blog"
          target="_blank"
          rel="noreferrer"
          className="text-[#b6d9fc] underline underline-offset-4"
        >
          view cursor.com/blog
        </a>
        .
      </div>
    );
  }
  return (
    <ul className="flex flex-col gap-1">
      {items.map((item) => (
        <NewsRow key={`${item.category}-${item.id}`} item={item} />
      ))}
    </ul>
  );
}

export function NewsFeed({ items }: { items: NewsItem[] }) {
  const blog = items.filter((i) => i.category === "blog");
  const customers = items.filter((i) => i.category === "customers");
  const press = items.filter((i) => i.category === "press");

  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="size-4 opacity-80" />
            Cursor news
          </CardTitle>
          <CardDescription>
            We couldn’t reach the Cursor blog right now. Check back shortly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NewsList items={[]} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Newspaper className="size-4 opacity-80" />
          Cursor news
        </CardTitle>
        <CardDescription>
          {blog.length} blog · {customers.length} customer · {press.length} press
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="gap-4">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="blog">Blog</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="press">Press</TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <NewsList items={items} />
          </TabsContent>
          <TabsContent value="blog">
            <NewsList items={blog} />
          </TabsContent>
          <TabsContent value="customers">
            <NewsList items={customers} />
          </TabsContent>
          <TabsContent value="press">
            <NewsList items={press} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
