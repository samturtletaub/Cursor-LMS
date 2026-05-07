"use client";

import * as React from "react";
import { History, MessagesSquare, Sparkles } from "lucide-react";

import { useRoleplayHistory } from "@/components/providers/roleplay-history-provider";
import { RoleplayHistorySheet } from "@/components/app/roleplay-history-sheet";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const PREVIEW_LIMIT = 5;

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

export function RoleplayHistoryPanel() {
  const { ready, sessions } = useRoleplayHistory();
  const [open, setOpen] = React.useState(false);
  const [initialId, setInitialId] = React.useState<string | null>(null);

  const preview = sessions.slice(0, PREVIEW_LIMIT);

  return (
    <>
      <Card className="ring-1 ring-border/60">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <CardTitle className="flex items-center gap-2 text-base">
                <History className="size-4 opacity-80" />
                Recent sessions
              </CardTitle>
              <CardDescription>
                Your last few roleplay calls. Synced via your sync code.
              </CardDescription>
            </div>
            {sessions.length > 0 ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setInitialId(null);
                  setOpen(true);
                }}
              >
                View all
              </Button>
            ) : null}
          </div>
        </CardHeader>
        <CardContent>
          {!ready ? (
            <div className="text-sm text-muted-foreground">
              Loading history…
            </div>
          ) : preview.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/70 px-4 py-8 text-center text-sm text-muted-foreground">
              <MessagesSquare className="mx-auto mb-2 size-5 opacity-60" />
              No saved sessions yet. Pick a persona above to start a call —
              transcripts save automatically.
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {preview.map((s) => {
                const turns = s.messages.filter(
                  (m) => m.role === "user",
                ).length;
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setInitialId(s.id);
                        setOpen(true);
                      }}
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
          )}
        </CardContent>
      </Card>

      <RoleplayHistorySheet
        open={open}
        onOpenChange={setOpen}
        initialSessionId={initialId}
      />
    </>
  );
}
