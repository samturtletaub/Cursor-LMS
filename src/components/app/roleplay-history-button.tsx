"use client";

import * as React from "react";
import { History } from "lucide-react";

import { useRoleplayHistory } from "@/components/providers/roleplay-history-provider";
import { RoleplayHistorySheet } from "@/components/app/roleplay-history-sheet";
import { Button } from "@/components/ui/button";

interface Props {
  personaId: string;
  personaName: string;
}

export function RoleplayHistoryButton({ personaId, personaName }: Props) {
  const { sessions } = useRoleplayHistory();
  const [open, setOpen] = React.useState(false);

  const count = React.useMemo(
    () => sessions.filter((s) => s.personaId === personaId).length,
    [sessions, personaId],
  );

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        disabled={count === 0}
        title={
          count === 0
            ? "No past sessions with this persona yet"
            : `${count} past session${count === 1 ? "" : "s"}`
        }
      >
        <History className="size-3.5" />
        Past sessions{count > 0 ? ` (${count})` : ""}
      </Button>

      <RoleplayHistorySheet
        open={open}
        onOpenChange={setOpen}
        personaId={personaId}
        personaName={personaName}
      />
    </>
  );
}
