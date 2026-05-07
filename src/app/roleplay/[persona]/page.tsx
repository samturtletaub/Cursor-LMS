import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { RoleplayChat } from "@/components/app/roleplay-chat";
import { RoleplayHistoryButton } from "@/components/app/roleplay-history-button";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getPersona, listPersonas } from "@/lib/roleplay/personas";

interface PageProps {
  params: Promise<{ persona: string }>;
}

export async function generateStaticParams() {
  return listPersonas().map((p) => ({ persona: p.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { persona: personaId } = await params;
  const persona = getPersona(personaId);
  if (!persona) return { title: "Roleplay · Cursor LMS" };
  return {
    title: `${persona.name} · Roleplay · Cursor LMS`,
    description: `Practice discovery with ${persona.name}, ${persona.title}.`,
  };
}

export default async function RoleplaySessionPage({ params }: PageProps) {
  const { persona: personaId } = await params;
  const persona = getPersona(personaId);
  if (!persona) notFound();

  return (
    <div className="flex w-full flex-col gap-6">
      <div>
        <Link
          href="/roleplay"
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          <ArrowLeft className="size-3.5" />
          All personas
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <CardTitle className="text-lg">{persona.name}</CardTitle>
              <CardDescription className="font-mono text-[11px]">
                {persona.title} · {persona.company}
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{persona.archetype}</Badge>
              <RoleplayHistoryButton
                personaId={persona.id}
                personaName={persona.name}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">{persona.briefing}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <div className="mb-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                What they care about
              </div>
              <ul className="list-disc pl-5 text-sm text-foreground/90">
                {persona.kpis.map((k) => (
                  <li key={k}>{k}</li>
                ))}
              </ul>
            </div>
            <div>
              <div className="mb-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                Likely objections
              </div>
              <ul className="list-disc pl-5 text-sm text-foreground/90">
                {persona.objections.map((o) => (
                  <li key={o}>{o}</li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <RoleplayChat
        personaId={persona.id}
        personaName={persona.name}
        opener={persona.opener}
      />
    </div>
  );
}
