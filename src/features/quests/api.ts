import type {
  CompleteQuestPayload,
  QuestActionResponse,
  QuestRegenerateOptions,
  TodayQuestsResponse,
} from "@/types/quest";

export interface QuestApiError extends Error {
  status: number;
}

// 共通のfetchラッパー（REST風のエンドポイントを型安全に叩く）
const requestJson = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(path, { cache: "no-store", ...init });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message =
      body && typeof body.message === "string" && body.message.trim().length > 0
        ? body.message
        : `Request failed (${response.status})`;
    const error: QuestApiError = Object.assign(new Error(message), { status: response.status });
    throw error;
  }
  return (await response.json()) as T;
};

export interface QuestApiClient {
  fetchTodayQuests: () => Promise<TodayQuestsResponse>;
  regenerateTodayQuests: (options?: QuestRegenerateOptions) => Promise<TodayQuestsResponse>;
  acceptQuest: (id: string) => Promise<QuestActionResponse>;
  startQuest: (id: string) => Promise<QuestActionResponse>;
  completeQuest: (id: string, payload?: CompleteQuestPayload) => Promise<QuestActionResponse>;
  skipQuest: (id: string, reason?: string) => Promise<QuestActionResponse>;
}

export const questApiClient: QuestApiClient = {
  fetchTodayQuests: () => requestJson<TodayQuestsResponse>("/api/quests/today"),

  regenerateTodayQuests: (options) =>
    requestJson<TodayQuestsResponse>("/api/quests/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(options ?? {}),
    }),

  acceptQuest: (id) =>
    requestJson<QuestActionResponse>(`/api/quests/${id}/accept`, {
      method: "POST",
    }),

  startQuest: (id) =>
    requestJson<QuestActionResponse>(`/api/quests/${id}/start`, {
      method: "POST",
    }),

  completeQuest: (id, payload) =>
    requestJson<QuestActionResponse>(`/api/quests/${id}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload ?? {}),
    }),

  skipQuest: (id, reason) =>
    requestJson<QuestActionResponse>(`/api/quests/${id}/skip`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    }),
};
