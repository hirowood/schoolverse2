"use client";

import dynamic from "next/dynamic";
import { Suspense, useState } from "react";
import { useSession } from "next-auth/react";
import { useClassroomPresence } from "@/hooks/useClassroomPresence";
import { OtherPlayerBattles } from "@/components/virtual-classroom/HUD/OtherPlayerBattles";
import { PlayerCountIndicator } from "@/components/virtual-classroom/HUD/PlayerCountIndicator";
import { ConfettiEffect } from "@/components/virtual-classroom/Effects/ConfettiEffect";
import { ShakeEffect } from "@/components/virtual-classroom/Effects/ShakeEffect";
import { ZoneIndicator } from "@/components/virtual-classroom/HUD/ZoneIndicator";
import { useVirtualRoomStore } from "@/stores/useVirtualRoomStore";

// BattleHUDも遅延読み込み（3D関連の依存がある場合に備えて）
const BattleHUD = dynamic(
  () => import("@/components/virtual-classroom/HUD/BattleHUD").then((m) => m.BattleHUD),
  { ssr: false }
);

// Canvas3Dを完全にクライアントサイドで読み込み
const Canvas3D = dynamic(
  () => import("@/components/virtual-classroom/Room3D/Canvas3D").then((m) => m.Canvas3D),
  {
    ssr: false,
    loading: () => (
      <div className="relative min-h-[360px] sm:h-[520px] w-full rounded-2xl border border-slate-200 bg-slate-50 shadow-inner">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-500">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-blue-500" />
          <p className="text-sm">3D教室を準備中...</p>
        </div>
      </div>
    ),
  }
);

const UserChat = dynamic(
  () => import("@/components/user-chat").then((m) => m.UserChat),
  { ssr: false }
);

export default function VirtualClassroomPage() {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInputFocused, setChatInputFocused] = useState(false);
  const showConfetti = useVirtualRoomStore((s) => s.showConfetti);
  const showShake = useVirtualRoomStore((s) => s.showShake);
  const { data: session } = useSession();
  const userId = (session?.user as { id?: string } | undefined)?.id ?? null;
  const userName = session?.user?.name ?? session?.user?.email ?? "Guest";
  const presence = useClassroomPresence("default", userId, userName);
  const { otherPlayers, isConnected, playerCount } = presence;
  return (
    <main className="relative min-h-screen bg-gradient-to-b from-slate-50 to-white pb-24">
      <div className="mx-auto w-full px-3 sm:px-6 lg:px-10 pt-8 space-y-6">
        {/* ヘッダー */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Virtual Classroom
            </p>
            <h1 className="text-2xl font-bold text-slate-900">
              バーチャル教室（ベータ）
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              3D教室を探索してモンスターと遭遇しよう。ITスキルの問題に正解してXPを獲得！
            </p>
          </div>
        </div>

        {/* 3Dキャンバス */}
      <Suspense
        fallback={
          <div className="h-[520px] w-full rounded-2xl border border-slate-200 bg-slate-100 shadow-inner flex items-center justify-center">
            <p className="text-slate-500">読み込み中...</p>
          </div>
        }
      >
        <ShakeEffect active={showShake}>
          <div className="relative min-h-[360px] sm:min-h-[520px] md:min-h-[600px] w-full">
            <Canvas3D
              roomId="default"
              userId={userId}
              userName={userName}
              presence={presence}
              paused={chatInputFocused && chatOpen}
            />
          </div>
        </ShakeEffect>
      </Suspense>
        <div className="flex justify-end">
          <ZoneIndicator />
        </div>
        <OtherPlayerBattles players={otherPlayers} />
        <PlayerCountIndicator playerCount={playerCount} isConnected={isConnected} />

        {/* 操作説明 */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700 mb-2">🎮 操作方法</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="rounded bg-slate-100 px-2 py-1 font-mono">ドラッグ</span>
              <span>視点回転</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-slate-100 px-2 py-1 font-mono">スクロール</span>
              <span>ズーム</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-slate-100 px-2 py-1 font-mono">タッチ</span>
              <span>モバイル対応</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500">⚠️</span>
              <span>ベータ版のため一部機能制限あり</span>
            </div>
          </div>
        </div>
      </div>

      {/* バトルHUD（オーバーレイ） */}
      <BattleHUD />
      <ConfettiEffect active={showConfetti} />

      {/* ユーザーチャット（モーダル） */}
      {chatOpen && (
        <div className="fixed inset-0 z-[70] flex items-start justify-center bg-black/30 px-3 pt-12 sm:pt-16">
          <div className="w-full max-w-[560px]">
            <div className="max-h-[82vh] rounded-2xl border border-slate-200 bg-white shadow-2xl ring-1 ring-slate-100 overflow-hidden flex flex-col text-[12px] leading-tight">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase text-slate-500">User Chat</p>
                  <p className="text-[13px] font-bold text-slate-900">教室チャット</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setChatOpen(false);
                    setChatInputFocused(false);
                  }}
                  className="rounded-md px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-100"
                >
                  閉じる
                </button>
              </div>
              <div className="flex-1 min-h-0 overflow-hidden px-2 pb-3">
                <div className="h-full w-full overflow-hidden rounded-xl border border-slate-100 text-[12px] leading-tight [&_*]:text-[12px] [&_input]:text-[12px] [&_textarea]:text-[12px]">
                  <UserChat
                    onInputFocusChange={(focused) => {
                      setChatInputFocused(focused);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          setChatOpen((v) => {
            const next = !v;
            if (!next) setChatInputFocused(false);
            return next;
          });
        }}
        className="fixed bottom-28 right-3 z-50 rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg ring-2 ring-emerald-200"
      >
        {chatOpen ? "チャットを閉じる" : "チャットを開く"}
      </button>
    </main>
  );
}
