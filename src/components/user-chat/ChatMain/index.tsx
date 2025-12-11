"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ChatRoom, ChatRoomMessage, TypingUser } from "@/features/user-chat/types";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { TypingIndicator } from "./TypingIndicator";

type Props = {
  room: ChatRoom | null;
  messages: ChatRoomMessage[];
  typingUsers: TypingUser[];
  isLoadingMessages: boolean;
  hasMoreMessages: boolean;
  onLoadMore: () => void;
  onSendMessage: (text: string) => Promise<void>;
  onTyping: (isTyping: boolean) => void;
  onMarkRead: (messageId: string) => Promise<void>;
  onInputFocusChange?: (focused: boolean) => void;
  getUserStatus: (userId: string) => "online" | "away" | "offline";
  currentUserId?: string | null;
  onBack?: () => void;
};

export function ChatMain({
  room,
  messages,
  typingUsers,
  isLoadingMessages,
  hasMoreMessages,
  onLoadMore,
  onSendMessage,
  onTyping,
  onMarkRead,
  onInputFocusChange,
  getUserStatus,
  currentUserId,
  onBack,
}: Props) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);
  
  // FIX: Hold onMarkRead in ref to remove from deps
  const onMarkReadRef = useRef(onMarkRead);
  useEffect(() => {
    onMarkReadRef.current = onMarkRead;
  }, [onMarkRead]);

  // FIX: Track last marked message ID
  const lastMarkedIdRef = useRef<string | null>(null);
  const markReadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // FIX: Improved mark read logic
  useEffect(() => {
    if (!room) return;
    const last = messages[messages.length - 1];
    if (!last) return;
    
    // Skip if same message ID
    if (lastMarkedIdRef.current === last.id) return;
    
    // Clear existing timer
    if (markReadTimeoutRef.current) {
      clearTimeout(markReadTimeoutRef.current);
    }
    
    // Debounce: 500ms delay
    markReadTimeoutRef.current = setTimeout(() => {
      lastMarkedIdRef.current = last.id;
      void onMarkReadRef.current(last.id);
    }, 500);
    
    return () => {
      if (markReadTimeoutRef.current) {
        clearTimeout(markReadTimeoutRef.current);
      }
    };
  }, [room, messages]); // Removed onMarkRead from deps

  const typingNames = useMemo(() => typingUsers.map((u) => u.name), [typingUsers]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    await onSendMessage(text);
  };

  return (
    <section className="flex h-full flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
      <ChatHeader room={room} getUserStatus={getUserStatus} onBack={onBack} />

      <div className="flex-1 min-h-0 overflow-hidden">
        <MessageList
          messages={messages}
          isLoading={isLoadingMessages}
          hasMore={hasMoreMessages}
          onLoadMore={onLoadMore}
          currentUserId={currentUserId}
        />
        <div ref={bottomRef} />
      </div>

      {typingNames.length > 0 && <TypingIndicator users={typingUsers} />}

      <div className="border-t border-slate-200 bg-slate-50 px-4 py-3">
        <MessageInput
          value={input}
          onChange={(v) => {
            setInput(v);
            onTyping(true);
          }}
          onBlur={() => onTyping(false)}
          onFocusChange={onInputFocusChange}
          onSend={handleSend}
          disabled={!room}
        />
      </div>
    </section>
  );
}
