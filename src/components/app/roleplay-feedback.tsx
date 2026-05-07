"use client";

import { Loader2, Sparkles } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { parseBullets } from "@/lib/roleplay/parse-bullets";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading: boolean;
  feedback: string | null;
  personaName: string;
}

export function RoleplayFeedback({
  open,
  onOpenChange,
  loading,
  feedback,
  personaName,
}: Props) {
  const bullets = feedback ? parseBullets(feedback) : [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[min(100vw,28rem)] overflow-y-auto"
      >
        <SheetHeader className="border-b border-border/60">
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="size-4 opacity-80" />
            Coach recap
          </SheetTitle>
          <SheetDescription>
            Five-bullet feedback on your call with {personaName}.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 px-4 pb-6">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Analyzing transcript…
            </div>
          ) : bullets.length > 0 ? (
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
          ) : feedback ? (
            <div className="text-sm whitespace-pre-wrap text-foreground/90">
              {feedback}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No feedback yet.</div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
