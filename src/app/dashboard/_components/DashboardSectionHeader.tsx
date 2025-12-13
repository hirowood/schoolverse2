"use client";

import Link from "next/link";
import { buttonClassName } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

/**
 * DashboardSectionHeader
 *
 * よくある「ラベル + タイトル + 説明 + 右上アクション」を共通化。
 * モバイルでの視線誘導（上→下）を優先し、タップ領域は大きめにしています。
 */

export interface DashboardSectionHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  action?: { href: string; label: string };
  icon?: React.ReactNode;
}

export function DashboardSectionHeader({ eyebrow, title, description, action, icon }: DashboardSectionHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          {eyebrow}
        </p>
        <div className="mt-1 flex items-center gap-2">
          {icon ? <span className="text-xl">{icon}</span> : null}
          <h2 className="truncate text-xl font-bold text-slate-900">{title}</h2>
        </div>
        {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
      </div>

      {action ? (
        <Link
          href={action.href}
          className={cn(
            buttonClassName({ variant: "outline", rounded: "full", size: "tapXs" }),
            "whitespace-nowrap",
          )}
        >
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}

