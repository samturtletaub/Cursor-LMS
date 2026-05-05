import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

function Callout({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "my-6 rounded-xl border bg-muted/40 px-4 py-3 text-sm leading-relaxed",
      )}
    >
      {title ? (
        <div className="mb-2 font-medium text-foreground">{title}</div>
      ) : null}
      <div className="text-muted-foreground">{children}</div>
    </div>
  );
}

function KeyTakeaway({ children }: { children: ReactNode }) {
  return (
    <div className="my-6 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm leading-relaxed">
      <div className="mb-2 font-medium text-foreground">Key takeaway</div>
      <div className="text-muted-foreground">{children}</div>
    </div>
  );
}

export const mdxComponents = {
  Callout,
  KeyTakeaway,
};
