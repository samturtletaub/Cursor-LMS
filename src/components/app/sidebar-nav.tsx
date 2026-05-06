"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  CheckCircle2,
  Circle,
  LayoutDashboard,
  MessagesSquare,
  Newspaper,
  Sparkles,
} from "lucide-react";

import { SyncPanel } from "@/components/app/sync-panel";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { Separator } from "@/components/ui/separator";
import { useProgress } from "@/components/providers/progress-provider";
import { getAllModuleSummaries } from "@/lib/content/modules-registry";
import { isModuleComplete } from "@/lib/progress/state";
import { cn } from "@/lib/utils";

function NavLink({
  href,
  active,
  onNavigate,
  children,
}: {
  href: string;
  active: boolean;
  onNavigate?: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-muted/70 text-foreground shadow-[inset_0_0_0_1px_rgba(15,18,32,0.10)] dark:bg-white/[0.08] dark:shadow-[inset_0_0_0_1px_rgba(186,215,247,0.14)]"
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
      )}
    >
      {children}
    </Link>
  );
}

export function SidebarNav({
  onNavigate,
  className,
}: {
  onNavigate?: () => void;
  className?: string;
}) {
  const pathname = usePathname();
  const { ready, state, passThreshold } = useProgress();
  const modules = getAllModuleSummaries();

  return (
    <div className={cn("flex h-full flex-col gap-6", className)}>
      <div className="flex items-start justify-between gap-2">
        <Link
          href="/"
          onClick={onNavigate}
          className="group flex flex-col gap-0.5 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground">
            <span className="inline-flex size-8 items-center justify-center rounded-full bg-primary/15 ring-1 ring-white/10">
              <Sparkles className="size-4 text-primary" />
            </span>
            Cursor LMS
          </div>
          <div className="pl-10 text-xs text-muted-foreground">
            Sales enablement ramp
          </div>
        </Link>
        <ThemeToggle />
      </div>

      <nav className="flex flex-col gap-1">
        <div className="px-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          Overview
        </div>
        <NavLink
          href="/"
          active={pathname === "/"}
          onNavigate={onNavigate}
        >
          <LayoutDashboard className="size-4 opacity-80" />
          Dashboard
        </NavLink>
        <NavLink
          href="/news"
          active={pathname.startsWith("/news")}
          onNavigate={onNavigate}
        >
          <Newspaper className="size-4 opacity-80" />
          News
        </NavLink>
        <NavLink
          href="/roleplay"
          active={pathname.startsWith("/roleplay")}
          onNavigate={onNavigate}
        >
          <MessagesSquare className="size-4 opacity-80" />
          Roleplay
        </NavLink>
        <NavLink
          href="/about"
          active={pathname.startsWith("/about")}
          onNavigate={onNavigate}
        >
          <BookOpen className="size-4 opacity-80" />
          About
        </NavLink>
      </nav>

      <Separator className="bg-border/60" />

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto pr-1">
        <div className="px-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          Modules
        </div>
        {!ready ? (
          <div className="px-3 py-2 text-xs text-muted-foreground">Loading…</div>
        ) : (
          modules.map((m) => {
            const href = `/modules/${m.id}`;
            const active =
              pathname === href ||
              pathname.startsWith(`${href}/`);
            const done = isModuleComplete(state.modules[m.id], passThreshold);

            return (
              <NavLink
                key={m.id}
                href={href}
                active={active}
                onNavigate={onNavigate}
              >
                {done ? (
                  <CheckCircle2 className="size-4 text-primary" />
                ) : (
                  <Circle className="size-4 opacity-50" />
                )}
                <span className="min-w-0 truncate">
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {m.id}.
                  </span>{" "}
                  {m.title}
                </span>
              </NavLink>
            );
          })
        )}
      </nav>

      <Separator className="bg-border/60" />

      <div className="space-y-2">
        <div className="px-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          Sync
        </div>
        <SyncPanel className="w-full" />
      </div>
    </div>
  );
}
