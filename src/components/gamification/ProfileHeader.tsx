import type { GameProfile } from "@/types/gamification";

type ProfileHeaderProps = {
  profile: GameProfile;
};

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 p-[3px] shadow-inner">
              <div className="flex h-full w-full items-center justify-center rounded-xl bg-white text-3xl">👤</div>
            </div>
            {profile.avatarFrame && (
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-slate-900 px-2 py-0.5 text-[11px] text-white shadow">
                {profile.avatarFrame}
              </span>
            )}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold leading-tight">マイステータス</h2>
              {profile.title && (
                <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
                  {profile.title}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
              <span className="rounded-full border border-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700">
                ランク: {profile.rankLabel}
              </span>
              <span className="rounded-full border border-slate-200 px-2 py-0.5 text-xs text-slate-700">
                レベル {profile.level}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <button className="rounded-lg border border-slate-200 px-3 py-1.5 transition hover:bg-slate-50">設定</button>
          <button className="rounded-lg border border-slate-200 px-3 py-1.5 transition hover:bg-slate-50">ヘルプ</button>
        </div>
      </div>
    </div>
  );
}
