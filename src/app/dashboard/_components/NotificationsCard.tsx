"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { cardClassName } from "@/components/ui/Card";
import { buttonClassName } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import {
  type DashboardNotificationsData,
  getDashboardNotifications,
} from "@/features/dashboard/api";

/**
 * NotificationsCard
 *
 * - fetch を API client に委譲（責務分離 / RESTful）
 * - モバイルで読みやすい行間・タップ領域に調整
 */

interface State {
  data: DashboardNotificationsData | null;
  isLoading: boolean;
  error: string | null;
}

export function NotificationsCard() {
  const [{ data, isLoading, error }, setState] = useState<State>({
    data: null,
    isLoading: true,
    error: null,
  });

  const fetchNotifications = useCallback(async () => {
    try {
      const json = await getDashboardNotifications();
      setState({ data: json, isLoading: false, error: null });
    } catch (e) {
      setState({ data: null, isLoading: false, error: (e as Error).message || "通知の取得に失敗しました" });
    }
  }, []);

  useEffect(() => {
    // eslint (react-hooks/set-state-in-effect) 回避:
    // setState を含む処理は effect 本体ではなく task に寄せる
    const id = setTimeout(() => {
      void fetchNotifications();
    }, 0);
    const interval = setInterval(fetchNotifications, 30_000);
    return () => {
      clearTimeout(id);
      clearInterval(interval);
    };
  }, [fetchNotifications]);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "たった今";
    if (minutes < 60) return `${minutes}分前`;
    if (hours < 24) return `${hours}時間前`;
    if (days < 7) return `${days}日前`;
    return date.toLocaleDateString("ja-JP", { month: "short", day: "numeric" });
  };

  const iconForType = (type: string) => {
    switch (type) {
      case "quest":
        return "🧩";
      case "achievement":
        return "🏅";
      default:
        return "🔔";
    }
  };

  if (isLoading) {
    return <div className={cardClassName({ radius: "2xl", className: "h-64 animate-pulse bg-slate-100" })} />;
  }

  if (error) {
    return (
      <div className={cardClassName({ radius: "2xl" })}>
        <p className="text-sm font-semibold text-red-600">{error}</p>
        <div className="mt-3">
          <button
            type="button"
            onClick={() => void fetchNotifications()}
            className={buttonClassName({ variant: "outline", rounded: "full", size: "tap" })}
          >
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  const total = data?.totalNotifications ?? 0;
  const hasNotifications = total > 0;

  return (
    <section className={cardClassName({ radius: "2xl", padding: "none" })}>
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-4">
        <div className="flex items-center gap-3">
          <span className="text-xl" aria-hidden>
            🔔
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Notifications</p>
            <p className="text-lg font-semibold text-slate-900">通知</p>
          </div>
        </div>
        <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
          {total}
        </span>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {!hasNotifications ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
            <p className="text-base font-semibold text-slate-900">新しい通知はありません</p>
            <p className="text-sm text-slate-500">メッセージや達成状況がここに表示されます。</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {data?.systemNotifications.map((notif) => (
              <Link
                key={notif.id}
                href={notif.type === "quest" ? "/quests" : "/achievements"}
                className={cn(
                  "flex items-start gap-3 px-4 py-4 transition-colors hover:bg-slate-50",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400",
                )}
              >
                <div className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-lg">
                  {iconForType(notif.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-base font-semibold text-slate-900">{notif.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-sm text-slate-600">{notif.message}</p>
                </div>
              </Link>
            ))}

            {data?.unreadRooms.map((room) => (
              <Link
                key={room.roomId}
                href={`/user-chat?room=${room.roomId}`}
                className={cn(
                  "flex items-start gap-3 px-4 py-4 transition-colors hover:bg-slate-50",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400",
                )}
              >
                <div className="relative mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-lg text-blue-700">
                  {room.roomType === "dm" ? "👤" : "👥"}
                  {room.unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
                      {room.unreadCount > 99 ? "99+" : room.unreadCount}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-base font-semibold text-slate-900">
                      {room.roomTitle || (room.roomType === "group" ? "グループ" : "DM")}
                    </p>
                    {room.latestMessage ? (
                      <span className="flex-shrink-0 text-xs text-slate-400">
                        {formatTime(room.latestMessage.createdAt)}
                      </span>
                    ) : null}
                  </div>
                  {room.latestMessage ? (
                    <p className="mt-0.5 line-clamp-2 text-sm text-slate-600">
                      <span className="font-semibold">{room.latestMessage.senderName}:</span> {room.latestMessage.content}
                    </p>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {data && data.totalUnreadMessages > 5 ? (
        <div className="border-t border-slate-100 px-4 py-3">
          <Link
            href="/user-chat"
            className={cn(
              buttonClassName({ variant: "outline", rounded: "full", size: "tap" }),
              "block text-center",
            )}
          >
            他{data.totalUnreadMessages - 5}件の未読メッセージを見る
          </Link>
        </div>
      ) : null}
    </section>
  );
}
