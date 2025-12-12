"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MAIN_NAV_ITEMS } from "@/config/navigation";

type IconKey = "home" | "flag" | "chat" | "cube" | "user";

const ICONS: Record<IconKey, (active?: boolean) => JSX.Element> = {
  home: (active) => (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke={active ? "currentColor" : "currentColor"}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 10.5 12 4l9 6.5" />
      <path d="M6 9.5v8.5h12V9.5" />
    </svg>
  ),
  flag: (active) => (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke={active ? "currentColor" : "currentColor"}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 4v16" />
      <path d="M5 5h9l-1.5 3 1.5 3H5" />
    </svg>
  ),
  chat: (active) => (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke={active ? "currentColor" : "currentColor"}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12c0 4-4 7-9 7-1.1 0-2.1-.1-3.1-.4L4 20l1.5-3C4.5 15.7 4 14 4 12c0-4 4-7 9-7s8 3 8 7Z" />
      <path d="M12 12h0" />
      <path d="M16 12h0" />
      <path d="M8 12h0" />
    </svg>
  ),
  cube: (active) => (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke={active ? "currentColor" : "currentColor"}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3 4 7v10l8 4 8-4V7Z" />
      <path d="M4 7 12 11l8-4" />
      <path d="M12 11v10" />
    </svg>
  ),
  user: (active) => (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke={active ? "currentColor" : "currentColor"}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  ),
};

const MOBILE_LINKS: Array<{ href: string; fallbackLabel: string; icon: IconKey }> = [
  { href: "/dashboard", fallbackLabel: "ダッシュボード", icon: "home" },
  { href: "/quests", fallbackLabel: "クエスト", icon: "flag" },
  { href: "/coach", fallbackLabel: "コーチ", icon: "chat" },
  { href: "/virtual-classroom", fallbackLabel: "教室", icon: "cube" },
  { href: "/profile", fallbackLabel: "マイ", icon: "user" },
];

export function MobileNavBar() {
  const pathname = usePathname();

  const navItems = MOBILE_LINKS.map((item) => {
    const fromConfig = MAIN_NAV_ITEMS.find((nav) => nav.href === item.href);
    return { ...item, label: fromConfig?.label ?? item.fallbackLabel };
  });

  return (
    <nav
      aria-label="モバイルナビゲーション"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-white/95 shadow-[0_-10px_30px_-18px_rgba(0,0,0,0.35)] backdrop-blur lg:hidden"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 8px)" }}
    >
      <div className="mx-auto flex max-w-4xl items-end justify-around gap-1 px-3 pt-2 pb-2.5">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`group flex flex-1 flex-col items-center rounded-2xl px-2 py-1.5 text-[11px] font-semibold transition ${
                active ? "text-slate-900" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-xl border text-slate-900 shadow-sm transition ${
                  active ? "border-slate-900 bg-slate-900/10" : "border-slate-200 bg-white group-hover:border-slate-300"
                }`}
              >
                {ICONS[item.icon](active)}
              </span>
              <span className="mt-1 leading-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
