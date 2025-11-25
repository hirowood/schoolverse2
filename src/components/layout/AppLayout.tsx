// src/components/layout/AppLayout.tsx
"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { MAIN_NAV_ITEMS } from "@/config/navigation";

type AppLayoutProps = {
  children: ReactNode;
};

// アプリ全体のレイアウト
// - ヘッダー: ブランドとアクション
// - サイドバー: 主要ページへのナビ
// - メイン: 子ページのコンテンツ
export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-3">
          <span className="text-xl font-semibold tracking-tight">schoolhouse2</span>
          <span className="text-xs text-slate-500">
            AI学習コーチとクレド実践のハブ
          </span>
        </div>
        <div className="flex items-center gap-3">
          {status === "authenticated" && session?.user ? (
            <>
              <div className="flex flex-col text-right">
                <span className="text-sm font-medium leading-tight">
                  {session.user.name ?? session.user.email ?? "ゲスト"}
                </span>
                {session.user.email && (
                  <span className="text-[11px] text-slate-500 leading-tight">
                    {session.user.email}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                className="rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-700 transition-colors hover:bg-slate-50"
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
        <aside className="w-64 border-r border-slate-200 bg-white/60 backdrop-blur-sm">
          <nav className="p-4 space-y-2">
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

        <main className="flex-1 bg-white p-6">{children}</main>
      </div>
    </div>
  );
}
