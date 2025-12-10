"use client";

import { useMemo, useState } from "react";
import { useUserChat } from "@/hooks/useUserChat";
import type { UserPreview } from "@/features/user-chat/types";
import { ChatSidebar } from "@/components/user-chat/ChatSidebar";
import { ChatMain } from "@/components/user-chat/ChatMain";

export function UserChat() {
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

  const activeTyping = useMemo(() => typingUsers.map((u) => u.name), [typingUsers]);

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
    await createRoom(user.id, "dm");
    setSearchResults([]);
    setSearch("");
  };

  return (
    <div className="grid min-h-[520px] grid-cols-1 gap-4 lg:grid-cols-[320px,1fr]">
      <ChatSidebar
        rooms={rooms}
        loadingRooms={loadingRooms}
        searchResults={searchResults}
        onSearchUsers={handleSearch}
        onSelectUser={handleSelectUser}
        onSelectRoom={selectRoom}
        activeRoomId={activeRoom?.id ?? null}
        currentUserId={currentUser?.id}
        getUserStatus={getUserStatus}
        error={error}
        onClearError={() => setError(null)}
      />

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
        getUserStatus={getUserStatus}
        currentUserId={currentUser?.id}
      />
    </div>
  );
}
