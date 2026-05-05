import Link from "next/link";
import { notFound } from "next/navigation";

import { QuizRunner } from "@/components/app/quiz-runner";
import { buttonVariants } from "@/components/ui/button";
import { loadQuiz } from "@/lib/content/load-quiz";
import { isModuleId, MODULE_SUMMARIES } from "@/lib/content/modules-registry";
import { MODULE_IDS } from "@/lib/content/types";

export function generateStaticParams() {
  return MODULE_IDS.map((id) => ({ id }));
}

export default async function ModuleQuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isModuleId(id)) notFound();

  const summary = MODULE_SUMMARIES[id];
  const questions = await loadQuiz(id);

  return (
    <div className="w-full max-w-3xl">
      <div className="mb-8 flex flex-col gap-3">
        <div className="font-mono text-xs text-muted-foreground">Module {id}</div>
        <h1 className="font-heading text-3xl font-medium tracking-tight text-foreground">
          Quiz: {summary.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          Ten questions. Pass threshold is 80%. Option order randomizes each attempt.
        </p>
        <Link
          className={buttonVariants({ variant: "outline", size: "sm" })}
          href={`/modules/${id}`}
        >
          Back to module
        </Link>
      </div>

      <QuizRunner moduleId={id} questions={questions} />
    </div>
  );
}
