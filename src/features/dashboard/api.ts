import type { DashboardSummary } from "@/lib/dashboard/types";

/**
 * Dashboard API client (browser-side).
 *
 * - UI/hooks から fetch 実装を分離（責務分離）
 * - `/api/dashboard/...` をリソース指向（RESTful）にまとめて呼び出す
 * - 返却値を型付けして型安全を確保する
 */

interface ApiErrorBody {
  error?: string;
  message?: string;
  retryAfter?: number;
}

const BASE = "/api/dashboard";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const mapErrorToMessage = (body: ApiErrorBody, status: number): string => {
  switch (body.error) {
    case "unauthorized":
    case "Unauthorized":
      return "ログインが必要です";
    case "rate_limited": {
      const retry =
        typeof body.retryAfter === "number" ? `（${Math.ceil(body.retryAfter)}秒後に再試行）` : "";
      return `アクセスが集中しています。少し待ってから再試行してください${retry}`;
    }
    case "internal_error":
    case "Internal Server Error":
      return "サーバーエラーが発生しました。時間をおいて再試行してください";
    default:
      if (typeof body.message === "string" && body.message.trim().length > 0) return body.message;
      return `Request failed (${status})`;
  }
};

async function readApiError(res: Response): Promise<string> {
  try {
    const json: unknown = await res.json();
    if (!isRecord(json)) return `Request failed (${res.status})`;
    const body: ApiErrorBody = {
      error: typeof json.error === "string" ? json.error : undefined,
      message: typeof json.message === "string" ? json.message : undefined,
      retryAfter: typeof json.retryAfter === "number" ? json.retryAfter : undefined,
    };
    return mapErrorToMessage(body, res.status);
  } catch {
    return `Request failed (${res.status})`;
  }
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { cache: "no-store", ...init });
  if (!res.ok) throw new Error(await readApiError(res));
  return (await res.json()) as T;
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  return fetchJson<DashboardSummary>(`${BASE}/summary`);
}

export interface DashboardNotificationsData {
  totalUnreadMessages: number;
  unreadRooms: DashboardUnreadRoom[];
  systemNotifications: DashboardSystemNotification[];
  totalNotifications: number;
}

export interface DashboardUnreadRoom {
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
}

export interface DashboardSystemNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

export async function getDashboardNotifications(): Promise<DashboardNotificationsData> {
  return fetchJson<DashboardNotificationsData>(`${BASE}/notifications`);
}

