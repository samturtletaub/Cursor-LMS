import fs from "node:fs/promises";
import path from "node:path";

import matter from "gray-matter";
import readingTime from "reading-time";
import { compileMDX } from "next-mdx-remote/rsc";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

import { mdxComponents } from "@/components/mdx/mdx-components";
import { extractToc } from "@/lib/content/toc";
import type { ModuleFrontmatter } from "@/lib/content/types";

export async function loadModuleMdx(moduleId: string) {
  const filePath = path.join(
    process.cwd(),
    "content",
    "modules",
    `module-${moduleId}.mdx`,
  );

  const raw = await fs.readFile(filePath, "utf8");
  const { content, data } = matter(raw);
  const frontmatter = data as ModuleFrontmatter;

  const toc = extractToc(content);
  const stats = readingTime(content);

  const { content: mdxContent } = await compileMDX({
    source: content,
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeSlug],
      },
    },
    components: mdxComponents,
  });

  return {
    frontmatter,
    toc,
    readTimeText: stats.text,
    mdxContent,
  };
}
