import { ReactNode } from "react";
import Link from "next/link";
import { MAIN_NAV_ITEMS } from "@/config/navigation";

type AppLayoutProps = {
  children: ReactNode;
};

// 画面全体を包むレイアウトコンポーネント
// - ヘッダ: アプリ名・説明
// - サイドバー: 主要な画面へのナビゲーション
// - メイン: ページごとのコンテンツ
export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* ヘッダ: ロゴと短い説明 */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-2">
          <span className="text-xl font-semibold tracking-tight">
            Schoolverse2
          </span>
          <span className="text-xs text-slate-500">
            AI学習コーチのための基盤
          </span>
        </div>
      </header>

      <div className="flex flex-1">
        {/* サイドバー: ナビゲーションメニュー */}
        <aside className="w-64 border-r border-slate-200 bg-white/60 backdrop-blur-sm">
          <nav className="p-4 space-y-2">
            {MAIN_NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* メイン: 子要素の表示領域 */}
        <main className="flex-1 bg-white p-6">{children}</main>
      </div>
    </div>
  );
}
