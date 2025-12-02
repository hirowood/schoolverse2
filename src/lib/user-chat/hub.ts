import WebSocket from "ws";
import type { ChatRoomMessage } from "@/features/user-chat/types";

type ClientInfo = {
  ws: WebSocket;
  userId: string;
  rooms: Set<string>;
};

const clients = new Set<ClientInfo>();
const roomClients = new Map<string, Set<ClientInfo>>();

function removeClient(client: ClientInfo) {
  clients.delete(client);
  for (const roomId of client.rooms) {
    const set = roomClients.get(roomId);
    if (set) {
      set.delete(client);
      if (!set.size) {
        roomClients.delete(roomId);
      }
    }
  }
}

export function registerClient(ws: WebSocket, userId: string): ClientInfo {
  const client: ClientInfo = { ws, userId, rooms: new Set() };
  clients.add(client);

  ws.on("close", () => removeClient(client));
  ws.on("error", () => removeClient(client));

  return client;
}

export function joinRoom(client: ClientInfo, roomId: string) {
  client.rooms.add(roomId);
  let set = roomClients.get(roomId);
  if (!set) {
    set = new Set();
    roomClients.set(roomId, set);
  }
  set.add(client);
}

export function broadcastToRoom(roomId: string, payload: unknown) {
  const set = roomClients.get(roomId);
  if (!set) return;
  const msg = JSON.stringify(payload);
  for (const client of set) {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(msg);
    }
  }
}

export function notifyMessage(roomId: string, message: ChatRoomMessage) {
  broadcastToRoom(roomId, { type: "message", roomId, message });
}

export function notifyTyping(roomId: string, userId: string, isTyping: boolean) {
  broadcastToRoom(roomId, { type: "typing", roomId, userId, isTyping });
}

export function notifyRead(roomId: string, userId: string, messageId: string, readAt: string) {
  broadcastToRoom(roomId, { type: "read", roomId, userId, messageId, readAt });
}
