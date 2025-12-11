"use client";

import { useState, useEffect } from "react";
import { useUserChat } from "@/hooks/useUserChat";
import type { UserPreview } from "@/features/user-chat/types";
import { ChatSidebar } from "@/components/user-chat/ChatSidebar";
import { ChatMain } from "@/components/user-chat/ChatMain";

type Props = {
  onInputFocusChange?: (focused: boolean) => void;
};

export function UserChat({ onInputFocusChange }: Props) {
  // 入力フォーカスハンドラを親に渡せるように optional prop に拡張しても良いが、
  // 既存のシグネチャを保つためまずは内部で扱う
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

  const [search, setSearch] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);

  // ルームが選択済みならメインを優先表示（モーダルで見えない問題の回避）
  useEffect(() => {
    if (!activeRoom) return;
    // 非同期に切り替えてレンダー負荷を避ける
    const id = setTimeout(() => setShowSidebar(false), 0);
    return () => clearTimeout(id);
  }, [activeRoom]);

  const handleSend = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    await sendMessage(trimmed);
  };

  const handleSearch = async () => {
    await searchUsers(search);
  };

  const handleSelectUser = async (user: UserPreview) => {
    const room = await createRoom(user.id, "dm");
    if (room) {
      setShowSidebar(false);
      setSearchResults([]);
      setSearch("");
    }
  };

  const handleSelectRoom = async (roomId: string) => {
    await selectRoom(roomId);
    setShowSidebar(false);
  };

  return (
    <div className="flex h-full min-h-[520px] flex-col gap-3 overflow-hidden lg:grid lg:grid-cols-[320px,1fr] lg:gap-4 lg:space-y-0 lg:overflow-visible">
      <div className={`${showSidebar ? "block" : "hidden"} lg:block`}>
        <ChatSidebar
          rooms={rooms}
          loadingRooms={loadingRooms}
          searchResults={searchResults}
          onSearchUsers={handleSearch}
          onSelectUser={handleSelectUser}
          onSelectRoom={handleSelectRoom}
          activeRoomId={activeRoom?.id ?? null}
          currentUserId={currentUser?.id}
          getUserStatus={getUserStatus}
          error={error}
          onClearError={() => setError(null)}
        />
      </div>

      <div className={`${showSidebar ? "hidden" : "block"} lg:block h-full min-h-0`}>
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
          onBack={() => setShowSidebar(true)}
        />
      </div>
    </div>
  );
}
