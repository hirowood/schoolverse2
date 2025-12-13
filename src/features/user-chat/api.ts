import type {
  ChatRoom,
  ChatRoomMessage,
  ChatRoomType,
  MessageListResponse,
  RoomListResponse,
  UserPreview,
} from "./types";

/**
 * User Chat API client (browser-side).
 *
 * Goal:
 * - UI/hooks から fetch 実装を分離（責務分離）
 * - `/api/user-chat/...` をリソース指向（RESTful）にまとめて呼び出す
 * - 戻り値を型付けして型安全を確保する
 */

type ApiErrorBody = { error?: string; message?: string; retryAfter?: number };

const BASE = "/api/user-chat";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const mapErrorToMessage = (body: ApiErrorBody, status: number): string => {
  // サーバーの `error` コードは user-chat の API route で統一されている前提
  switch (body.error) {
    case "unauthorized":
      return "ログインが必要です";
    case "forbidden":
      return "このルームにアクセスできません";
    case "rate_limited": {
      const retry =
        typeof body.retryAfter === "number" ? `（${Math.ceil(body.retryAfter)}秒後に再試行）` : "";
      return `アクセスが集中しています。少し待ってから再試行してください${retry}`;
    }
    case "invalid_query":
      return "リクエスト内容が正しくありません";
    case "invalid_json":
      return "送信データの形式が正しくありません";
    case "invalid_body":
      return "入力内容が正しくありません";
    case "dm_requires_single_partner":
      return "DMは1人の相手を指定してください";
    case "internal_error":
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

export async function listRooms(params?: {
  type?: ChatRoomType | "all";
  limit?: number;
  cursor?: string;
}): Promise<RoomListResponse> {
  const qs = new URLSearchParams();
  if (params?.type && params.type !== "all") qs.set("type", params.type);
  if (typeof params?.limit === "number") qs.set("limit", String(params.limit));
  if (params?.cursor) qs.set("cursor", params.cursor);
  const q = qs.toString();
  return fetchJson<RoomListResponse>(`${BASE}/rooms${q ? `?${q}` : ""}`);
}

export async function createRoom(payload: {
  type: ChatRoomType;
  participantIds: string[];
  title?: string | null;
}): Promise<{ room: ChatRoom }> {
  return fetchJson<{ room: ChatRoom }>(`${BASE}/rooms`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function listRoomMessages(
  roomId: string,
  params?: { limit?: number; cursor?: string },
): Promise<MessageListResponse> {
  const qs = new URLSearchParams();
  if (typeof params?.limit === "number") qs.set("limit", String(params.limit));
  if (params?.cursor) qs.set("cursor", params.cursor);
  const q = qs.toString();
  return fetchJson<MessageListResponse>(`${BASE}/rooms/${roomId}/messages${q ? `?${q}` : ""}`);
}

export async function sendRoomMessage(
  roomId: string,
  payload: { content: string },
): Promise<{ message: ChatRoomMessage }> {
  return fetchJson<{ message: ChatRoomMessage }>(`${BASE}/rooms/${roomId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

// NOTE: /read は動詞を含むが、既存APIと互換のためそのまま利用
export async function markRoomRead(roomId: string, payload: { messageId: string }): Promise<{ ok: true }> {
  return fetchJson<{ ok: true }>(`${BASE}/rooms/${roomId}/read`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function listUnreadCounts(): Promise<{ counts: Record<string, number> }> {
  return fetchJson<{ counts: Record<string, number> }>(`${BASE}/rooms/unread-counts`);
}

export async function searchUsers(params: { q: string; limit?: number }): Promise<{ users: UserPreview[] }> {
  const qs = new URLSearchParams();
  qs.set("q", params.q);
  qs.set("limit", String(params.limit ?? 20));
  return fetchJson<{ users: UserPreview[] }>(`${BASE}/search-users?${qs.toString()}`);
}
