"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useProgress } from "@/components/providers/progress-provider";
import { isValidSyncCode } from "@/lib/sync/sync-code";
import { cn } from "@/lib/utils";

export function SyncPanel({ className }: { className?: string }) {
  const { syncCode, setSyncCode, pullRemote, pushRemote } = useProgress();
  const [draft, setDraft] = useState("");

  const display = useMemo(() => syncCode ?? "", [syncCode]);

  const onCopy = async () => {
    if (!display) return;
    try {
      await navigator.clipboard.writeText(display);
      toast.success("Sync code copied");
    } catch {
      toast.error("Could not copy");
    }
  };

  const onApply = async () => {
    const normalized = draft.trim().toLowerCase().replace(/\s+/g, "");
    if (!isValidSyncCode(normalized)) {
      toast.error("Sync code format looks invalid");
      return;
    }

    setSyncCode(normalized);
    await pullRemote(normalized);
    toast.success("Applied sync code and pulled latest progress");
    setDraft("");
  };

  return (
    <Card className={cn("w-full max-w-none", className)}>
      <CardHeader>
        <CardTitle className="text-base">Sync</CardTitle>
        <CardDescription>
          Copy this code to another device, then paste it there to pull your progress.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "flex-1 truncate rounded-md border bg-muted/20 px-3 py-2 font-mono text-xs",
            )}
            title={display}
          >
            {display || "—"}
          </div>
          <Button type="button" variant="secondary" onClick={onCopy} disabled={!display}>
            Copy
          </Button>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">
            Enter code from another device
          </div>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="paste sync code"
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={onApply} variant="default">
              Apply + pull
            </Button>
            <Button type="button" onClick={() => void pushRemote()} variant="outline">
              Push now
            </Button>
            <Button type="button" onClick={() => void pullRemote()} variant="outline">
              Pull now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
