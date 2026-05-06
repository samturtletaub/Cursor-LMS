import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MessagesSquare } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { listPersonas } from "@/lib/roleplay/personas";

export const metadata: Metadata = {
  title: "Roleplay · Cursor LMS",
  description:
    "Practice discovery and objection handling with AI personas grounded in Module 4.",
};

export default function RoleplayIndexPage() {
  const personas = listPersonas();
  const apiKeyMissing = !process.env.ANTHROPIC_API_KEY;

  return (
    <div className="flex w-full flex-col gap-8">
      <section className="glass-panel rounded-2xl p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">
            <MessagesSquare className="size-3" /> AI roleplay
          </Badge>
          <Badge variant="secondary">Module 4 personas</Badge>
        </div>
        <h1 className="mt-4 font-heading text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
          Practice the call
        </h1>
        <p className="mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Pick a buyer and run a free-form discovery conversation. The persona
          will push back the way a real one would. End the session for a
          five-bullet coach recap.
        </p>
      </section>

      {apiKeyMissing ? (
        <Card className="border-amber-300/40">
          <CardHeader>
            <CardTitle>Set ANTHROPIC_API_KEY to start</CardTitle>
            <CardDescription>
              Add{" "}
              <code className="font-mono text-xs">ANTHROPIC_API_KEY</code> to{" "}
              <code className="font-mono text-xs">.env.local</code> and restart
              the dev server. Sessions stream via Anthropic Claude.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2">
        {personas.map((p) => (
          <Card key={p.id} className="ring-1 ring-border/60">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <CardTitle className="text-base">{p.name}</CardTitle>
                  <CardDescription className="font-mono text-[11px]">
                    {p.title} · {p.company}
                  </CardDescription>
                </div>
                <Badge variant="secondary">{p.archetype}</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground line-clamp-4">
                {p.briefing}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {p.kpis.slice(0, 2).map((k) => (
                  <Badge key={k} variant="outline" className="font-normal">
                    {k}
                  </Badge>
                ))}
              </div>
              <div className="flex justify-end">
                <Link
                  href={`/roleplay/${p.id}`}
                  className={buttonVariants({ variant: "default", size: "sm" })}
                >
                  Start session
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
