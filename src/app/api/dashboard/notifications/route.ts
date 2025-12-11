import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * ダッシュボード用の通知API
 * - 未読メッセージ（チャットルームごと）
 * - 最新メッセージのプレビュー
 * - 未読の合計数
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string } | undefined;
  if (!user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    // ユーザーが参加しているチャットルームを取得
    const memberships = await prisma.chatRoomMember.findMany({
      where: { userId: user.id },
      select: {
        roomId: true,
        lastSeenAt: true,
        room: {
          select: {
            id: true,
            type: true,
            title: true,
            members: {
              where: { userId: { not: user.id } },
              include: {
                user: { select: { id: true, name: true, email: true } },
              },
              take: 3,
            },
          },
        },
      },
    });

    // 各ルームの未読メッセージと最新メッセージを取得
    const unreadRooms: {
      roomId: string;
      roomType: string;
      roomTitle: string | null;
      partnerName: string | null;
      unreadCount: number;
      latestMessage: {
        id: string;
        content: string;
        senderName: string | null;
        createdAt: string;
      } | null;
    }[] = [];

    let totalUnread = 0;

    for (const m of memberships) {
      const lastSeenAt = m.lastSeenAt ?? new Date(0);

      // 未読メッセージ数
      const unreadCount = await prisma.chatRoomMessage.count({
        where: {
          roomId: m.roomId,
          senderId: { not: user.id },
          createdAt: { gt: lastSeenAt },
        },
      });

      if (unreadCount === 0) continue;

      totalUnread += unreadCount;

      // 最新メッセージを取得
      const latestMsg = await prisma.chatRoomMessage.findFirst({
        where: {
          roomId: m.roomId,
          senderId: { not: user.id },
          createdAt: { gt: lastSeenAt },
        },
        orderBy: { createdAt: "desc" },
        include: {
          sender: { select: { id: true, name: true, email: true } },
        },
      });

      // DM の場合は相手の名前をルームタイトルとして使用
      let displayTitle = m.room.title;
      let partnerName: string | null = null;
      if (m.room.type === "dm" && m.room.members.length > 0) {
        const partner = m.room.members[0]?.user;
        partnerName = partner?.name ?? partner?.email ?? "Unknown";
        displayTitle = partnerName;
      }

      unreadRooms.push({
        roomId: m.roomId,
        roomType: m.room.type,
        roomTitle: displayTitle,
        partnerName,
        unreadCount,
        latestMessage: latestMsg
          ? {
              id: latestMsg.id,
              content: latestMsg.content.slice(0, 100), // プレビュー用に100文字まで
              senderName: latestMsg.sender?.name ?? latestMsg.sender?.email ?? "Unknown",
              createdAt: latestMsg.createdAt.toISOString(),
            }
          : null,
      });
    }

    // 未読数の多い順にソート
    unreadRooms.sort((a, b) => b.unreadCount - a.unreadCount);

    // システム通知（将来拡張用）
    const systemNotifications: {
      id: string;
      type: string;
      title: string;
      message: string;
      createdAt: string;
      isRead: boolean;
    }[] = [];

    // 今日のクエスト未完了の通知を追加
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const pendingQuests = await prisma.questProgress.count({
      where: {
        userId: user.id,
        quest: {
          isActive: true,
        },
        assignedDate: today,
        isCompleted: false,
      },
    });

    if (pendingQuests > 0) {
      systemNotifications.push({
        id: "quest-reminder",
        type: "quest",
        title: "クエストリマインダー",
        message: `本日のクエストが${pendingQuests}件残っています`,
        createdAt: new Date().toISOString(),
        isRead: false,
      });
    }

    // 未回収の実績報酬
    const unclaimedAchievements = await prisma.userAchievement.count({
      where: {
        userId: user.id,
        isCompleted: true,
        isRewardClaimed: false,
      },
    });

    if (unclaimedAchievements > 0) {
      systemNotifications.push({
        id: "achievement-reward",
        type: "achievement",
        title: "実績報酬",
        message: `${unclaimedAchievements}件の実績報酬が未回収です`,
        createdAt: new Date().toISOString(),
        isRead: false,
      });
    }

    return NextResponse.json({
      totalUnreadMessages: totalUnread,
      unreadRooms: unreadRooms.slice(0, 5), // 最大5件
      systemNotifications,
      totalNotifications: totalUnread + systemNotifications.length,
    });
  } catch (error) {
    console.error("GET /api/dashboard/notifications error", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
