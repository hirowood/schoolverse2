"use client";

import { FormEvent, useEffect, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { Modal } from "@/components/ui/Modal";

export default function HomePage() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("demo");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      setOpen(true);
    } else if (status === "authenticated") {
      setOpen(false);
      setError(null);
    }
  }, [status]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === "signup") {
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim() || undefined, email, password }),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          if (data.error === "already_exists") {
            setError("このメールアドレスは既に登録されています。");
          } else if (data.error === "invalid_input") {
            setError("入力内容を確認してください（パスワードは8文字以上）。");
          } else {
            setError("新規登録に失敗しました。");
          }
          setLoading(false);
          return;
        }
        // 登録成功 → そのままサインイン
        const signInRes = await signIn("credentials", {
          redirect: false,
          email,
          password,
          callbackUrl: "/credo",
        });
        if (signInRes?.error) {
          setError("登録は成功しましたが、サインインに失敗しました。もう一度お試しください。");
        }
      } catch (err) {
        console.error(err);
        setError("新規登録に失敗しました。");
      } finally {
        setLoading(false);
      }
      return;
    }

    // signin
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl: "/credo",
    });
    if (!res || res.error) {
      setError("サインインに失敗しました。デモの場合は demo/demo をお試しください。");
    }
    setLoading(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-slate-50 px-4">
      <div className="max-w-2xl text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold">Schoolverse2</h1>
        <p className="text-lg">「AI学習コーチ × クレド実践」のための学びのハブ</p>
        <p className="text-sm text-slate-300">
          今日の一歩と小さな改善を積み上げる場所です。クレド実践ボードとAIコーチを使うにはサインインしてください。
        </p>
        {session?.user && (
          <div className="text-sm text-slate-300">
            サインイン中: {session.user.email}
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="ml-3 rounded-md border border-slate-400 px-3 py-1 text-xs hover:bg-slate-800"
            >
              サインアウト
            </button>
          </div>
        )}
      </div>

      <Modal
        open={open}
        title=""
        onClose={() => setOpen(false)}
        footer={
          <div className="flex flex-wrap justify-end items-center gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-700 hover:bg-slate-50"
            >
              閉じる
            </button>
            <button
              type="submit"
              form="home-auth-form"
              disabled={loading}
              className="rounded-md bg-slate-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {loading ? "送信中..." : mode === "signin" ? "サインイン" : "登録してサインイン"}
            </button>
          </div>
        }
      >
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            type="button"
            onClick={() => setMode("signin")}
            className={`rounded-md px-3 py-2 text-sm font-medium ${
              mode === "signin" ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            ログイン
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`rounded-md px-3 py-2 text-sm font-medium ${
              mode === "signup" ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            新規登録
          </button>
        </div>

        <form id="home-auth-form" onSubmit={handleSubmit} className="space-y-3 pt-3">
          {mode === "signup" && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-800" htmlFor="home-name">
                ニックネーム（任意）
              </label>
              <input
                id="home-name"
                type="text"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>
          )}
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-800" htmlFor="home-email">
              メールアドレス
            </label>
            <input
              id="home-email"
              type="email"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-800" htmlFor="home-password">
              パスワード
            </label>
            <input
              id="home-password"
              type="password"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              minLength={8}
              required
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <p className="text-xs text-slate-500">デモ: email=demo@example.com / password=demo</p>
        </form>
      </Modal>
    </main>
  );
}
