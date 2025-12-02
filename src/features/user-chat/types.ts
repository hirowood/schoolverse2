export type ChatRoomType = "dm" | "group";

export type UserPreview = {
  id: string;
  name?: string | null;
  email?: string | null;
};

export type ChatRoomMember = {
  id: string;
  roomId: string;
  userId: string;
  role: "member" | "admin";
  joinedAt: string;
  lastSeenAt?: string | null;
  user?: UserPreview;
};

export type ChatRoomMessage = {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  messageType: string;
  createdAt: string;
  updatedAt: string;
  sender?: UserPreview;
  reads?: ChatRoomRead[];
};

export type ChatRoomRead = {
  id: string;
  messageId: string;
  userId: string;
  readAt: string;
};

export type ChatRoom = {
  id: string;
  type: ChatRoomType;
  title?: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastMessageAt?: string | null;
  members?: ChatRoomMember[];
  lastMessage?: ChatRoomMessage | null;
};

export type RoomListResponse = {
  rooms: ChatRoom[];
  nextCursor: string | null;
};

export type MessageListResponse = {
  messages: ChatRoomMessage[];
  nextCursor: string | null;
};

export type WsClientMessage =
  | { type: "join"; roomId: string }
  | { type: "message"; roomId: string; content: string }
  | { type: "typing"; roomId: string; isTyping: boolean }
  | { type: "read"; roomId: string; messageId: string };

export type WsServerMessage =
  | { type: "message"; roomId: string; message: ChatRoomMessage }
  | { type: "typing"; roomId: string; userId: string; isTyping: boolean }
  | { type: "read"; roomId: string; userId: string; messageId: string; readAt: string }
  | { type: "error"; message: string };
