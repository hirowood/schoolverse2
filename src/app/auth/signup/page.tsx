"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setDone(false);
    if (password !== confirm) {
      setError("パスワードが一致しません。");
      return;
    }
    if (password.length < 8) {
      setError("パスワードは8文字以上にしてください。");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        if (data.error === "already_exists") {
          setError("このメールアドレスは既に登録されています。");
        } else if (data.error === "invalid_input") {
          setError("入力内容を確認してください。");
        } else {
          setError("登録に失敗しました。");
        }
        return;
      }
      setDone(true);
      setTimeout(() => router.push("/auth/signin"), 600);
    } catch (err) {
      console.error(err);
      setError("登録に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4">
      <div className="space-y-1">
        <p className="text-xs font-medium text-slate-600">Create account</p>
        <h1 className="text-2xl font-semibold text-slate-900">サインアップ</h1>
        <p className="text-sm text-slate-700">
          メールとパスワードを登録すると、学習プランなどが保存できます。デモ用: email{" "}
          <span className="font-semibold text-slate-900">demo@example.com</span> / password{" "}
          <span className="font-semibold text-slate-900">demo1234</span>（8文字）
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-slate-800">
            名前（任意）
          </label>
          <input
            id="name"
            type="text"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-slate-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="山田 太郎"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-slate-800">
            メールアドレス
          </label>
          <input
            id="email"
            type="email"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-slate-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            placeholder="demo@example.com"
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-slate-800">
              パスワード
            </label>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-slate-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="8文字以上（例: demo1234）"
            />
            <div className="flex items-center justify-between text-[11px] text-slate-600">
              <span>英数字を組み合わせてください。</span>
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-slate-700 underline"
              >
                {showPassword ? "隠す" : "表示"}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="confirm" className="text-sm font-medium text-slate-800">
              パスワード（確認）
            </label>
            <input
              id="confirm"
              type={showConfirm ? "text" : "password"}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-slate-500"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="同じパスワードを再入力"
            />
            <div className="flex items-center justify-end text-[11px] text-slate-600">
              <button
                type="button"
                onClick={() => setShowConfirm((prev) => !prev)}
                className="text-slate-700 underline"
              >
                {showConfirm ? "隠す" : "表示"}
              </button>
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {done && <p className="text-sm text-emerald-600">登録が完了しました。サインインできます。</p>}

        <div className="flex items-center justify-between gap-2">
          <Link href="/auth/signin" className="text-sm text-slate-700 underline-offset-2 hover:underline">
            サインインへ戻る
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-slate-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? "登録中..." : "登録する"}
          </button>
        </div>
      </form>
    </div>
  );
}
