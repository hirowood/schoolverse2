"use client";

import Link from "next/link";
import { cardClassName } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

interface QuickLink {
  href: string;
  label: string;
  icon: string;
}

const LINKS: QuickLink[] = [
  { href: "/coach", label: "Coach", icon: "CO" },
  { href: "/notes", label: "Note", icon: "NT" },
  { href: "/user-chat", label: "Chat", icon: "CH" },
  { href: "/mindmap", label: "Mind", icon: "MM" },
  { href: "/plan", label: "Plan", icon: "PL" },
  { href: "/learning-chat", label: "Learn", icon: "LR" },
  { href: "/curriculum-map", label: "Skill", icon: "SK" },
  { href: "/report", label: "Report", icon: "RP" },
];

export function QuickAccessGrid() {
  return (
    <section className={cardClassName({ radius: "2xl", className: "bg-white/90" })}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xl font-semibold text-slate-900">クイックアクセス</h3>
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Shortcuts</span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-4",
              "text-base font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:shadow-sm",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400",
            )}
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
              {link.icon}
            </span>
            <span className="text-center">{link.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

