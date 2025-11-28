"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types";
import CameraCapture from "@/components/notes/CameraCapture";

const Excalidraw = dynamic(
  () => import("@excalidraw/excalidraw").then((mod) => mod.Excalidraw),
  { ssr: false }
);

type SceneSnapshot = {
  elements: readonly unknown[];
  appState: Record<string, unknown>;
};

const CANVAS_TEMPLATE = "canvas";

export default function CanvasPage() {
  const apiRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryNoteId = searchParams.get("noteId") ?? undefined;
  const [noteId, setNoteId] = useState<string | undefined>(queryNoteId);
  const [initialScene, setInitialScene] = useState<SceneSnapshot | null>(null);
  const [loadingNote, setLoadingNote] = useState(false);
  const [canvasTitle, setCanvasTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isShareable, setIsShareable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  useEffect(() => {
    setNoteId(queryNoteId);
  }, [queryNoteId]);

  useEffect(() => {
    if (!noteId) {
      setInitialScene(null);
      setCanvasTitle("");
      setDescription("");
      setIsShareable(false);
      setLoadingNote(false);
      return;
    }
    setLoadingNote(true);
    fetch(`/api/notes/${noteId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("ノートが見つかりません");
        const payload = await res.json();
        const note = payload.note as {
          title?: string;
          content?: string;
          drawingData?: SceneSnapshot;
          isShareable?: boolean;
        };
        setCanvasTitle(note.title ?? "");
        setDescription(note.content ?? "");
        setIsShareable(Boolean(note.isShareable));
        if (note.drawingData && Array.isArray(note.drawingData.elements)) {
          setInitialScene(note.drawingData);
        } else {
          setInitialScene(null);
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : "ノートの読み込みに失敗しました"))
      .finally(() => setLoadingNote(false));
  }, [noteId]);

  useEffect(() => {
    if (!apiRef.current || !initialScene) return;
    apiRef.current.updateScene({
      elements: initialScene.elements,
      appState: initialScene.appState,
      commitToHistory: false,
    });
  }, [initialScene]);

  const templateHints = useMemo(
    () => "文字・図形・画像を自由に描画できます。カメラ撮影やファイルから画像を追加可能。",
    []
  );

  const handleImageUpload = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file || !apiRef.current) return;
      event.target.value = "";
      try {
        await apiRef.current.addFiles([file]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "画像の追加に失敗しました");
      }
    },
    []
  );

  const addImageToCanvas = useCallback(
    async (imageDataUrl: string) => {
      if (!apiRef.current) return;
      try {
        const response = await fetch(imageDataUrl);
        const blob = await response.blob();
        const file = new File([blob], `image-${Date.now()}.jpg`, { type: "image/jpeg" });
        await apiRef.current.addFiles([file]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "画像の追加に失敗しました");
      }
    },
    []
  );

  const handleCameraCapture = useCallback(
    async (imageDataUrl: string) => {
      setShowCamera(false);
      await addImageToCanvas(imageDataUrl);
    },
    [addImageToCanvas]
  );

  const handleSave = useCallback(async () => {
    if (!apiRef.current) return;
    setSaving(true);
    setError(null);
    try {
      const elements = apiRef.current.getSceneElements();
      const appState = apiRef.current.getAppState();
      const payload = {
        title: canvasTitle.trim() || "キャンバスノート",
        content: description.trim(),
        drawingData: { elements, appState },
        templateType: CANVAS_TEMPLATE,
        isShareable,
      };
      const endpoint = noteId ? `/api/notes/${noteId}` : "/api/notes";
      const method = noteId ? "PATCH" : "POST";
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "保存に失敗しました");
      }
      router.push("/notes");
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存に失敗しました");
    } finally {
      setSaving(false);
    }
  }, [canvasTitle, description, isShareable, noteId, router]);

  const buttonLabel = noteId ? "保存" : "保存してノート化";

  return (
    <div className="min-h-screen space-y-4 p-2 sm:space-y-6 sm:p-0">
      <header className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs text-slate-500">ノートキャンバス</p>
            <h1 className="text-lg font-semibold text-slate-900 sm:text-2xl">
              図・文字・画像を自由に描画
            </h1>
          </div>
          <Link
            href="/notes"
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 active:bg-slate-100"
          >
            ← 戻る
          </Link>
        </div>
        <p className="mt-2 text-xs text-slate-600 sm:text-sm">{templateHints}</p>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
        <div className="mb-3 grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm text-slate-700">
            タイトル
            <input
              value={canvasTitle}
              onChange={(e) => setCanvasTitle(e.target.value)}
              placeholder="キャンバスのタイトル"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-700">
            説明
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ノートの説明（任意）"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={isShareable}
            onChange={(e) => setIsShareable(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />
          支援者と共有する
        </label>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loadingNote}
            className="rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800 active:bg-slate-950 disabled:opacity-60 sm:py-2"
          >
            {saving ? "保存中..." : `💾 ${buttonLabel}`}
          </button>
          <button
            type="button"
            onClick={() => setShowCamera(true)}
            className="rounded-lg border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100 sm:py-2"
          >
            📷 カメラ撮影
          </button>
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100 sm:py-2">
            🖼️ 画像を追加
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        </div>
        {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
        {loadingNote && <p className="text-xs text-slate-500">ノートを読み込み中…</p>}
      </section>

      <details className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
        <summary className="cursor-pointer text-sm font-semibold text-slate-900">
          📖 使い方
        </summary>
        <ul className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
          <li>📝 クリック/タップで文字入力</li>
          <li>🔷 ツールバーから図形を選択</li>
          <li>✏️ 手書きで自由に描画</li>
          <li>🖼️ 画像をドラッグ＆ドロップ</li>
          <li>📷 カメラで撮影して挿入</li>
          <li>🔄 オブジェクトを自由に移動</li>
        </ul>
      </details>

      <section
        className="rounded-xl border border-slate-200 bg-white shadow-sm"
        style={{ height: "calc(100vh - 280px)", minHeight: "400px" }}
      >
        <Excalidraw
          excalidrawAPI={(api) => {
            apiRef.current = api;
          }}
          initialData={initialScene ?? undefined}
          viewModeEnabled={false}
          UIOptions={{
            canvasActions: {
              saveToActiveFile: false,
              loadScene: false,
              export: false,
              saveAsImage: false,
            },
          }}
        />
      </section>

      {showCamera && (
        <CameraCapture onCapture={handleCameraCapture} onClose={() => setShowCamera(false)} />
      )}
    </div>
  );
}
