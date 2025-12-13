import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Shared Supabase client for User Chat.
 *
 * Why this exists:
 * - user-chat は Presence/Realtime のためブラウザ側で Supabase を使う
 * - 同一タブ内で複数回 createClient しないように共有する（責務分離 + パフォーマンス）
 *
 * Reuse:
 * - 他プロジェクトへ移植する場合は、storageKey やヘッダだけ変更すれば利用できます。
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function getSharedUserChatClient(): SupabaseClient | null {
  if (typeof window === "undefined" || !SUPABASE_URL || !SUPABASE_ANON_KEY) return null;

  const g = globalThis as typeof globalThis & { __sbUserChatClient?: SupabaseClient };
  if (g.__sbUserChatClient) return g.__sbUserChatClient;

  g.__sbUserChatClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      storageKey: "sb-schoolverse2-userchat",
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        "X-Client-Context": "userchat",
      },
    },
  });

  return g.__sbUserChatClient;
}

