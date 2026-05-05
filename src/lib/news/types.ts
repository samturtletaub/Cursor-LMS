export type NewsCategory = "blog" | "customers" | "press";

export interface NewsItem {
  id: string;
  title: string;
  url: string;
  publishedAt: string;
  category: NewsCategory;
  topic?: string;
  author?: string;
  readingTime?: string;
  source?: string;
  external: boolean;
}
