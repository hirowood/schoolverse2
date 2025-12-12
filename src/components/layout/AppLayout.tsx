"use client";

import Link from "next/link";
import { ReactNode, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { MAIN_NAV_ITEMS } from "@/config/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import { MobileNavBar } from "./MobileNavBar";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--panel)] text-[var(--foreground)]">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--panel)] px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-semibold text-[var(--foreground)] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md lg:hidden"
            aria-expanded={mobileOpen}
            aria-controls="global-nav-drawer"
          >
            <span className="relative block h-4 w-5">
              <span
                className={`absolute left-0 h-0.5 w-full bg-[var(--foreground)] transition-all duration-200 ${
                  mobileOpen ? "top-2 rotate-45" : "top-0"
                }`}
              />
              <span
                className={`absolute left-0 h-0.5 w-full bg-[var(--foreground)] transition-all duration-200 ${
                  mobileOpen ? "top-2 opacity-0" : "top-[7px]"
                }`}
              />
              <span
                className={`absolute left-0 h-0.5 w-full bg-[var(--foreground)] transition-all duration-200 ${
                  mobileOpen ? "top-2 -rotate-45" : "top-3.5"
                }`}
              />
            </span>
            <span className="text-sm font-bold tracking-tight">メニュー</span>
          </button>
          <span className="text-xl font-semibold tracking-tight">schoolverse2</span>
          <span className="hidden text-xs text-[var(--muted)] sm:inline">
            AIと学習者がともに成長するコーチ
          </span>
        </div>
        <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
          <ThemeToggle />
          {status === "authenticated" && session?.user ? (
            <>
              <div className="flex flex-col items-end text-right">
                <span className="text-sm font-medium leading-tight">
                  {session.user.name ?? session.user.email ?? "ゲスト"}
                </span>
                {session.user.email && (
                  <span className="text-[11px] text-[var(--muted)] leading-tight">{session.user.email}</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                className="shrink-0 rounded-md border border-[var(--border)] px-3 py-1 text-sm text-[var(--foreground)] transition-colors hover:bg-white/80"
              >
                サインアウト
              </button>
            </>
          ) : (
            <Link
              href="/auth/signin"
              className="shrink-0 rounded-md bg-slate-900 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
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
                className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? "bg-slate-900 text-white"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                }`}
                aria-current={isActive(item.href) ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-4 pb-28 sm:p-6 lg:p-10 lg:pb-10">{children}</main>
      </div>

      {/* モバイル用ドロワーメニュー */}
      <div
        id="global-nav-drawer"
        className={`fixed inset-0 z-30 lg:hidden transition-opacity duration-200 ${
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/25 backdrop-blur-[1px]"
          onClick={() => setMobileOpen(false)}
        />
        <div
          className={`absolute left-0 top-0 h-full w-72 max-w-[80vw] border-r border-[var(--border)] bg-white/95 px-4 py-6 shadow-2xl transition-transform duration-300 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <nav className="space-y-2">
            {MAIN_NAV_ITEMS.map((item, idx) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`block rounded-md px-3 py-3 text-sm font-semibold transition-all duration-200 ${
                  isActive(item.href)
                    ? "bg-slate-900 text-white shadow-md"
                    : "text-slate-700 hover:translate-x-1 hover:bg-slate-100"
                }`}
                style={{ transitionDelay: `${idx * 30}ms` }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <MobileNavBar />
    </div>
  );
}
