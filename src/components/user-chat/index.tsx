"use client";

import { useState } from "react";
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

  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    await sendMessage(text);
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
    <div className="min-h-[520px] space-y-4 lg:grid lg:grid-cols-[320px,1fr] lg:gap-4 lg:space-y-0">
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

      <div className={`${showSidebar ? "hidden" : "block"} lg:block`}>
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
