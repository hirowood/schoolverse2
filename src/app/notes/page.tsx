"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import NotesOnboarding from "@/components/notes/NotesOnboarding";
import SkeletonBlock from "@/components/ui/SkeletonBlock";
import { NOTE_TEMPLATE_OPTIONS } from "@/lib/notes/templates";
import { useSearchParams } from "next/navigation";
import type {
  NoteImageFile,
  NoteOcrText,
  NoteRecord,
  NoteTemplateType,
  Template5W2H,
  Template5Why,
} from "@/lib/notes/types";

const TEMPLATE_LABELS = new Map(NOTE_TEMPLATE_OPTIONS.map((template) => [template.id, template.label]));

const empty5W2H: Template5W2H = {
  what: "",
  why: "",
  who: "",
  when: "",
  where: "",
  how: "",
  howMuch: "",
};

const empty5Why: Template5Why = {
  problem: "",
  why1: "",
  why2: "",
  why3: "",
  why4: "",
  why5: "",
  conclusion: "",
};

const WHY_FIELDS: Array<keyof Template5Why> = [
  "problem",
  "why1",
  "why2",
  "why3",
  "why4",
  "why5",
  "conclusion",
];

const ONBOARDING_KEY = "schoolverse2-notes-onboarding-dismissed";

const formatIso = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("ja-JP", {
    dateStyle: "short",
    timeStyle: "short",
  });
};

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("読み込みに失敗しました"));
      }
    };
    reader.onerror = () => reject(new Error("ファイル読み込みに失敗しました"));
    reader.readAsDataURL(file);
  });

const getImageDimensions = (url: string) =>
  new Promise<{ width: number; height: number }>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = () => reject(new Error("画像の読み込みに失敗しました"));
    img.src = url;
  });

