import Link from "next/link";

import type { TocItem } from "@/lib/content/types";
import { cn } from "@/lib/utils";

export function ModuleToc({ items }: { items: TocItem[] }) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="On this page" className="text-sm">
      <div className="mb-3 font-medium text-foreground">On this page</div>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={`${item.level}-${item.slug}`}>
            <Link
              href={`#${item.slug}`}
              className={cn(
                "block text-muted-foreground hover:text-foreground",
                item.level === 3 && "pl-3",
              )}
            >
              {item.text}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function ModuleTocMobile({ items }: { items: TocItem[] }) {
  if (items.length === 0) return null;

  return (
    <details className="lg:hidden">
      <summary className="cursor-pointer text-sm font-medium">
        On this page
      </summary>
      <div className="glass-card mt-3 rounded-2xl p-3 backdrop-blur-md">
        <ModuleToc items={items} />
      </div>
    </details>
  );
}
