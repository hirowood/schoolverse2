"use client";

import { useMemo, useState } from "react";
import type { ChatRoom, UserPreview } from "@/features/user-chat/types";
import { UserSearch } from "./UserSearch";
import { RoomList } from "./RoomList";
import { EmptyState } from "@/components/user-chat/shared/EmptyState";
import { cardClassName } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type Props = {
  rooms: ChatRoom[];
  loadingRooms: boolean;
  searchResults: UserPreview[];
  onSearchUsers: (q: string) => Promise<void>;
  onSelectUser: (user: UserPreview) => Promise<void>;
  onSelectRoom: (roomId: string) => Promise<void>;
  activeRoomId: string | null;
  currentUserId?: string | null;
  getUserStatus: (userId: string) => "online" | "away" | "offline";
  error?: string | null;
  onClearError?: () => void;
};

export function ChatSidebar({
  rooms,
  loadingRooms,
  searchResults,
  onSearchUsers,
  onSelectUser,
  onSelectRoom,
  activeRoomId,
  currentUserId,
  getUserStatus,
  error,
  onClearError,
}: Props) {
  const [search, setSearch] = useState("");

  const handleSearch = async () => {
    await onSearchUsers(search);
  };

  const hasRooms = rooms.length > 0;
  const headerTitle = useMemo(() => {
    return hasRooms ? "ルーム" : "ユーザーを検索してDMを開始しましょう";
  }, [hasRooms]);

  return (
    <aside className={cardClassName({ className: "flex h-full flex-col gap-5", radius: "xl" })}>
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">User Chat</p>
          <h2 className="text-xl font-semibold text-slate-900">ユーザーチャット</h2>
          <p className="mt-1 text-sm text-slate-500">DM・グループでリアルタイムに会話</p>
        </div>
      </header>

      <UserSearch
        value={search}
        results={searchResults}
        onChange={setSearch}
        onSearch={handleSearch}
        onSelect={onSelectUser}
      />

      <div className="flex-1 space-y-2 overflow-hidden">
        <p className="text-sm font-semibold text-slate-600">{headerTitle}</p>
        {loadingRooms ? (
          <p className="text-sm text-slate-500">読込中...</p>
        ) : hasRooms ? (
          <RoomList
            rooms={rooms}
            activeRoomId={activeRoomId}
            onSelect={onSelectRoom}
            currentUserId={currentUserId}
            getUserStatus={getUserStatus}
          />
        ) : (
          <EmptyState
            title="まだルームがありません"
            description="ユーザーを検索してDMを開始してください"
            actionLabel="検索する"
            onAction={handleSearch}
          />
        )}
      </div>
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="font-medium">{error}</span>
            {onClearError && (
              <Button variant="outline" size="tapXs" onClick={onClearError} className="rounded-full">
                閉じる
              </Button>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