export default function NotesPage() {
  const [notes, setNotes] = useState<NoteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<NoteRecord | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [templateType, setTemplateType] = useState<NoteTemplateType>("free");
  const [template5W2H, setTemplate5W2H] = useState<Template5W2H>(empty5W2H);
  const [template5Why, setTemplate5Why] = useState<Template5Why>(empty5Why);
  const [drawingData, setDrawingData] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [isShareable, setIsShareable] = useState(false);
  const [imageFiles, setImageFiles] = useState<NoteImageFile[]>([]);
  const [ocrTexts, setOcrTexts] = useState<NoteOcrText[]>([]);
  const [ocrInput, setOcrInput] = useState("");
  const [ocrImageId, setOcrImageId] = useState("");
  const [saving, setSaving] = useState(false);
  const [sendingOcr, setSendingOcr] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<NoteTemplateType | "all">("all");
  const [pendingSearch, setPendingSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const searchParams = useSearchParams();
  const [linkedTask, setLinkedTask] = useState<{ id: string; title?: string } | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const loadNotes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterType !== "all") {
        params.set("templateType", filterType);
      }
      if (activeSearch) {
        params.set("q", activeSearch);
      }
      if (linkedTask?.id) {
        params.set("taskId", linkedTask.id);
      }
      const query = params.toString();
      const response = await fetch(`/api/notes${query ? `?${query}` : ""}`);
      if (!response.ok) {
        throw new Error("ノートを取得できませんでした");
      }
      const data = (await response.json()) as { notes: NoteRecord[] };
      setNotes(data.notes);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  }, [activeSearch, filterType, linkedTask]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  useEffect(() => {
    const taskId = searchParams.get("taskId");
    const taskTitle = searchParams.get("taskTitle") ?? undefined;
    if (taskId) {
      setLinkedTask({ id: taskId, title: taskTitle });
    } else {
      setLinkedTask(null);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!selectedNote && linkedTask?.title && !content.trim()) {
      setContent(`課題「${linkedTask.title}」の振り返り`);
    }
  }, [content, linkedTask, selectedNote]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const dismissed = window.localStorage.getItem(ONBOARDING_KEY) === "1";
    setShowOnboarding(!dismissed);
  }, []);

  const handleDismissOnboarding = useCallback(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ONBOARDING_KEY, "1");
    }
    setShowOnboarding(false);
  }, []);

  const handleShowOnboarding = useCallback(() => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(ONBOARDING_KEY);
    }
    setShowOnboarding(true);
  }, []);

  const resetForm = useCallback(() => {
    setSelectedNote(null);
    setTitle("");
    setContent("");
    setTemplateType("free");
    setTemplate5W2H(empty5W2H);
    setTemplate5Why(empty5Why);
    setDrawingData("");
    setTagsInput("");
    setIsShareable(false);
    setImageFiles([]);
    setOcrTexts([]);
    setOcrInput("");
    setOcrImageId("");
  }, []);

  const handleSelect = (note: NoteRecord) => {
    setSelectedNote(note);
    setTitle(note.title ?? "");
    setContent(note.content ?? "");
    setDrawingData(note.drawingData ? JSON.stringify(note.drawingData, null, 2) : "");
    setTagsInput(note.tags.join(", "));
    setIsShareable(note.isShareable);
    setImageFiles(note.imageFiles ?? []);
    setOcrTexts(note.ocrTexts ?? []);
    setOcrInput("");
    setOcrImageId("");
    const type = note.templateType ?? "free";
    setTemplateType(type);
    if (type === "5w2h" && note.templateData) {
      setTemplate5W2H(note.templateData as Template5W2H);
    } else {
      setTemplate5W2H(empty5W2H);
    }
    if (type === "5why" && note.templateData) {
      setTemplate5Why(note.templateData as Template5Why);
    } else {
      setTemplate5Why(empty5Why);
    }
  };

  const handleTemplateTypeChange = (type: NoteTemplateType) => {
    setTemplateType(type);
    if (type !== "5w2h") {
      setTemplate5W2H(empty5W2H);
    }
    if (type !== "5why") {
      setTemplate5Why(empty5Why);
    }
  };

  const buildTags = useCallback(() => {
    return tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
  }, [tagsInput]);

  const handleSave = useCallback(async () => {
    if (!content.trim()) {
      setError("本文または描画データのどちらかを入力してください");
      return;
    }
    if (templateType === "5w2h" && Object.values(template5W2H).some((value) => !value.trim())) {
      setError("5W2Hの全項目を記入してください");
      return;
    }
    if (templateType === "5why" && Object.values(template5Why).some((value) => !value.trim())) {
      setError("5Whyの全段階を埋めてください");
      return;
    }

    let drawingPayload: object | undefined;
    if (drawingData.trim()) {
      try {
        drawingPayload = JSON.parse(drawingData);
      } catch {
        setError("描画データのJSONが不正です");
        return;
      }
    }

    const templateData =
      templateType === "5w2h"
        ? template5W2H
        : templateType === "5why"
          ? template5Why
          : undefined;

    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        title: title.trim() || undefined,
        content: content.trim(),
        drawingData: drawingPayload,
        templateType,
        templateData,
        tags: buildTags(),
        isShareable,
        imageFiles: imageFiles.length > 0 ? imageFiles : undefined,
        ocrTexts: ocrTexts.length > 0 ? ocrTexts : undefined,
        relatedTaskId: linkedTask?.id ?? undefined,
      };
      const method = selectedNote ? "PATCH" : "POST";
      if (selectedNote) {
        payload.id = selectedNote.id;
      }
      const response = await fetch(selectedNote ? `/api/notes/${selectedNote.id}` : "/api/notes", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "保存に失敗しました");
      }
      await loadNotes();
      resetForm();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存できませんでした");
    } finally {
      setSaving(false);
    }
  }, [
    buildTags,
    content,
    drawingData,
    imageFiles,
    isShareable,
    loadNotes,
    ocrTexts,
    resetForm,
    selectedNote,
    template5W2H,
    template5Why,
    templateType,
    title,
    linkedTask,
  ]);

  const handleDelete = useCallback(
    async (id: string) => {
      setDeletingId(id);
      try {
        const response = await fetch(`/api/notes/${id}`, { method: "DELETE" });
        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          throw new Error(payload?.error ?? "削除に失敗しました");
        }
        if (selectedNote?.id === id) {
          resetForm();
        }
        await loadNotes();
      } catch (err) {
        setError(err instanceof Error ? err.message : "削除に失敗しました");
      } finally {
        setDeletingId(null);
      }
    },
    [loadNotes, resetForm, selectedNote],
  );

  const handleImageUpload = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      event.target.value = "";
      try {
        const dataUrl = await readFileAsDataUrl(file);
        const dims = await getImageDimensions(dataUrl);
        const entry: NoteImageFile = {
          id: crypto.randomUUID(),
          url: dataUrl,
          name: file.name,
          width: dims.width,
          height: dims.height,
        };
        if (selectedNote) {
          const response = await fetch(`/api/notes/${selectedNote.id}/image`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(entry),
          });
          if (!response.ok) {
            const payload = await response.json().catch(() => null);
            throw new Error(payload?.error ?? "画像アップロードに失敗しました");
          }
          const data = await response.json();
          setImageFiles(data.imageFiles ?? []);
          await loadNotes();
        } else {
          setImageFiles((prev) => [...prev, entry]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "画像が追加できませんでした");
      }
    },
    [loadNotes, selectedNote],
  );

  const handleAddOcr = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      if (!selectedNote) {
        setError("まず保存済みノートを選んでください");
        return;
      }
      if (!ocrInput.trim()) {
        setError("OCRテキストを入力してください");
        return;
      }
      setSendingOcr(true);
      try {
        const response = await fetch(`/api/notes/${selectedNote.id}/ocr`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageId: ocrImageId || "",
            text: ocrInput.trim(),
            confidence: 0.92,
          }),
        });
        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          throw new Error(payload?.error ?? "OCR登録に失敗しました");
        }
        const data = await response.json();
        setOcrTexts(data.ocrTexts ?? []);
        setOcrInput("");
        setOcrImageId("");
        await loadNotes();
      } catch (err) {
        setError(err instanceof Error ? err.message : "OCR登録に失敗しました");
      } finally {
        setSendingOcr(false);
      }
    },
    [ocrImageId, ocrInput, loadNotes, selectedNote],
  );

  const templateHints = useMemo(() => {
    const template = NOTE_TEMPLATE_OPTIONS.find((item) => item.id === templateType);
    return template ? template.hints : [];
  }, [templateType]);

  return (
    <div className="space-y-6">
      <header className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-xs text-slate-500">ノート / 思考の外部化</p>
        <h1 className="text-2xl font-semibold text-slate-900">週の振り返りや気づきを記録する</h1>
        <p className="text-sm text-slate-600">
          テンプレートとキャンバスを使って、週次レポートの素材や学習の考察を残しましょう。
        </p>
      </header>

      {showOnboarding && (
        <div className="md:mt-4">
          <NotesOnboarding onClose={handleDismissOnboarding} />
        </div>
      )}

      {!showOnboarding && (
        <div className="flex justify-end px-1 text-xs text-slate-500">
          <button
            type="button"
            onClick={handleShowOnboarding}
            className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Onboardingを再表示
          </button>
        </div>
      )}

      <section className="grid gap-4 lg:grid-cols-3">
        {NOTE_TEMPLATE_OPTIONS.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() => handleTemplateTypeChange(template.id)}
            className={`rounded-xl border px-4 py-3 text-left transition ${
              templateType === template.id
                ? "border-emerald-500 bg-emerald-50"
                : "border-slate-200 bg-white hover:border-slate-400"
            }`}
          >
            <p className="text-sm font-semibold text-slate-900">{template.label}</p>
            <p className="text-xs text-slate-500">{template.summary}</p>
            <div className="mt-2 flex flex-wrap gap-1 text-[11px] text-slate-600">
              {template.hints.map((hint) => (
                <span key={hint} className="rounded-full border border-slate-200 px-2 py-0.5">
                  {hint}
                </span>
              ))}
            </div>
          </button>
        ))}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm text-slate-700">
            タイトル（任意）
            <input
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例）週のハイライト"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-700">
            タグ（カンマ区切り）
            <input
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="学習, 振り返り, 進路"
            />
          </label>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={isShareable}
              onChange={(e) => setIsShareable(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            支援者と共有する
          </label>
        </div>
        <label className="mt-4 flex flex-col gap-2 text-sm text-slate-700">
          本文
          <textarea
            className="min-h-[160px] rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="気づきや学習プラン、感情などを追加しましょう"
          />
        </label>
        {templateType === "5w2h" && (
          <div className="mt-4 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <p className="text-sm font-semibold text-slate-900">5W2H</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1">
                What
                <input
                  className="rounded-md border border-slate-300 px-2 py-1 text-sm"
                  value={template5W2H.what}
                  onChange={(e) => setTemplate5W2H((prev) => ({ ...prev, what: e.target.value }))}
                />
              </label>
              <label className="flex flex-col gap-1">
                Why
                <input
                  className="rounded-md border border-slate-300 px-2 py-1 text-sm"
                  value={template5W2H.why}
                  onChange={(e) => setTemplate5W2H((prev) => ({ ...prev, why: e.target.value }))}
                />
              </label>
              <label className="flex flex-col gap-1">
                Who
                <input
                  className="rounded-md border border-slate-300 px-2 py-1 text-sm"
                  value={template5W2H.who}
                  onChange={(e) => setTemplate5W2H((prev) => ({ ...prev, who: e.target.value }))}
                />
              </label>
              <label className="flex flex-col gap-1">
                When
                <input
                  className="rounded-md border border-slate-300 px-2 py-1 text-sm"
                  value={template5W2H.when}
                  onChange={(e) => setTemplate5W2H((prev) => ({ ...prev, when: e.target.value }))}
                />
              </label>
              <label className="flex flex-col gap-1">
                Where
                <input
                  className="rounded-md border border-slate-300 px-2 py-1 text-sm"
                  value={template5W2H.where}
                  onChange={(e) => setTemplate5W2H((prev) => ({ ...prev, where: e.target.value }))}
                />
              </label>
              <label className="flex flex-col gap-1">
                How
                <input
                  className="rounded-md border border-slate-300 px-2 py-1 text-sm"
                  value={template5W2H.how}
                  onChange={(e) => setTemplate5W2H((prev) => ({ ...prev, how: e.target.value }))}
                />
              </label>
              <label className="flex flex-col gap-1">
                How much
                <input
                  className="rounded-md border border-slate-300 px-2 py-1 text-sm"
                  value={template5W2H.howMuch}
                  onChange={(e) => setTemplate5W2H((prev) => ({ ...prev, howMuch: e.target.value }))}
                />
              </label>
            </div>
          </div>
        )}
        {templateType === "5why" && (
          <div className="mt-4 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <p className="text-sm font-semibold text-slate-900">5 Why</p>
            {WHY_FIELDS.map((key) => (
              <label key={key} className="flex flex-col gap-1">
                {key === "problem" ? "問題" : key === "conclusion" ? "結論" : `なぜ${key.slice(3)}？`}
                <textarea
                  className="rounded-md border border-slate-300 px-2 py-1 text-sm"
                  rows={2}
                  value={template5Why[key]}
                  onChange={(e) =>
                    setTemplate5Why((prev) => ({
                      ...prev,
                      [key]: e.target.value,
                    }))
                  }
                />
              </label>
            ))}
          </div>
        )}
        <label className="mt-4 flex flex-col gap-2 text-sm text-slate-700">
          描画データ（Excalidraw JSON）
          <textarea
            className="min-h-[100px] rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={drawingData}
            onChange={(e) => setDrawingData(e.target.value)}
            placeholder="Excalidrawのsceneデータをペーストして保存できます"
          />
        </label>
        {templateHints.length > 0 && (
          <p className="mt-2 text-xs text-slate-500">ヒント: {templateHints.join(" / ")}</p>
        )}
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {selectedNote ? (saving ? "保存中..." : "更新する") : saving ? "保存中..." : "保存する"}
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            フォームをクリア
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

        <div className="mt-6 space-y-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <p className="text-base font-semibold text-slate-900">画像・OCR</p>
          <div className="flex flex-col gap-2">
            <label className="flex flex-col gap-1 text-sm">
              画像追加（新規ノートは作成後にアップロードされます）
              <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm text-slate-600" />
            </label>
            <div className="flex flex-wrap gap-2">
              {imageFiles.map((file) => (
                <div key={file.url} className="relative w-24 rounded border border-slate-200 bg-white p-1 text-xs text-slate-600">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={file.url} alt={file.name} className="h-16 w-16 object-cover" />
                  <p className="truncate">{file.name}</p>
                </div>
              ))}
              {imageFiles.length === 0 && <p className="text-xs text-slate-500">画像がありません</p>}
            </div>
            <form className="flex flex-col gap-2" onSubmit={handleAddOcr}>
              <label className="flex flex-col gap-1 text-sm">
                OCRメモ
                <textarea
                  className="rounded-md border border-slate-300 px-2 py-1 text-sm"
                  rows={2}
                  value={ocrInput}
                  onChange={(e) => setOcrInput(e.target.value)}
                  placeholder="画像から読み取ったテキストや注釈"
                />
              </label>
              {imageFiles.length > 0 && (
                <label className="flex flex-col gap-1 text-sm">
                  関連画像ID（任意）
                  <select
                    value={ocrImageId}
                    onChange={(e) => setOcrImageId(e.target.value)}
                    className="rounded-md border border-slate-300 px-2 py-1 text-sm"
                  >
                    <option value="">画像と紐づけない</option>
                    {imageFiles.map((file) => (
                      <option key={file.id} value={file.id}>
                        {file.name}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <button
                type="submit"
                disabled={sendingOcr}
                className="self-start rounded-md bg-amber-500 px-4 py-1.5 text-xs font-medium text-white hover:bg-amber-600 disabled:opacity-60"
              >
                {sendingOcr ? "OCR保存中..." : "OCRを追加"}
              </button>
            </form>
            {ocrTexts.length > 0 && (
              <div className="space-y-2 text-xs text-slate-600">
                {ocrTexts.map((ocr) => (
                  <div key={`${ocr.imageId}-${ocr.text}`} className="rounded-md border border-slate-200 bg-white p-2">
                    <p className="text-[11px] text-slate-500">画像ID: {ocr.imageId || "未設定"}</p>
                    <p>{ocr.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-slate-900">表示フィルター</p>
          <button
            type="button"
            className={`rounded-full border px-3 py-1 text-xs ${
              filterType === "all" ? "border-emerald-500 bg-emerald-50 text-emerald-600" : "border-slate-200 text-slate-600"
            }`}
            onClick={() => setFilterType("all")}
          >
            すべて
          </button>
          {NOTE_TEMPLATE_OPTIONS.map((template) => (
            <button
              key={template.id}
              type="button"
              className={`rounded-full border px-3 py-1 text-xs ${
                filterType === template.id
                  ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                  : "border-slate-200 text-slate-600"
              }`}
              onClick={() => setFilterType(template.id)}
            >
              {template.label}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <input
              type="search"
              placeholder="タイトル/本文を検索"
              value={pendingSearch}
              onChange={(e) => setPendingSearch(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-1 text-sm"
            />
            <button
              type="button"
              onClick={() => setActiveSearch(pendingSearch)}
              className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
            >
              検索
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">保存済みノート</h2>
          <span className="text-xs text-slate-500">編集して再保存できます</span>
        </div>
        {loading ? (
          <div className="mt-3">
            <SkeletonBlock rows={4} />
          </div>
        ) : notes.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">まだノートがありません</p>
        ) : (
          <div className="mt-3 space-y-3">
            {notes.map((note) => (
              <article key={note.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{note.title || "無題のノート"}</p>
                    <p className="text-[11px] text-slate-500">
                      {note.templateType
                        ? `テンプレート: ${TEMPLATE_LABELS.get(note.templateType) ?? note.templateType}`
                        : "テンプレート未設定"}
                      ・更新: {formatIso(note.updatedAt)}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      画像: {note.imageFiles.length}件 / OCR: {note.ocrTexts.length}件
                    </p>
                  </div>
                  <div className="flex gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => handleSelect(note)}
                      className="rounded-full border border-slate-300 px-3 py-1 text-slate-700 transition hover:border-slate-500"
                    >
                      編集
                    </button>
                    <Link
                      href={`/notes/canvas?noteId=${note.id}`}
                      className="rounded-full border border-slate-300 px-3 py-1 text-slate-700 transition hover:border-slate-500"
                    >
                      キャンバス
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(note.id)}
                      className="rounded-full border border-red-200 px-3 py-1 text-red-600 transition hover:border-red-400"
                      disabled={deletingId === note.id}
                    >
                      {deletingId === note.id ? "削除中..." : "削除"}
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-sm text-slate-700">{note.content ?? "内容がありません"}</p>
                {note.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-600">
                    {note.tags.map((tag) => (
                      <span key={tag} className="rounded-full border border-slate-200 px-2 py-0.5">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                {note.relatedTaskTitle && note.relatedTaskId && (
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
                    <span>関連タスク: {note.relatedTaskTitle}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setLinkedTask({ id: note.relatedTaskId!, title: note.relatedTaskTitle ?? undefined })
                      }
                      className="rounded-full border border-slate-300 px-2 py-0.5 hover:bg-slate-50"
                    >
                      このタスクで絞る
                    </button>
                  </div>
                )}
                {note.isShareable && <p className="mt-2 text-xs text-emerald-600">共有中</p>}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
