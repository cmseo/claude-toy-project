"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, Plus, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface TabConfig {
  href: string;
  label: string;
  Icon: typeof Star;
}

const TABS: readonly TabConfig[] = [
  { href: "/playbook", label: "플레이북", Icon: Star },
  { href: "/history", label: "히스토리", Icon: ClipboardList },
] as const;

export function TabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="주요 탐색"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background"
    >
      <div className="relative mx-auto flex h-16 max-w-md items-stretch justify-around">
        {TABS.map((tab) => {
          const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 text-xs",
                active ? "text-foreground" : "text-muted-foreground",
              )}
            >
              <tab.Icon className="size-5" aria-hidden />
              <span>{tab.label}</span>
            </Link>
          );
        })}
        <Link
          href="/add"
          aria-label="기록 추가"
          className="absolute -top-6 left-1/2 flex size-14 -translate-x-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"
        >
          <Plus className="size-6" aria-hidden />
        </Link>
      </div>
    </nav>
  );
}
