"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  message: string;
  createdAt: string;
};

export default function Page() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);
  const [plan, setPlan] = useState<{
    tasks: string[];
    focus: string;
    message: string;
    recommendedTime: string;
  } | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setInitialLoading(true);
        const res = await fetch("/api/coach/chat");
        if (res.status === 401) {
          setError("サインインしてください");
          return;
        }
        if (!res.ok) throw new Error(`failed ${res.status}`);
        const data = (await res.json()) as { messages: ChatMessage[] };
        setMessages(data.messages);
        setError(null);
      } catch (e) {
        console.error(e);
        setError("履歴の取得に失敗しました");
      } finally {
        setInitialLoading(false);
      }
    };
    fetchHistory();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput("");
    setError(null);
    setLoading(true);

    const optimisticUser: ChatMessage = {
      id: `temp-user-${Date.now()}`,
      role: "user",
      message: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticUser]);

    try {
      const res = await fetch("/api/coach/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      if (res.status === 401) {
        setError("サインインしてください");
        return;
      }
      if (!res.ok) throw new Error(`failed ${res.status}`);
      const data = (await res.json()) as { userMessage: ChatMessage; assistantMessage: ChatMessage };
      setMessages((prev) => [
        ...prev.filter((m) => !m.id.startsWith("temp-user-")),
        data.userMessage,
        data.assistantMessage,
      ]);
    } catch (err) {
      console.error(err);
      setError("送信に失敗しました");
      setMessages((prev) => prev.filter((m) => !m.id.startsWith("temp-user-")));
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePlan = async () => {
    setPlanError(null);
    setPlanLoading(true);
    try {
      const res = await fetch("/api/coach/plan", { method: "POST" });
      if (res.status === 401) {
        setPlanError("サインインしてください");
        return;
      }
      if (!res.ok) throw new Error(`failed ${res.status}`);
      const data = (await res.json()) as {
        plan: { tasks: string[]; focus: string; message: string; recommendedTime: string };
      };
      setPlan(data.plan);
    } catch (e) {
      console.error(e);
      setPlanError("プラン生成に失敗しました。しばらく待ってから再試行してください。");
    } finally {
      setPlanLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <header className="space-y-1">
        <p className="text-xs font-medium text-slate-500">AI Coach</p>
        <h1 className="text-2xl font-semibold">AIコーチ</h1>
        <p className="text-sm text-slate-600">
          今日の課題や気分を送ると、クレドに沿った一歩を提案します。
        </p>
      </header>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-sm space-y-2">
        <p className="text-xs font-semibold text-slate-700">使い方ガイド</p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
          <li>今日やりたいこと、困りごと、気分を短く送ってみてください。</li>
          <li>クレド実践の振り返りや、次にやる一歩を相談できます。</li>
          <li>学習計画ボタンで、設定値＋クレド状況から今日のプランを生成します。</li>
        </ul>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleGeneratePlan}
            disabled={planLoading}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {planLoading ? "生成中..." : "AIに今日の学習計画を作らせる"}
          </button>
          {planError && <p className="text-sm text-red-500">{planError}</p>}
        </div>
        {plan && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-2">
            <p className="text-xs font-medium text-slate-500">今日のプラン</p>
            <div>
              <p className="text-sm font-semibold text-slate-900">📘 今日の学習タスク</p>
              <ol className="mt-1 list-decimal space-y-1 pl-5 text-sm text-slate-700">
                {plan.tasks.map((t, i) => (
                  <li key={`${t}-${i}`}>{t}</li>
                ))}
              </ol>
            </div>
            <p className="text-sm text-slate-700">⏰ 推奨時間帯: {plan.recommendedTime}</p>
            <p className="text-sm text-slate-700">🎯 今週の重点: {plan.focus}</p>
            <p className="text-sm text-slate-700">💬 コーチから: {plan.message}</p>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="h-[480px] overflow-y-auto p-4 space-y-3">
          {initialLoading && (
            <div className="space-y-2 text-sm text-slate-500">
              <p>読み込み中...（例:「英語の勉強のコツは？」などを送れます）</p>
            </div>
          )}
          {error && (
            <div className="space-y-1">
              <p className="text-sm text-red-500">{error}</p>
              <p className="text-xs text-slate-500">
                再読み込みするか、サインイン状態を確認してから再度お試しください。
              </p>
            </div>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 text-sm shadow-sm ${
                  msg.role === "user"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-900"
                }`}
              >
                {msg.message}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <form onSubmit={handleSubmit} className="border-t border-slate-200 p-3">
          <div className="flex items-end gap-2">
            <textarea
              className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500"
              rows={2}
              maxLength={500}
              placeholder="例: 数学の苦手をどう克服すればいい？ / 今日の気分は少しだるい"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="h-10 rounded-md bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
            >
              {loading ? "送信中..." : "送信"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
