import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import { WebSocketServer, RawData } from "ws";
import { prisma } from "@/lib/prisma";
import { notifyMessage, notifyTyping, notifyRead, joinRoom, registerClient } from "@/lib/user-chat/hub";

export const config = {
  api: {
    bodyParser: false,
  },
};

const JWT_SECRET = process.env.NEXTAUTH_SECRET;

async function authenticate(request: NextApiRequest): Promise<string | null> {
  if (!JWT_SECRET) return null;
  const token = await getToken({ req: request as any, secret: JWT_SECRET }).catch(() => null);
  const userId = (token as { sub?: string } | null)?.sub;
  return userId ?? null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // WebSocket upgrade happens via the HTTP server; here we just ensure the server is ready.
  const server = res.socket.server as any;

  if (!server.userChatWss) {
    const wss = new WebSocketServer({ noServer: true });
    server.userChatWss = wss;

    server.on("upgrade", async (request: NextApiRequest, socket: any, head: any) => {
      if (!request.url?.startsWith("/api/user-chat/ws")) return;

      const userId = await authenticate(request);
      if (!userId) {
        socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
        socket.destroy();
        return;
      }

      wss.handleUpgrade(request as any, socket, head, (ws) => {
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

              notifyMessage(parsed.roomId, {
                ...message,
                roomId: parsed.roomId,
                createdAt: message.createdAt.toISOString(),
                updatedAt: message.updatedAt.toISOString(),
                sender: message.sender ?? undefined,
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
