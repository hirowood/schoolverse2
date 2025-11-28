"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { MAIN_NAV_ITEMS } from "@/config/navigation";
import ThemeToggle from "@/components/ThemeToggle";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--panel)] text-[var(--foreground)]">
      <header className="flex items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--panel)] px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="text-xl font-semibold tracking-tight">schoolhouse2</span>
          <span className="text-xs text-[var(--muted)]">AIコーチとの学習リズム</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {status === "authenticated" && session?.user ? (
            <>
              <div className="flex flex-col items-end text-right">
                <span className="text-sm font-medium leading-tight">
                  {session.user.name ?? session.user.email ?? "学習者"}
                </span>
                {session.user.email && (
                  <span className="text-[11px] text-[var(--muted)] leading-tight">
                    {session.user.email}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                className="rounded-md border border-[var(--border)] px-3 py-1 text-sm text-[var(--foreground)] transition-colors hover:bg-white/80"
              >
                サインアウト
              </button>
            </>
          ) : (
            <Link
              href="/auth/signin"
              className="rounded-md bg-slate-900 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
            >
              サインイン
            </Link>
          )}
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="hidden w-64 border-r border-[var(--border)] bg-white/80 p-4 backdrop-blur-sm lg:block">
          <nav className="space-y-2">
            {MAIN_NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={lock rounded-md px-3 py-2 text-sm font-medium transition-colors }
                aria-current={isActive(item.href) ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-6 pb-24 lg:p-10 lg:pb-0">{children}</main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-10 flex items-center justify-between gap-1 border-t border-[var(--border)] bg-white/90 px-3 py-2 shadow-inner lg:hidden">
        {MAIN_NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={lex-1 rounded-lg px-2 py-2 text-center text-[11px] font-semibold transition-colors }
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
