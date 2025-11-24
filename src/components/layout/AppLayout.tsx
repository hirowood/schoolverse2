import Link from "next/link";
import { ReactNode } from "react";

type AppLayoutProps = {
  children: ReactNode;
};

// ��ʑS�̂��ރ��C�A�E�g�R���|�[�l���g
export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* �w�b�_: ���S�ƒZ������ */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-2">
          <span className="text-xl font-semibold tracking-tight">
            Schoolverse2
          </span>
          <span className="text-xs text-slate-500">AI�w�K�R�[�`�̂��߂̊��</span>
        </div>
      </header>

      <div className="flex flex-1">
        {/* �T�C�h�o�[: �i�r�Q�[�V�������j���[ */}
        <aside className="w-64 border-r border-slate-200 bg-white/60 backdrop-blur-sm">
          <nav className="p-4 space-y-2">
            {[
              { label: "AIコーチ", href: "/coach" },
              { label: "学習計画", href: "/plan" },
              { label: "クレド実践", href: "/credo" },
              { label: "設定", href: "/settings" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* ���C��: �q�v�f�̕\���̈� */}
        <main className="flex-1 bg-white p-6">{children}</main>
      </div>
    </div>
  );
}
