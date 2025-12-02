"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useUserChat } from "@/hooks/useUserChat";
import type { ChatRoomMessage, UserPreview } from "@/features/user-chat/types";

export function UserChat() {
  const {
    rooms,
    activeRoom,
    messages,
    typing,
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
  } = useUserChat();

  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!activeRoom) return;
    const last = messages[messages.length - 1];
    if (last) markRead(last.id);
  }, [activeRoom, markRead, messages]);

  const activeTyping = useMemo(() => {
    if (!activeRoom) return [];
    const set = typing[activeRoom.id];
    return set ? Array.from(set) : [];
  }, [activeRoom, typing]);

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
      <aside className="flex h-full flex-col gap-3 rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              User Chat
            </p>
            <h2 className="text-lg font-semibold text-slate-900">ユーザーチャット</h2>
          </div>
        </header>

        <div className="space-y-2">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ユーザー検索 (メール/名前)"
              className="w-full bg-transparent text-sm outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
            />
            <button
              type="button"
              onClick={handleSearch}
              className="rounded-md bg-slate-900 px-3 py-1 text-xs font-semibold text-white"
            >
              検索
            </button>
          </div>
          {searchResults.length > 0 && (
            <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-sm">
              {searchResults.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleSelectUser(u)}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-slate-50"
                >
                  <span>{u.name ?? u.email ?? u.id}</span>
                  <span className="text-[11px] text-slate-500">DM開始</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 space-y-2 overflow-hidden">
          <p className="text-xs font-semibold text-slate-600">ルーム</p>
          {loadingRooms ? (
            <p className="text-sm text-slate-500">読込中...</p>
          ) : rooms.length === 0 ? (
            <p className="rounded-md border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
              まだルームがありません
            </p>
          ) : (
            <div className="space-y-2 overflow-y-auto pr-1" style={{ maxHeight: "400px" }}>
              {rooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => selectRoom(room.id)}
                  className={`flex w-full flex-col rounded-lg border px-3 py-2 text-left shadow-sm transition ${
                    activeRoom?.id === room.id
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white hover:-translate-y-0.5 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="line-clamp-1 text-sm font-semibold">
                      {room.title || (room.type === "dm" ? "ダイレクト" : "グループ")}
                    </p>
                    <span className="text-[10px] uppercase">{room.type}</span>
                  </div>
                  {room.lastMessage && (
                    <p
                      className={`line-clamp-1 text-xs ${
                        activeRoom?.id === room.id ? "text-slate-200" : "text-slate-600"
                      }`}
                    >
                      {room.lastMessage.content}
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            <div className="flex items-center justify-between gap-2">
              <span>{error}</span>
              <button type="button" onClick={() => setError(null)} className="underline text-[11px]">
                閉じる
              </button>
            </div>
          </div>
        )}
      </aside>

      <section className="flex h-full flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
        <header className="border-b border-slate-200 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Room</p>
          <h3 className="text-lg font-semibold text-slate-900">
            {activeRoom?.title || (activeRoom?.type === "dm" ? "ダイレクトメッセージ" : "グループ")}
          </h3>
        </header>

        <div className="flex-1 min-h-0 overflow-hidden">
          <MessageList
            messages={messages}
            isLoading={loadingMessages}
            hasMore={hasMoreMessages}
            onLoadMore={loadMore}
          />
          <div ref={bottomRef} />
        </div>

        {activeTyping.length > 0 && (
          <div className="px-4 py-2 text-xs text-slate-600">
            入力中: {activeTyping.join(", ")}
          </div>
        )}

        <div className="border-t border-slate-200 bg-slate-50 px-4 py-3">
          <MessageInput
            value={input}
            onChange={(v) => {
              setInput(v);
              sendTyping(true);
            }}
            onBlur={() => sendTyping(false)}
            onSend={handleSend}
            disabled={!activeRoom}
          />
        </div>
      </section>
    </div>
  );
}

function MessageList({
  messages,
  isLoading,
  hasMore,
  onLoadMore,
}: {
  messages: ChatRoomMessage[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
}) {
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = listRef.current;
    if (!el || !onLoadMore) return;
    const handler = () => {
      if (el.scrollTop < 20 && hasMore) onLoadMore();
    };
    el.addEventListener("scroll", handler);
    return () => el.removeEventListener("scroll", handler);
  }, [hasMore, onLoadMore]);

  return (
    <div
      ref={listRef}
      className="flex h-full flex-col gap-2 overflow-y-auto bg-gradient-to-b from-slate-50 via-white to-slate-50 px-4 py-3"
    >
      {isLoading && messages.length === 0 ? (
        <p className="text-center text-sm text-slate-500">読み込み中...</p>
      ) : null}
      {hasMore && (
        <button
          type="button"
          onClick={onLoadMore}
          className="mx-auto text-[11px] font-semibold text-slate-500 underline"
        >
          履歴をもっと見る
        </button>
      )}
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
    </div>
  );
}

function MessageItem({ message }: { message: ChatRoomMessage }) {
  const isSelf = false; // UI用のシンプル表示（サーバー側のsenderIdと現在のユーザーID比較は省略）
  const readCount = message.reads?.length ?? 0;
  return (
    <div className={`flex w-full ${isSelf ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-lg px-3 py-2 shadow-sm ${
          isSelf
            ? "rounded-br-sm bg-slate-900 text-white"
            : "rounded-bl-sm border border-slate-200 bg-white"
        }`}
      >
        <div className="flex items-center justify-between gap-3 text-[11px] text-slate-500">
          <span className="font-semibold">{message.sender?.name ?? "ユーザー"}</span>
          <span>{new Date(message.createdAt).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}</span>
        </div>
        <div className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
        {readCount > 0 && (
          <p className="mt-1 text-[11px] text-slate-500">既読 {readCount}</p>
        )}
      </div>
    </div>
  );
}

function MessageInput({
  value,
  onChange,
  onSend,
  onBlur,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onBlur?: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-end gap-2">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder="メッセージを入力..."
        className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-inner focus:border-slate-400 focus:outline-none"
        rows={3}
        disabled={disabled}
      />
      <button
        type="button"
        onClick={onSend}
        disabled={disabled || value.trim().length === 0}
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60"
      >
        送信
      </button>
    </div>
  );
}
