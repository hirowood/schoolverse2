"use client";

import { FormEvent, useEffect, useState } from "react";

type Profile = {
  name: string;
  weeklyGoal: string;
  activeHours: "morning" | "day" | "evening";
  coachTone: "gentle" | "logical";
  pomodoroEnabled: boolean;
  pomodoroWorkMinutes: number;
  pomodoroBreakMinutes: number;
};

type ProfileResponse = Partial<Profile>;

const DEFAULT_PROFILE: Profile = {
  name: "",
  weeklyGoal: "",
  activeHours: "day",
  coachTone: "gentle",
  pomodoroEnabled: false,
  pomodoroWorkMinutes: 25,
  pomodoroBreakMinutes: 5,
};

export default function Page() {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/settings/profile");
        if (!res.ok) throw new Error(`failed ${res.status}`);
        const data = (await res.json()) as ProfileResponse;
        setProfile({
          name: data.name ?? "",
          weeklyGoal: data.weeklyGoal ?? "",
          activeHours: (data.activeHours as Profile["activeHours"]) ?? "day",
          coachTone: (data.coachTone as Profile["coachTone"]) ?? "gentle",
          pomodoroEnabled: Boolean(data.pomodoroEnabled ?? false),
          pomodoroWorkMinutes: Number(data.pomodoroWorkMinutes ?? 25),
          pomodoroBreakMinutes: Number(data.pomodoroBreakMinutes ?? 5),
        });
        setError(null);
      } catch (e) {
        console.error(e);
        setError("設定の読み込みに失敗しました");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch("/api/settings/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (!res.ok) throw new Error(`failed ${res.status}`);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError("保存に失敗しました");
    } finally {
      setSaving(false);
      setTimeout(() => setSuccess(false), 1500);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">設定</h1>
      <p className="text-slate-700">
        AIコーチのパーソナライズに使う情報を設定します。学習計画生成やチャットに反映されます。
      </p>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-slate-800">
            ニックネーム
          </label>
          <input
            id="name"
            type="text"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={profile.name}
            onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="weeklyGoal" className="text-sm font-medium text-slate-800">
            週次学習目標
          </label>
          <textarea
            id="weeklyGoal"
            rows={2}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={profile.weeklyGoal}
            onChange={(e) => setProfile((p) => ({ ...p, weeklyGoal: e.target.value }))}
            placeholder="例: 英単語を毎日20個覚える / 数学の問題集を10問進める"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="activeHours" className="text-sm font-medium text-slate-800">
              好きな学習時間帯
            </label>
            <select
              id="activeHours"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={profile.activeHours}
              onChange={(e) =>
                setProfile((p) => ({ ...p, activeHours: e.target.value as Profile["activeHours"] }))
              }
            >
              <option value="morning">朝（6-9時）</option>
              <option value="day">昼（12-15時）</option>
              <option value="evening">夕方〜夜（18-21時）</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="coachTone" className="text-sm font-medium text-slate-800">
              コーチの口調
            </label>
            <select
              id="coachTone"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={profile.coachTone}
              onChange={(e) =>
                setProfile((p) => ({ ...p, coachTone: e.target.value as Profile["coachTone"] }))
              }
            >
              <option value="gentle">やさしい</option>
              <option value="logical">ロジカル</option>
            </select>
          </div>
        </div>

        <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-800">ポモドーロタイマー</p>
              <p className="text-xs text-slate-600">作業・休憩のサイクル時間を設定します</p>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-800">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-slate-900"
                checked={profile.pomodoroEnabled}
                onChange={(e) => setProfile((p) => ({ ...p, pomodoroEnabled: e.target.checked }))}
              />
              ON/OFF
            </label>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <label htmlFor="pomodoro-work" className="text-xs font-medium text-slate-700">
                作業時間（分）
              </label>
              <input
                id="pomodoro-work"
                type="number"
                min={1}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                value={profile.pomodoroWorkMinutes}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, pomodoroWorkMinutes: Number(e.target.value) || 0 }))
                }
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="pomodoro-break" className="text-xs font-medium text-slate-700">
                休憩時間（分）
              </label>
              <input
                id="pomodoro-break"
                type="number"
                min={1}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                value={profile.pomodoroBreakMinutes}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, pomodoroBreakMinutes: Number(e.target.value) || 0 }))
                }
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {saving ? "保存中..." : "保存する"}
          </button>
          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && <p className="text-sm text-emerald-600">保存しました</p>}
          {loading && <p className="text-sm text-slate-500">読み込み中...</p>}
        </div>
      </form>
    </div>
  );
}
