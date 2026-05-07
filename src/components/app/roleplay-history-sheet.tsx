"use client";

import * as React from "react";
import { ArrowLeft, History, MessagesSquare, Sparkles } from "lucide-react";

import { useRoleplayHistory } from "@/components/providers/roleplay-history-provider";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { parseBullets } from "@/lib/roleplay/parse-bullets";
import type { RoleplaySession } from "@/lib/roleplay/history-types";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personaId?: string;
  personaName?: string;
  initialSessionId?: string | null;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function userTurnCount(session: RoleplaySession) {
  return session.messages.filter((m) => m.role === "user").length;
}

export function RoleplayHistorySheet({
  open,
  onOpenChange,
  personaId,
  personaName,
  initialSessionId,
}: Props) {
  const { sessions } = useRoleplayHistory();
  const [selectedId, setSelectedId] = React.useState<string | null>(
    initialSessionId ?? null,
  );

  React.useEffect(() => {
    if (open) {
      setSelectedId(initialSessionId ?? null);
    }
  }, [open, initialSessionId]);

  const visible = React.useMemo(() => {
    return personaId
      ? sessions.filter((s) => s.personaId === personaId)
      : sessions;
  }, [sessions, personaId]);

  const selected = React.useMemo(
    () => (selectedId ? visible.find((s) => s.id === selectedId) : null),
    [selectedId, visible],
  );

  const headingTitle = personaName
    ? `Past sessions with ${personaName}`
    : "Past roleplay sessions";

  const headingDescription = personaName
    ? `Read-only history of your earlier calls with ${personaName}.`
    : "Read-only history of your earlier roleplay calls.";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[min(100vw,32rem)] overflow-y-auto"
      >
        <SheetHeader className="border-b border-border/60">
          <SheetTitle className="flex items-center gap-2">
            <History className="size-4 opacity-80" />
            {selected ? "Session transcript" : headingTitle}
          </SheetTitle>
          <SheetDescription>
            {selected
              ? `${selected.personaName} · ${formatDate(selected.startedAt)}`
              : headingDescription}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 px-4 pb-6">
          {selected ? (
            <SessionDetail
              session={selected}
              onBack={() => setSelectedId(null)}
            />
          ) : (
            <SessionList
              sessions={visible}
              onSelect={(id) => setSelectedId(id)}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function SessionList({
  sessions,
  onSelect,
}: {
  sessions: RoleplaySession[];
  onSelect: (id: string) => void;
}) {
  if (sessions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/70 px-4 py-10 text-center text-sm text-muted-foreground">
        <MessagesSquare className="mx-auto mb-2 size-5 opacity-60" />
        No saved sessions yet. Start a roleplay and your history will show up
        here automatically.
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {sessions.map((s) => {
        const turns = userTurnCount(s);
        return (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => onSelect(s.id)}
              className="w-full rounded-xl border border-border/60 bg-muted/20 p-3 text-left text-sm transition-colors hover:bg-muted/30"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium text-foreground">
                    {s.personaName}
                  </div>
                  <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                    {formatDate(s.startedAt)}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1 text-[11px] text-muted-foreground">
                  <span className="font-mono">
                    {turns} {turns === 1 ? "turn" : "turns"}
                  </span>
                  {s.feedback ? (
                    <span className="inline-flex items-center gap-1 text-foreground/80">
                      <Sparkles className="size-3" />
                      Coach recap
                    </span>
                  ) : null}
                </div>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function SessionDetail({
  session,
  onBack,
}: {
  session: RoleplaySession;
  onBack: () => void;
}) {
  const bullets = session.feedback ? parseBullets(session.feedback) : [];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="-ml-2"
        >
          <ArrowLeft className="size-3.5" />
          All sessions
        </Button>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-muted/15 p-3">
        {session.messages.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No messages were captured in this session.
          </div>
        ) : (
          session.messages.map((m, i) => {
            const isUser = m.role === "user";
            return (
              <div
                key={i}
                className={cn("flex", isUser ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm whitespace-pre-wrap",
                    isUser
                      ? "rounded-tr-sm bg-primary text-primary-foreground"
                      : "rounded-tl-sm bg-background ring-1 ring-border/70 text-foreground/90",
                  )}
                >
                  {m.text}
                </div>
              </div>
            );
          })
        )}
      </div>

      {session.feedback ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Sparkles className="size-3.5 opacity-80" />
            Coach recap
          </div>
          {bullets.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {bullets.map((b, i) => (
                <li
                  key={i}
                  className="rounded-xl border border-border/60 bg-muted/30 p-3 text-sm"
                >
                  {b.label ? (
                    <div className="mb-1 font-medium text-foreground">
                      {b.label}
                    </div>
                  ) : null}
                  <div className="text-foreground/85">{b.body}</div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm whitespace-pre-wrap text-foreground/90">
              {session.feedback}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
