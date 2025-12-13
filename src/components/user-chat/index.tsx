"use client";

import { ReactNode, useEffect, useState } from "react";
import { useUserChat } from "@/hooks/useUserChat";
import type { UserPreview } from "@/features/user-chat/types";
import { ChatSidebar } from "@/components/user-chat/ChatSidebar";
import { ChatMain } from "@/components/user-chat/ChatMain";
import { cn } from "@/lib/cn";

type Props = {
  onInputFocusChange?: (focused: boolean) => void;
};

export function UserChat({ onInputFocusChange }: Props) {
  const {
    rooms,
    activeRoom,
    messages,
    typingUsers,
    loadingRooms,
    loadingMessages,
    hasMoreMessages,
    searchResults,
    error,
    setError,
    setSearchResults,
    selectRoom,
    sendMessage,
    sendTyping,
    markRead,
    loadMore,
    searchUsers,
    createRoom,
    currentUser,
    getUserStatus,
  } = useUserChat();

  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // モバイルは「メッセージ」を優先表示しつつ、ルーム一覧はドロワーで開く
  useEffect(() => {
    if (!activeRoom) return;
    const id = setTimeout(() => setSidebarOpen(false), 0);
    return () => clearTimeout(id);
  }, [activeRoom]);

  const handleSend = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    await sendMessage(trimmed);
  };

  const handleSelectUser = async (user: UserPreview) => {
    const room = await createRoom(user.id, "dm");
    if (room) {
      setSidebarOpen(false);
      setSearchResults([]);
    }
  };

  const handleSelectRoom = async (roomId: string) => {
    await selectRoom(roomId);
    setSidebarOpen(false);
  };

  return (
    <div className="grid min-h-[560px] grid-cols-1 gap-4 lg:grid-cols-[320px,1fr]">
      <div className="hidden lg:block">
        <ChatSidebar
          rooms={rooms}
          loadingRooms={loadingRooms}
          searchResults={searchResults}
          onSearchUsers={searchUsers}
          onSelectUser={handleSelectUser}
          onSelectRoom={handleSelectRoom}
          activeRoomId={activeRoom?.id ?? null}
          currentUserId={currentUser?.id}
          getUserStatus={getUserStatus}
          error={error}
          onClearError={() => setError(null)}
        />
      </div>

      <div className="min-h-0">
        <ChatMain
          room={activeRoom}
          messages={messages}
          typingUsers={typingUsers}
          isLoadingMessages={loadingMessages}
          hasMoreMessages={hasMoreMessages}
          onLoadMore={loadMore}
          onSendMessage={handleSend}
          onTyping={sendTyping}
          onMarkRead={markRead}
          onInputFocusChange={onInputFocusChange}
          getUserStatus={getUserStatus}
          currentUserId={currentUser?.id}
          onBack={() => setSidebarOpen(true)}
        />
      </div>

      <MobileSidebarDrawer open={isSidebarOpen} onClose={() => setSidebarOpen(false)}>
        <ChatSidebar
          rooms={rooms}
          loadingRooms={loadingRooms}
          searchResults={searchResults}
          onSearchUsers={searchUsers}
          onSelectUser={handleSelectUser}
          onSelectRoom={handleSelectRoom}
          activeRoomId={activeRoom?.id ?? null}
          currentUserId={currentUser?.id}
          getUserStatus={getUserStatus}
          error={error}
          onClearError={() => setError(null)}
        />
      </MobileSidebarDrawer>
    </div>
  );
}

function MobileSidebarDrawer({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className={cn("fixed inset-0 z-50 transition lg:hidden", open ? "pointer-events-auto" : "pointer-events-none")}
      aria-hidden={!open}
      role="dialog"
      aria-label="ルーム一覧"
    >
      <div
        className={cn("absolute inset-0 bg-slate-900/60 transition-opacity", open ? "opacity-100" : "opacity-0")}
        onClick={onClose}
      />
      <div
        className={cn(
          "absolute inset-y-0 left-0 flex max-w-full transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full w-[86vw] max-w-sm flex-col overflow-y-auto bg-white px-4 py-5 shadow-2xl">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-base font-semibold text-slate-900">ルーム一覧</p>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              閉じる
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
