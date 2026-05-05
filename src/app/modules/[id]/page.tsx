import Link from "next/link";
import { notFound } from "next/navigation";

import { MarkReadButton } from "@/components/app/mark-read-button";
import { ModuleToc, ModuleTocMobile } from "@/components/app/module-toc";
import { ModuleVisitTracker } from "@/components/app/module-visit-tracker";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { loadModuleMdx } from "@/lib/content/load-module";
import { isModuleId, MODULE_SUMMARIES } from "@/lib/content/modules-registry";
import { MODULE_IDS } from "@/lib/content/types";

export function generateStaticParams() {
  return MODULE_IDS.map((id) => ({ id }));
}

export default async function ModulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isModuleId(id)) notFound();

  const summary = MODULE_SUMMARIES[id];
  const { frontmatter, toc, readTimeText, mdxContent } = await loadModuleMdx(id);

  const nextId = String(Number(id) + 1);
  const hasNext = Number(id) < 6;

  return (
    <div className="w-full">
      <ModuleVisitTracker moduleId={id} />

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">Module {id}</Badge>
          <Badge variant="secondary">Last reviewed: {frontmatter.lastReviewed}</Badge>
          <Badge variant="secondary">{readTimeText}</Badge>
        </div>
        <h1 className="font-heading text-3xl font-medium tracking-tight text-balance text-foreground sm:text-4xl lg:text-[44px] lg:leading-[1.16]">
          {summary.title}
        </h1>
        {frontmatter.description ? (
          <p className="max-w-3xl text-lg text-muted-foreground">
            {frontmatter.description}
          </p>
        ) : null}
      </div>

      <Separator className="my-8 bg-border/60" />

      <div className="glass-panel mb-8 rounded-2xl p-5 sm:p-6">
        <div className="text-sm font-medium text-foreground">Learning objectives</div>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          {frontmatter.objectives.map((o) => (
            <li key={o}>{o}</li>
          ))}
        </ul>
      </div>

      <div className="mb-8">
        <ModuleTocMobile items={toc} />
      </div>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
        <article className="min-w-0">
          <div className="prose prose-lg prose-midnight max-w-none dark:prose-invert">
            {mdxContent}
          </div>

          <Separator className="my-10 bg-border/60" />

          <div className="flex flex-col gap-4">
            <MarkReadButton moduleId={id} />
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <Link
                className={buttonVariants({ variant: "secondary", size: "sm" })}
                href={`/modules/${id}/flashcards`}
              >
                Flashcards
              </Link>
              <Link
                className={buttonVariants({ variant: "secondary", size: "sm" })}
                href={`/modules/${id}/quiz`}
              >
                Quiz
              </Link>
              {hasNext ? (
                <Link
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                  href={`/modules/${nextId}`}
                >
                  Next module
                </Link>
              ) : (
                <Link
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                  href="/"
                >
                  Back to dashboard
                </Link>
              )}
            </div>
          </div>
        </article>

        <aside className="hidden lg:block">
          <div className="glass-card sticky top-8 rounded-2xl p-4 backdrop-blur-md">
            <ModuleToc items={toc} />
          </div>
        </aside>
      </div>
    </div>
  );
}
