"use client";

import { useMemo, useState } from "react";
import type { ChatRoom, UserPreview } from "@/features/user-chat/types";
import { UserSearch } from "./UserSearch";
import { RoomList } from "./RoomList";
import { EmptyState } from "@/components/user-chat/shared/EmptyState";

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
    <aside className="flex h-full flex-col gap-3 rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">User Chat</p>
          <h2 className="text-lg font-semibold text-slate-900">ユーザーチャット</h2>
        </div>
      </header>

      <UserSearch value={search} results={searchResults} onChange={setSearch} onSearch={handleSearch} onSelect={onSelectUser} />

      <div className="flex-1 space-y-2 overflow-hidden">
        <p className="text-xs font-semibold text-slate-600">{headerTitle}</p>
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
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <div className="flex items-center justify-between gap-2">
            <span>{error}</span>
            <button type="button" onClick={onClearError} className="underline text-[11px]">
              閉じる
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
