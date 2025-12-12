"use client";

import dynamic from "next/dynamic";
import { FormEvent, useEffect, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { Modal } from "@/components/ui/Modal";

const Canvas3D = dynamic(
  () => import("@/components/virtual-classroom/Room3D/Canvas3D").then((m) => m.Canvas3D),
  {
    ssr: false,
    loading: () => (
      <div className="h-[320px] w-full rounded-2xl border border-slate-800 bg-slate-900/40 shadow-inner" />
    ),
  },
);

export default function HomePage() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const demoEmail = "demo@example.com";
  const demoPassword = "demo1234";
  const [email, setEmail] = useState(demoEmail);
  const [password, setPassword] = useState(demoPassword);
  const [showPassword, setShowPassword] = useState(true);
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

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl: "/credo",
    });
    if (!res || res.error) {
      setError("サインインに失敗しました。デモの場合は demo@example.com / demo1234 をお試しください。");
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center gap-10 px-4 py-10 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-100">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Mobile Ready
          </div>
          <a
            href="/curriculum-map"
            className="rounded-lg border border-slate-200/30 bg-white/10 px-4 py-2 text-sm font-semibold text-slate-50 shadow-sm transition hover:-translate-y-0.5 hover:bg-white/20"
          >
            カリキュラムマップへ
          </a>
        </div>

        <section className="grid gap-8 lg:grid-cols-[1.05fr,1fr] lg:items-center">
          <div className="space-y-5 lg:space-y-6">
            <div className="space-y-3">
              <h1 className="text-3xl font-bold sm:text-4xl">Schoolverse2</h1>
              <p className="text-lg text-slate-100 sm:text-xl">「AI学習コーチ × クレド実践」のための学びのハブ</p>
              <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
                今日の一歩と小さな改善を積み上げる場所です。スマホでも見やすいカードレイアウトで、どこからでも学習を再開できます。
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-200">AI Coaching</p>
                <p className="mt-1 text-sm text-slate-200">日々のクエストや対話で伴走するAIコーチ</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-200">Credo & Habit</p>
                <p className="mt-1 text-sm text-slate-200">クレド実践を記録し、小さな習慣を積み上げる</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                ログイン / 新規登録
              </button>
              <a
                href="/virtual-classroom"
                className="rounded-lg border border-emerald-300/60 bg-emerald-500/20 px-4 py-2.5 text-sm font-semibold text-emerald-100 transition hover:-translate-y-0.5 hover:bg-emerald-500/30"
              >
                教室プレビューを見る
              </a>
            </div>

            {session?.user && (
              <div className="inline-flex flex-wrap items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="font-semibold">サインイン中: {session.user.email}</span>
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="rounded border border-white/20 px-2 py-1 text-[11px] font-semibold text-white transition hover:bg-white/10"
                >
                  サインアウト
                </button>
              </div>
            )}
          </div>

          <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-[0_20px_60px_-35px_rgba(0,0,0,0.8)]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Virtual Classroom</p>
                <h2 className="text-lg font-bold text-white">教室の3Dプレビュー</h2>
                <p className="text-sm text-slate-300">モバイルでもすぐに雰囲気を確認できます。</p>
              </div>
              <a
                href="/virtual-classroom"
                className="rounded-md border border-emerald-300/60 bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-100 hover:bg-emerald-500/30"
              >
                もっと見る
              </a>
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/70 p-2">
              <Canvas3D />
            </div>
          </div>
        </section>
      </div>

      <Modal
        open={open}
        title={mode === "signin" ? "サインイン" : "新規登録"}
        onClose={() => setOpen(false)}
        footer={
          <div className="flex flex-wrap items-center justify-end gap-2">
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
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              placeholder={demoEmail}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-800" htmlFor="home-password">
              パスワード
            </label>
            <input
              id="home-password"
              type={showPassword ? "text" : "password"}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              minLength={8}
              required
              placeholder={demoPassword}
            />
            <div className="flex items-center justify-between text-[11px] text-slate-600">
              <span>8文字以上のパスワードを入力してください。</span>
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-slate-700 underline"
              >
                {showPassword ? "隠す" : "表示"}
              </button>
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <p className="text-xs text-slate-500">デモ: email={demoEmail} / password={demoPassword}</p>
        </form>
      </Modal>
    </main>
  );
}
