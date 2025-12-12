import type {
  ChatMode,
  CreateSessionPayload,
  LearningChatSession,
  MessagesListResponse,
  SendMessagePayload,
  SessionListResponse,
  UpdateSessionPayload,
} from "./types";

/**
 * Learning Chat API client (browser-side).
 *
 * - Keeps UI components/Provider free from `fetch(...)` details (責務分離)
 * - Encapsulates "resource-oriented" endpoints (RESTful)
 * - Typed return values help avoid accidental `any`
 *
 * Endpoints used:
 * - GET/POST   `/api/learning-chat/sessions`
 * - GET/PATCH  `/api/learning-chat/sessions/[sessionId]`
 * - GET/POST   `/api/learning-chat/sessions/[sessionId]/messages`
 */

type ApiErrorBody = { error?: string; message?: string; retryAfter?: number };

const BASE = "/api/learning-chat";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const mapErrorToMessage = (body: ApiErrorBody, status: number): string => {
  // `body.error` がサーバー側のエラーコード（resource-orientedなAPIの返却）を想定
  // 分岐は switch の方が読みやすいのでこちらに寄せる
  switch (body.error) {
    case "unauthorized":
      return "ログインが必要です";
    case "rate_limited": {
      const retry =
        typeof body.retryAfter === "number" ? `（${Math.ceil(body.retryAfter)}秒後に再試行）` : "";
      return `アクセスが集中しています。少し待ってから再試行してください${retry}`;
    }
    case "not_found":
      return "セッションが見つかりませんでした";
    case "invalid_query":
      return "リクエスト内容が正しくありません";
    case "invalid_body":
      return "入力内容が正しくありません";
    case "invalid_json":
      return "送信データの形式が正しくありません";
    default:
      // サーバーが message を返す場合はそれを優先（UI側での汎用ハンドリング）
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

export async function listSessions(params?: {
  mode?: ChatMode | "all";
  limit?: number;
  cursor?: string;
}): Promise<SessionListResponse> {
  const qs = new URLSearchParams();
  if (params?.mode && params.mode !== "all") qs.set("mode", params.mode);
  if (typeof params?.limit === "number") qs.set("limit", String(params.limit));
  if (params?.cursor) qs.set("cursor", params.cursor);
  const q = qs.toString();
  return fetchJson<SessionListResponse>(`${BASE}/sessions${q ? `?${q}` : ""}`);
}

export async function createSession(payload: CreateSessionPayload): Promise<{ session: LearningChatSession }> {
  return fetchJson<{ session: LearningChatSession }>(`${BASE}/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function listMessages(
  sessionId: string,
  params?: { limit?: number; before?: string },
): Promise<MessagesListResponse> {
  const qs = new URLSearchParams();
  if (typeof params?.limit === "number") qs.set("limit", String(params.limit));
  if (params?.before) qs.set("before", params.before);
  const q = qs.toString();
  return fetchJson<MessagesListResponse>(`${BASE}/sessions/${sessionId}/messages${q ? `?${q}` : ""}`);
}

/**
 * POST a message and receive an SSE stream response.
 * (The caller should consume `res.body` via an SSE utility.)
 */
export async function postMessageStream(sessionId: string, payload: SendMessagePayload): Promise<Response> {
  const res = await fetch(`${BASE}/sessions/${sessionId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await readApiError(res));
  return res;
}

export async function updateSession(
  sessionId: string,
  payload: UpdateSessionPayload,
): Promise<{ session: LearningChatSession }> {
  return fetchJson<{ session: LearningChatSession }>(`${BASE}/sessions/${sessionId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function deleteSession(sessionId: string): Promise<{ ok: true }> {
  return fetchJson<{ ok: true }>(`${BASE}/sessions/${sessionId}`, { method: "DELETE" });
}
