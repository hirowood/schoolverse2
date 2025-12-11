"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

type UnreadRoom = {
  roomId: string;
  roomType: string;
  roomTitle: string | null;
  partnerName: string | null;
  unreadCount: number;
  latestMessage: {
    id: string;
    content: string;
    senderName: string | null;
    createdAt: string;
  } | null;
};

type SystemNotification = {
  id: string;
  type: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
};

type NotificationsData = {
  totalUnreadMessages: number;
  unreadRooms: UnreadRoom[];
  systemNotifications: SystemNotification[];
  totalNotifications: number;
};

export function NotificationsCard() {
  const [data, setData] = useState<NotificationsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/notifications");
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setData(json);
      setError(null);
    } catch {
      setError("通知の取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    // 30秒ごとに更新
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "quest":
        return (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        );
      case "achievement":
        return (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        );
      default:
        return (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 pb-3">
          <div className="h-5 w-5 animate-pulse rounded bg-slate-200" />
          <div className="h-5 w-24 animate-pulse rounded bg-slate-200" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  const hasNotifications = data && data.totalNotifications > 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* ヘッダー */}
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <svg className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {hasNotifications && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {data.totalNotifications > 9 ? "9+" : data.totalNotifications}
              </span>
            )}
          </div>
          <h3 className="text-sm font-bold text-slate-900">通知</h3>
        </div>
        <Link
          href="/user-chat"
          className="text-xs font-medium text-blue-600 hover:text-blue-700"
        >
          すべて見る
        </Link>
      </div>

      {/* コンテンツ */}
      <div className="max-h-80 overflow-y-auto">
        {!hasNotifications ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <svg className="h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="mt-2 text-sm text-slate-500">新しい通知はありません</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {/* システム通知 */}
            {data?.systemNotifications.map((notif) => (
              <Link
                key={notif.id}
                href={notif.type === "quest" ? "/quests" : "/achievements"}
                className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-slate-50"
              >
                <div className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                  notif.type === "quest" ? "bg-amber-100 text-amber-600" : "bg-purple-100 text-purple-600"
                }`}>
                  {getNotificationIcon(notif.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900">{notif.title}</p>
                  <p className="truncate text-xs text-slate-600">{notif.message}</p>
                </div>
              </Link>
            ))}

            {/* 未読メッセージ */}
            {data?.unreadRooms.map((room) => (
              <Link
                key={room.roomId}
                href={`/user-chat?room=${room.roomId}`}
                className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-slate-50"
              >
                <div className="relative mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  {room.roomType === "dm" ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  )}
                  {room.unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                      {room.unreadCount > 9 ? "9+" : room.unreadCount}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {room.roomTitle || (room.roomType === "group" ? "グループ" : "DM")}
                    </p>
                    {room.latestMessage && (
                      <span className="flex-shrink-0 text-[10px] text-slate-400">
                        {formatTime(room.latestMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  {room.latestMessage && (
                    <p className="truncate text-xs text-slate-600">
                      <span className="font-medium">{room.latestMessage.senderName}:</span>{" "}
                      {room.latestMessage.content}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* フッター（未読が多い場合） */}
      {data && data.totalUnreadMessages > 5 && (
        <div className="border-t border-slate-100 px-4 py-2">
          <Link
            href="/user-chat"
            className="block text-center text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            他{data.totalUnreadMessages - 5}件の未読メッセージを見る
          </Link>
        </div>
      )}
    </div>
  );
}
