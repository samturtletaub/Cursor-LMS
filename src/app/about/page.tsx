import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function AboutPage() {
  return (
    <div className="w-full max-w-3xl">
      <section className="glass-panel rounded-2xl p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">Interview artifact</Badge>
          <Badge variant="secondary">Built in Cursor</Badge>
        </div>
        <h1 className="mt-4 font-heading text-4xl font-medium tracking-tight text-foreground sm:text-[44px] sm:leading-[1.16]">
          About this LMS
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          A self-paced enablement surface to ramp on Cursor—product, category,
          personas, competition, and enterprise sales motion—while demonstrating a
          bias to ship.
        </p>
      </section>

      <Separator className="my-10 bg-border/60" />

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Role context</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              This project is a portfolio artifact for a{" "}
              <Link
                className="text-[#b6d9fc] underline underline-offset-4 dark:text-[#b6d9fc]"
                href="https://cursor.com/careers"
                target="_blank"
                rel="noreferrer"
              >
                Cursor
              </Link>{" "}
              interview loop: technical curiosity (building in Cursor), enablement
              instinct (a real curriculum), and execution (deployed on Vercel).
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What’s inside</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <ul className="list-disc pl-5">
              <li>Six modules of long-form reading content</li>
              <li>Flashcards with spaced repetition (Leitner-style)</li>
              <li>Twenty-five-question quizzes with explanations and sources</li>
              <li>Progress that persists and syncs across devices</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Swap this placeholder for a real module screenshot when you want a
              literal capture for reviewers.
            </p>
            <div className="glass-card overflow-hidden rounded-2xl">
              <Image
                unoptimized
                src="/module-preview.svg"
                alt="Module preview placeholder"
                width={1200}
                height={630}
                className="h-auto w-full"
                priority
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How to use it</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Follow the loop: read → flashcards → quiz. A module completes when it’s
              marked read and the quiz is passed (≥ 80%).
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Link href="/" className={buttonVariants({ variant: "default", size: "lg" })}>
                Go to dashboard
              </Link>
              <Link
                href="/modules/1"
                className={buttonVariants({ variant: "outline", size: "lg" })}
              >
                Start Module 1
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
