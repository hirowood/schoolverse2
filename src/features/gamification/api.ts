// Client-side API helper for gamification (profile / achievements / xp history)
// Components & stores should call these instead of fetch directly.
import type {
  AchievementsResponse,
  ClaimRewardResponse,
  GamificationFilters,
  ProfileResponse,
  XpHistoryResponse,
} from "@/types/gamification";

export interface GamificationApiError extends Error {
  status?: number;
}

const createApiError = (status: number, message?: string): GamificationApiError => {
  const error = new Error(message ?? `Request failed (${status})`) as GamificationApiError;
  error.status = status;
  return error;
};

const requestJson = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const res = await fetch(path, { cache: "no-store", ...init });
  if (!res.ok) {
    const body = await res.json().catch(() => undefined);
    const message = body && typeof body.message === "string" ? body.message : undefined;
    throw createApiError(res.status, message);
  }
  return (await res.json()) as T;
};

export const fetchProfile = () => requestJson<ProfileResponse>("/api/gamification/profile");

export const fetchAchievements = (filters?: Partial<GamificationFilters>) => {
  const params = new URLSearchParams();
  if (filters?.category && filters.category !== "all") params.append("category", filters.category);
  if (filters?.status && filters.status !== "all") params.append("status", filters.status);
  const query = params.toString();
  const url = query ? `/api/gamification/achievements?${query}` : "/api/gamification/achievements";
  return requestJson<AchievementsResponse>(url);
};

export const claimReward = (achievementId: string) =>
  requestJson<ClaimRewardResponse>("/api/gamification/claim-reward", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ achievementId }),
  });

export const claimAllRewards = (achievementIds: string[]) =>
  requestJson<ClaimRewardResponse>("/api/gamification/claim-all-rewards", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ achievementIds }),
  });

export const fetchXpHistory = () => requestJson<XpHistoryResponse>("/api/gamification/xp-history");

