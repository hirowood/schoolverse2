export type ClassValue = string | undefined | null | false;

// Tailwind の className を安全に結合する最小ヘルパー（依存追加なし）
// - clsx/tailwind-merge を入れない方針の時に使う
// - 競合するユーティリティの解決（例: bg-white と bg-blue-500 のどちらを採用するか）は行わない
export function cn(...classes: ClassValue[]) {
  return classes.filter((c): c is string => typeof c === "string" && c.length > 0).join(" ");
}

