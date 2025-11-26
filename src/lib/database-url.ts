/**
 * DATABASE_URLからDIRECT_URLを自動生成するユーティリティ
 * Supabaseの場合、pooler URL (port 6543) から直接接続URL (port 5432) を生成
 */
export function getDatabaseUrls() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
  }

  // DIRECT_URLが設定されていればそれを使用、なければDATABASE_URLから生成
  let directUrl = process.env.DIRECT_URL;

  if (!directUrl) {
    // Supabase pooler URL を直接接続URLに変換
    // postgresql://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:6543/postgres
    // → postgresql://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:5432/postgres
    directUrl = databaseUrl
      .replace(":6543/", ":5432/")
      .replace("?pgbouncer=true", "");
  }

  return {
    databaseUrl,
    directUrl,
  };
}
