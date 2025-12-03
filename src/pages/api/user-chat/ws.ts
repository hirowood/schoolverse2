import type { NextApiRequest, NextApiResponse } from "next";
import type { Socket } from "net";
import type { Server } from "http";
import { getToken } from "next-auth/jwt";
import { WebSocketServer, RawData } from "ws";
import { prisma } from "@/lib/prisma";
import { notifyMessage, notifyTyping, notifyRead, joinRoom, registerClient } from "@/lib/user-chat/hub";

export const config = {
  api: {
    bodyParser: false,
  },
};

// カスタム型定義：Next.jsのソケットサーバー拡張
interface SocketWithServer extends Socket {
  server: Server & {
    userChatWss?: WebSocketServer;
  };
}

interface ExtendedNextApiResponse extends NextApiResponse {
  socket: SocketWithServer | null;
}

async function authenticate(request: NextApiRequest): Promise<string | null> {
  try {
    // NextApiRequestをそのまま渡す（next-authは内部で処理）
    const token = await getToken({ req: request });
    const userId = (token as { sub?: string } | null)?.sub;
    return userId ?? null;
  } catch {
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: ExtendedNextApiResponse) {
  // WebSocket upgrade happens via the HTTP server; here we just ensure the server is ready.
  
  // nullチェック
  if (!res.socket) {
    res.status(500).json({ error: "Socket not available" });
    return;
  }

  const server = res.socket.server;
  
  if (!server.userChatWss) {
    const wss = new WebSocketServer({ noServer: true });
    server.userChatWss = wss;

    server.on("upgrade", async (request: import("http").IncomingMessage, socket: Socket, head: Buffer) => {
      if (!request.url?.startsWith("/api/user-chat/ws")) return;

      // IncomingMessageをNextApiRequest互換として認証
      const userId = await authenticate(request as unknown as NextApiRequest);
      if (!userId) {
        socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
        socket.destroy();
        return;
      }

      wss.handleUpgrade(request, socket, head, (ws) => {
        const client = registerClient(ws, userId);

        ws.on("message", async (data: RawData) => {
          try {
            const parsed = JSON.parse(data.toString()) as
              | { type: "join"; roomId: string }
              | { type: "message"; roomId: string; content: string }
              | { type: "typing"; roomId: string; isTyping: boolean }
              | { type: "read"; roomId: string; messageId: string };

            if (parsed.type === "join") {
              const membership = await prisma.chatRoomMember.findFirst({
                where: { roomId: parsed.roomId, userId },
              });
              if (membership) {
                joinRoom(client, parsed.roomId);
                await prisma.chatRoomMember.update({
                  where: { id: membership.id },
                  data: { lastSeenAt: new Date() },
                });
              }
              return;
            }

            if (parsed.type === "typing") {
              notifyTyping(parsed.roomId, userId, parsed.isTyping);
              return;
            }

            if (parsed.type === "read") {
              await prisma.chatRoomRead.upsert({
                where: { messageId_userId: { messageId: parsed.messageId, userId } },
                update: { readAt: new Date() },
                create: {
                  messageId: parsed.messageId,
                  userId,
                  readAt: new Date(),
                },
              });
              notifyRead(parsed.roomId, userId, parsed.messageId, new Date().toISOString());
              return;
            }

            if (parsed.type === "message") {
              const membership = await prisma.chatRoomMember.findFirst({
                where: { roomId: parsed.roomId, userId },
              });
              if (!membership) return;

              const message = await prisma.chatRoomMessage.create({
                data: {
                  roomId: parsed.roomId,
                  senderId: userId,
                  content: parsed.content.trim(),
                },
                include: {
                  sender: { select: { id: true, name: true, email: true } },
                  reads: true,
                },
              });

              await prisma.chatRoom.update({
                where: { id: parsed.roomId },
                data: { lastMessageAt: message.createdAt },
              });

              // reads配列のreadAtをstringに変換
              notifyMessage(parsed.roomId, {
                id: message.id,
                roomId: parsed.roomId,
                senderId: message.senderId,
                content: message.content,
                messageType: message.messageType,
                createdAt: message.createdAt.toISOString(),
                updatedAt: message.updatedAt.toISOString(),
                sender: message.sender ?? undefined,
                reads: message.reads.map((read) => ({
                  id: read.id,
                  messageId: read.messageId,
                  userId: read.userId,
                  readAt: read.readAt.toISOString(),
                })),
              });
            }
          } catch (error) {
            console.error("user-chat ws message error", error);
          }
        });
      });
    });
  }

  res.status(200).end();
}
