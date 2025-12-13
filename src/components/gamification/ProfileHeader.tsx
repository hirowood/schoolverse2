import type { GameProfile } from "@/types/gamification";

interface ProfileHeaderProps {
  profile: GameProfile;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-50 via-white to-white p-6 shadow-sm ring-1 ring-slate-100 dark:border-slate-700 dark:from-slate-800 dark:via-slate-900 dark:to-slate-900 dark:ring-slate-700">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 p-[3px] shadow-inner">
              <div className="flex h-full w-full items-center justify-center rounded-xl bg-white text-3xl">🎯</div>
            </div>
            {profile.avatarFrame && (
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-slate-900 px-2 py-0.5 text-[11px] text-white shadow">
                {profile.avatarFrame}
              </span>
            )}
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold leading-tight sm:text-2xl">マイステータス</h2>
              {profile.title && (
                <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
                  {profile.title}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
              <span className="rounded-full border border-slate-200 px-2.5 py-1 text-[12px] font-semibold text-slate-800 dark:border-slate-600 dark:text-white">
                ランク: {profile.rankLabel}
              </span>
              <span className="rounded-full border border-slate-200 px-2.5 py-1 text-[12px] font-semibold text-slate-800 dark:border-slate-600 dark:text-white">
                レベル {profile.level}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-700">
          <button className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-slate-200 px-4 font-semibold shadow-sm transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 active:scale-[0.99] dark:border-slate-600 dark:text-slate-50 dark:hover:bg-slate-800 sm:w-auto">
            設定
          </button>
          <button className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-slate-200 px-4 font-semibold shadow-sm transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 active:scale-[0.99] dark:border-slate-600 dark:text-slate-50 dark:hover:bg-slate-800 sm:w-auto">
            ヘルプ
          </button>
        </div>
      </div>
    </section>
  );
}
