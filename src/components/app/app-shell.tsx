"use client";

import * as React from "react";
import { Menu } from "lucide-react";

import { SidebarNav } from "@/components/app/sidebar-nav";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <div className="flex min-h-dvh w-full">
      <aside className="sticky top-0 hidden h-dvh w-72 shrink-0 flex-col border-r border-border/80 bg-sidebar md:flex">
        <div className="flex h-full flex-col p-4">
          <SidebarNav />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-border/80 bg-background/80 px-4 backdrop-blur md:hidden">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold tracking-tight">
              Cursor LMS
            </div>
            <div className="truncate text-[11px] text-muted-foreground">
              Command center
            </div>
          </div>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="size-4" />
            </Button>
            <SheetContent side="left" className="w-[min(100vw,20rem)] p-0">
              <SheetHeader className="border-b border-border/60 p-4 text-left">
                <SheetTitle className="font-heading">Navigate</SheetTitle>
              </SheetHeader>
              <div className="p-4">
                <SidebarNav onNavigate={() => setMobileOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
        </header>

        <div className="midnight-backdrop flex-1">
          <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
