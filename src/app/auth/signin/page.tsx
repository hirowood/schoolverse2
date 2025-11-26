"use client";

import Link from "next/link";
import { FormEvent, Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

const SignInContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/credo";

  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("demo");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl,
    });

    if (!res || res.error) {
      setError("サインインに失敗しました。デモの場合は \"demo\" でお試しください。");
      setLoading(false);
      return;
    }

    router.push(res.url ?? callbackUrl);
  };

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4">
      <div className="space-y-1">
        <p className="text-xs font-medium text-slate-500">Access</p>
        <h1 className="text-2xl font-semibold">サインイン</h1>
        <p className="text-sm text-slate-600">
          デモアカウントは「email: demo@example.com / password: demo」です。
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-slate-800">
            メールアドレス
          </label>
          <input
            id="email"
            type="email"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-slate-800">
            パスワード
          </label>
          <input
            id="password"
            type="password"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
          >
            もどる
          </button>
          <Link href="/auth/signup" className="text-sm text-slate-700 underline-offset-2 hover:underline">
            新規登録
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-slate-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? "サインイン中..." : "サインイン"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="p-4 text-sm text-slate-600">読み込み中...</div>}>
      <SignInContent />
    </Suspense>
  );
}
