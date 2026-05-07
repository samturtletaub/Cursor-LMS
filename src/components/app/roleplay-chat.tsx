"use client";

import * as React from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Loader2, RotateCcw, Send, Square, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { RoleplayFeedback } from "@/components/app/roleplay-feedback";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useProgress } from "@/components/providers/progress-provider";
import { useRoleplayHistory } from "@/components/providers/roleplay-history-provider";
import type { WeaknessSignal } from "@/lib/coach/types";
import type { RoleplayMessage } from "@/lib/roleplay/history-types";
import { cn } from "@/lib/utils";

function messageText(m: UIMessage): string {
  return m.parts
    .map((p) => (p.type === "text" ? p.text : ""))
    .join("")
    .trim();
}

function uiMessagesToRoleplay(messages: UIMessage[]): RoleplayMessage[] {
  const now = new Date().toISOString();
  return messages
    .map((m) => {
      const text = messageText(m);
      if (!text) return null;
      const role: RoleplayMessage["role"] =
        m.role === "user" ? "user" : "assistant";
      return { role, text, at: now };
    })
    .filter((m): m is RoleplayMessage => m !== null);
}

interface Props {
  personaId: string;
  personaName: string;
  opener: string;
}

export function RoleplayChat({ personaId, personaName, opener }: Props) {
  const [input, setInput] = React.useState("");
  const [feedback, setFeedback] = React.useState<string | null>(null);
  const [feedbackOpen, setFeedbackOpen] = React.useState(false);
  const [feedbackLoading, setFeedbackLoading] = React.useState(false);
  const scrollerRef = React.useRef<HTMLDivElement | null>(null);

  const { upsertSession, finalizeSession } = useRoleplayHistory();
  const { recordWeaknessSignals } = useProgress();
  const sessionIdRef = React.useRef<string | null>(null);
  const sessionStartedAtRef = React.useRef<string | null>(null);

  const { messages, sendMessage, status, stop, setMessages, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/roleplay/chat",
      body: { personaId },
    }),
    onError: (err) => {
      toast.error("Chat error", {
        description: err.message || "Something went wrong.",
      });
    },
  });

  React.useEffect(() => {
    if (error) {
      console.error("[roleplay] chat error:", error);
    }
  }, [error]);

  React.useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, status]);

  const isStreaming = status === "submitted" || status === "streaming";

  React.useEffect(() => {
    if (isStreaming) return;

    const transcript = uiMessagesToRoleplay(messages);
    const hasUserTurn = transcript.some((m) => m.role === "user");
    if (!hasUserTurn) return;

    if (!sessionIdRef.current) {
      sessionIdRef.current =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      sessionStartedAtRef.current = new Date().toISOString();
    }

    upsertSession({
      id: sessionIdRef.current,
      personaId,
      personaName,
      startedAt: sessionStartedAtRef.current ?? new Date().toISOString(),
      messages: transcript,
    });
  }, [messages, isStreaming, personaId, personaName, upsertSession]);

  const onSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = input.trim();
    if (!text || isStreaming) return;
    sendMessage({ text });
    setInput("");
  };

  const onReset = () => {
    if (isStreaming) stop();
    setMessages([]);
    setFeedback(null);
    sessionIdRef.current = null;
    sessionStartedAtRef.current = null;
  };

  const onEndAndScore = async () => {
    const transcript = messages
      .map((m) => ({
        role: m.role === "user" ? ("user" as const) : ("assistant" as const),
        text: messageText(m),
      }))
      .filter((t) => t.text.length > 0);

    if (transcript.length === 0) {
      toast.info("Nothing to score yet — send at least one message.");
      return;
    }

    setFeedbackLoading(true);
    setFeedbackOpen(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/roleplay/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ personaId, transcript }),
      });
      const data = (await res.json()) as {
        feedback?: string;
        signals?: WeaknessSignal[];
        error?: string;
      };
      if (!res.ok || !data.feedback) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      setFeedback(data.feedback);

      const signals = Array.isArray(data.signals) ? data.signals : [];

      if (sessionIdRef.current) {
        finalizeSession(sessionIdRef.current, {
          feedback: data.feedback,
          endedAt: new Date().toISOString(),
          signals,
        });
        if (signals.length > 0) {
          recordWeaknessSignals(sessionIdRef.current, signals);
          toast.success("Coach updated", {
            description: `Logged ${signals.length} weak area${signals.length === 1 ? "" : "s"} for your next study block.`,
          });
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error("Couldn't generate feedback", { description: msg });
      setFeedbackOpen(false);
    } finally {
      setFeedbackLoading(false);
    }
  };

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="size-4 opacity-80" />
                Live session
              </CardTitle>
              <CardDescription>
                Free-form chat. Stay in role; the buyer will too.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onEndAndScore}
                disabled={isStreaming || feedbackLoading || messages.length === 0}
              >
                {feedbackLoading ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : null}
                End & get feedback
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onReset}
                disabled={messages.length === 0 && !isStreaming}
              >
                <RotateCcw className="size-3.5" />
                Reset
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <div
            ref={scrollerRef}
            className="flex max-h-[60vh] min-h-[280px] flex-col gap-3 overflow-y-auto rounded-xl border border-border/60 bg-muted/20 p-4"
          >
            <div className="flex">
              <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-background px-4 py-2.5 text-sm shadow-sm ring-1 ring-border/70">
                <div className="mb-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                  {personaName} · Opener
                </div>
                <div className="whitespace-pre-wrap text-foreground/90">{opener}</div>
              </div>
            </div>

            {messages.map((m) => {
              const text = messageText(m);
              if (!text) return null;
              const isUser = m.role === "user";
              return (
                <div
                  key={m.id}
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
                    {text}
                  </div>
                </div>
              );
            })}

            {status === "submitted" ? (
              <div className="flex">
                <div className="rounded-2xl rounded-tl-sm bg-background px-4 py-2.5 text-sm text-muted-foreground shadow-sm ring-1 ring-border/70">
                  <Loader2 className="inline size-3.5 animate-spin" />{" "}
                  {personaName} is thinking…
                </div>
              </div>
            ) : null}
          </div>

          <form onSubmit={onSend} className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSend();
                }
              }}
              placeholder={`Reply to ${personaName}…  (Enter to send, Shift+Enter for newline)`}
              rows={2}
              disabled={isStreaming}
              className="flex-1"
            />
            <div className="flex gap-2">
              {isStreaming ? (
                <Button type="button" variant="outline" onClick={() => stop()}>
                  <Square className="size-3.5" />
                  Stop
                </Button>
              ) : (
                <Button type="submit" disabled={!input.trim()}>
                  <Send className="size-3.5" />
                  Send
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <RoleplayFeedback
        open={feedbackOpen}
        onOpenChange={setFeedbackOpen}
        loading={feedbackLoading}
        feedback={feedback}
        personaName={personaName}
      />
    </>
  );
}
