"use client";

import Link from "next/link";
import type { ChangeEvent, FormEvent } from "react";
import { useCallback, useEffect, useMemo, useState, Suspense } from "react";
import NotesOnboarding from "@/components/notes/NotesOnboarding";
import SkeletonBlock from "@/components/ui/SkeletonBlock";
import OcrEnhanced from "@/components/notes/OcrEnhanced";
import AiAnalyzer from "@/components/notes/AiAnalyzer";
import { NotesFilters } from "@/components/notes/NotesFilters";
import { NotesList } from "@/components/notes/NotesList";
import { OcrPanel } from "@/components/ocr/OcrPanel";
import { CoachFeedbackModal } from "@/components/notes/CoachFeedbackModal";
// import AutoTagger from "@/components/notes/AutoTagger";
import { NOTE_TEMPLATE_OPTIONS } from "@/lib/notes/templates";
import { useSearchParams } from "next/navigation";
import type { OcrResult } from "@/lib/ocr/recognizer";
import type { AiAnalysisResult } from "@/lib/ai/types";
import type {
  NoteImageFile,
  NoteOcrText,
  NoteRecord,
  NoteTemplateType,
  Template5W2H,
  Template5Why,
  TemplateFactFeeling,
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

const emptyFactFeeling: TemplateFactFeeling = {
  situation: "",
  facts: "",
  feelings: "",
  thoughts: "",
  needs: "",
  actions: "",
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

const FACT_FEELING_FIELDS: Array<{ key: keyof TemplateFactFeeling; label: string; placeholder: string }> = [
  { key: "situation", label: "📍 状況（何が起きた？）", placeholder: "例）授業中に先生から質問された" },
  { key: "facts", label: "👁️ 事実（見たこと・聞いたこと）", placeholder: "例）先生が「この問題を解いてみて」と言った。クラスメイトが私を見た。" },
  { key: "feelings", label: "💭 感情（どう感じた？）", placeholder: "例）緊張した、恥ずかしかった、焦った" },
  { key: "thoughts", label: "🧠 思考（どう解釈した？）", placeholder: "例）「みんなに笑われるかも」「間違えたらどうしよう」と思った" },
  { key: "needs", label: "💎 ニーズ（本当に求めていること）", placeholder: "例）安心して発言できる環境、失敗しても大丈夫という感覚" },
  { key: "actions", label: "🚀 行動（これからどうする？）", placeholder: "例）深呼吸してから答える、分からない時は「考え中です」と言う" },
];

const ONBOARDING_KEY = "schoolverse2-notes-onboarding-dismissed";

const formatIso = (d: Date | string) => {
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return String(d);
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

function NotesPageContent() {
  const [notes, setNotes] = useState<NoteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<NoteRecord | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [templateType, setTemplateType] = useState<NoteTemplateType>("free");
  const [template5W2H, setTemplate5W2H] = useState<Template5W2H>(empty5W2H);
  const [template5Why, setTemplate5Why] = useState<Template5Why>(empty5Why);
  const [templateFactFeeling, setTemplateFactFeeling] = useState<TemplateFactFeeling>(emptyFactFeeling);
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

  // AIコーチ関連のstate
  const [coachFeedback, setCoachFeedback] = useState<string | null>(null);
  const [coachNoteId, setCoachNoteId] = useState<string | null>(null);
  const [requestingCoach, setRequestingCoach] = useState<string | null>(null);
  const [showCoachModal, setShowCoachModal] = useState(false);

  // OCR強化版モーダル関連
  const [ocrEnhancedImage, setOcrEnhancedImage] = useState<string | null>(null);
  const [showOcrEnhanced, setShowOcrEnhanced] = useState(false);

  // AI分析関連
  const [analyzingNoteId, setAnalyzingNoteId] = useState<string | null>(null);

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
    const taskId = searchParams?.get("taskId");
    const taskTitle = searchParams?.get("taskTitle") ?? undefined;
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
    setTemplateFactFeeling(emptyFactFeeling);
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
    if (type === "fact-feeling" && note.templateData) {
      setTemplateFactFeeling(note.templateData as TemplateFactFeeling);
    } else {
      setTemplateFactFeeling(emptyFactFeeling);
    }
  };

  const handleTemplateTypeChange = (type: NoteTemplateType) => {
    if (type === "canvas") {
      const params = new URLSearchParams();
      if (linkedTask?.id) {
        params.set("taskId", linkedTask.id);
        if (linkedTask.title) params.set("taskTitle", linkedTask.title);
      }
      window.location.href = `/notes/canvas${params.toString() ? `?${params}` : ""}`;
      return;
    }
    setTemplateType(type);
    if (type !== "5w2h") {
      setTemplate5W2H(empty5W2H);
    }
    if (type !== "5why") {
      setTemplate5Why(empty5Why);
    }
    if (type !== "fact-feeling") {
      setTemplateFactFeeling(emptyFactFeeling);
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
    if (templateType === "fact-feeling") {
      if (!templateFactFeeling.situation.trim() || !templateFactFeeling.facts.trim() || !templateFactFeeling.feelings.trim()) {
        setError("「状況」「事実」「感情」は必須です");
        return;
      }
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
          : templateType === "fact-feeling"
            ? templateFactFeeling
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
    templateFactFeeling,
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

  // AIコーチにフィードバックをリクエスト
  const handleRequestCoach = useCallback(async (noteId: string) => {
    setRequestingCoach(noteId);
    setCoachFeedback(null);
    setCoachNoteId(noteId);
    
    try {
      const response = await fetch(`/api/notes/${noteId}/coach`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "フィードバックの取得に失敗しました");
      }
      
      const data = await response.json();
      setCoachFeedback(data.feedback);
      setShowCoachModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "AIコーチへの接続に失敗しました");
    } finally {
      setRequestingCoach(null);
    }
  }, []);

  // AI分析を実行
  const handleAnalyze = useCallback(async (noteId: string) => {
    setAnalyzingNoteId(noteId);
    setError(null);
    
    try {
      const response = await fetch(`/api/notes/${noteId}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "AI分析に失敗しました");
      }
      
      await loadNotes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI分析に失敗しました");
    } finally {
      setAnalyzingNoteId(null);
    }
  }, [loadNotes]);

  // OCR完了時の処理
  const handleOcrComplete = useCallback((result: OcrResult) => {
    // OCRテキストを本文に追加
    if (result.text.trim()) {
      setContent((prev) => {
        if (prev.trim()) {
          return `${prev}\n\n---\n📸 OCR抽出テキスト:\n${result.text}`;
        }
        return result.text;
      });
      
      // OCRテキストをリストに追加
      const newOcr: NoteOcrText = {
        imageId: ocrEnhancedImage ?? "",
        text: result.text,
        confidence: result.confidence,
      };
      setOcrTexts((prev) => [...prev, newOcr]);
    }
    
    setShowOcrEnhanced(false);
    setOcrEnhancedImage(null);
  }, [ocrEnhancedImage]);

  // OCR後のAI分析
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleOcrAnalyze = useCallback(async (_text: string) => {
    // 保存済みノートの場合のみAI分析を実行
    if (selectedNote?.id) {
      await handleAnalyze(selectedNote.id);
    }
  }, [selectedNote, handleAnalyze]);

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
        
        // OCR強化版モーダルを開く
        setOcrEnhancedImage(dataUrl);
      setShowOcrEnhanced(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "画像が追加できませんでした");
    }
  },
  [loadNotes, selectedNote],
);

  // OCR強化ビューを開く（画像サムネイルから呼び出し）
  const handleOpenOcrEnhanced = useCallback((url: string) => {
    setOcrEnhancedImage(url);
    setShowOcrEnhanced(true);
  }, []);

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

  const feedbackNote = useMemo(() => {
    if (!coachNoteId) return null;
    return notes.find((n) => n.id === coachNoteId) ?? null;
  }, [coachNoteId, notes]);

  return (
    <div className="space-y-6">
      <header className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <p className="text-xs text-slate-500 dark:text-slate-400">ノート / 思考の外部化</p>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">週の振り返りや気づきを記録する</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          テンプレートとキャンバスを使って、週次レポートの素材や学習の考察を残しましょう。
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/mindmap"
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-400 dark:border-slate-600 dark:text-slate-200 dark:hover:border-slate-400"
          >
 マインドマップへ移動
          </Link>
        </div>
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
            className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Onboardingを再表示
          </button>
        </div>
      )}

      <section className="grid gap-4 lg:grid-cols-5">
        {NOTE_TEMPLATE_OPTIONS.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() => handleTemplateTypeChange(template.id)}
            className={`rounded-xl border px-4 py-3 text-left transition ${
              templateType === template.id
                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30"
                : "border-slate-200 bg-white hover:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-500"
            }`}
          >
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{template.label}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{template.summary}</p>
          </button>
        ))}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm text-slate-700 dark:text-slate-300">
            タイトル（任意）
            <input
              className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例）週のハイライト"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-700 dark:text-slate-300">
            タグ（カンマ区切り）
            <input
              className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="学習, 振り返り, 進路"
            />
          </label>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={isShareable}
              onChange={(e) => setIsShareable(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            支援者と共有する
          </label>
        </div>
        <label className="mt-4 flex flex-col gap-2 text-sm text-slate-700 dark:text-slate-300">
          本文
          <textarea
            className="min-h-40 rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="気づきや学習プラン、感情などを追加しましょう"
          />
        </label>

        {/* 感情と事実テンプレート */}
        {templateType === "fact-feeling" && (
          <div className="mt-4 space-y-4 rounded-lg border border-purple-200 bg-purple-50 p-4 text-sm text-slate-700 dark:border-purple-700 dark:bg-purple-900/20 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <span className="text-lg">🎭</span>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">感情と事実を分ける</p>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              感情と事実を分けて整理することで、客観的に状況を把握し、より良い行動を選べるようになります。
            </p>
            <div className="space-y-3">
              {FACT_FEELING_FIELDS.map((field) => (
                <label key={field.key} className="flex flex-col gap-1">
                  <span className="font-medium">{field.label}</span>
                  <textarea
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
                    rows={2}
                    value={templateFactFeeling[field.key]}
                    onChange={(e) =>
                      setTemplateFactFeeling((prev) => ({
                        ...prev,
                        [field.key]: e.target.value,
                      }))
                    }
                    placeholder={field.placeholder}
                  />
                </label>
              ))}
            </div>
            <div className="mt-3 rounded-md bg-purple-100 p-3 text-xs text-purple-800 dark:bg-purple-900/40 dark:text-purple-200">
              <p className="font-semibold">💡 ヒント</p>
              <ul className="mt-1 list-inside list-disc space-y-1">
                <li><strong>事実</strong>は「カメラで撮影できること」だけを書く</li>
                <li><strong>感情</strong>は「〜と感じた」で表現する</li>
                <li><strong>思考</strong>は「〜と思った/解釈した」と書く</li>
                <li>事実と感情・思考を分けることで、冷静に状況を見つめ直せます</li>
              </ul>
            </div>
          </div>
        )}

        {templateType === "5w2h" && (
          <div className="mt-4 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">5W2H</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1">
                What（何を）
                <input
                  className="rounded-md border border-slate-300 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800"
                  value={template5W2H.what}
                  onChange={(e) => setTemplate5W2H((prev) => ({ ...prev, what: e.target.value }))}
                />
              </label>
              <label className="flex flex-col gap-1">
                Why（なぜ）
                <input
                  className="rounded-md border border-slate-300 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800"
                  value={template5W2H.why}
                  onChange={(e) => setTemplate5W2H((prev) => ({ ...prev, why: e.target.value }))}
                />
              </label>
              <label className="flex flex-col gap-1">
                Who（誰が）
                <input
                  className="rounded-md border border-slate-300 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800"
                  value={template5W2H.who}
                  onChange={(e) => setTemplate5W2H((prev) => ({ ...prev, who: e.target.value }))}
                />
              </label>
              <label className="flex flex-col gap-1">
                When（いつ）
                <input
                  className="rounded-md border border-slate-300 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800"
                  value={template5W2H.when}
                  onChange={(e) => setTemplate5W2H((prev) => ({ ...prev, when: e.target.value }))}
                />
              </label>
              <label className="flex flex-col gap-1">
                Where（どこで）
                <input
                  className="rounded-md border border-slate-300 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800"
                  value={template5W2H.where}
                  onChange={(e) => setTemplate5W2H((prev) => ({ ...prev, where: e.target.value }))}
                />
              </label>
              <label className="flex flex-col gap-1">
                How（どうやって）
                <input
                  className="rounded-md border border-slate-300 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800"
                  value={template5W2H.how}
                  onChange={(e) => setTemplate5W2H((prev) => ({ ...prev, how: e.target.value }))}
                />
              </label>
              <label className="flex flex-col gap-1">
                How much（どれくらい）
                <input
                  className="rounded-md border border-slate-300 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800"
                  value={template5W2H.howMuch}
                  onChange={(e) => setTemplate5W2H((prev) => ({ ...prev, howMuch: e.target.value }))}
                />
              </label>
            </div>
          </div>
        )}
        {templateType === "5why" && (
          <div className="mt-4 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">5 Why</p>
            {WHY_FIELDS.map((key) => (
              <label key={key} className="flex flex-col gap-1">
                {key === "problem" ? "課題" : key === "conclusion" ? "結論・対策" : `なぜ${key.slice(3)}？`}
                <textarea
                  className="rounded-md border border-slate-300 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800"
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
        <label className="mt-4 flex flex-col gap-2 text-sm text-slate-700 dark:text-slate-300">
          描画データ（Excalidraw JSON）
          <textarea
            className="min-h-[100px] rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700"
            value={drawingData}
            onChange={(e) => setDrawingData(e.target.value)}
            placeholder="Excalidrawのsceneデータをペーストして保存できます"
          />
        </label>
        {templateHints.length > 0 && (
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">ヒント: {templateHints.join(" / ")}</p>
        )}
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60 dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            {selectedNote ? (saving ? "保存中..." : "更新する") : saving ? "保存中..." : "保存する"}
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            フォームをクリア
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

        <OcrPanel
          imageFiles={imageFiles}
          ocrTexts={ocrTexts}
          ocrInput={ocrInput}
          ocrImageId={ocrImageId}
          sending={sendingOcr}
          onImageUpload={handleImageUpload}
          onOpenEnhanced={handleOpenOcrEnhanced}
          onSubmitManual={handleAddOcr}
          onChangeInput={setOcrInput}
          onChangeImageId={setOcrImageId}
        />

        {/* 選択中のノートのAI分析表示 */}
        {selectedNote && (
          <div className="mt-6">
            <AiAnalyzer
              noteId={selectedNote.id}
              initialAnalysis={selectedNote.aiAnalysis as AiAnalysisResult | null}
              initialSummary={selectedNote.aiSummary}
              initialTags={selectedNote.autoTags ?? []}
              onUpdate={() => loadNotes()}
            />
          </div>
        )}
      </section>

      <NotesFilters
        filterType={filterType}
        pendingSearch={pendingSearch}
        onFilterChange={setFilterType}
        onSearchChange={setPendingSearch}
        onSearchApply={() => setActiveSearch(pendingSearch)}
      />

      <NotesList
        notes={notes}
        loading={loading}
        analyzingNoteId={analyzingNoteId}
        requestingCoach={requestingCoach}
        deletingId={deletingId}
        onAnalyze={handleAnalyze}
        onRequestCoach={handleRequestCoach}
        onSelect={handleSelect}
        onDelete={handleDelete}
        formatIso={formatIso}
        templateLabels={TEMPLATE_LABELS}
      />


      {/* OCR強化版モーダル */}
      {showOcrEnhanced && ocrEnhancedImage && (
        <OcrEnhanced
          imageUrl={ocrEnhancedImage}
          onComplete={handleOcrComplete}
          onCancel={() => {
            setShowOcrEnhanced(false);
            setOcrEnhancedImage(null);
          }}
          onAnalyze={handleOcrAnalyze}
        />
      )}

      <CoachFeedbackModal
        open={showCoachModal}
        feedback={coachFeedback}
        noteTitle={feedbackNote?.title ?? "無題のノート"}
        onClose={() => {
          setShowCoachModal(false);
          setCoachFeedback(null);
          setCoachNoteId(null);
        }}
      />
    </div>
  );
}

function NotesPageFallback() {
  return (
    <div className="space-y-6">
      <header className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <p className="text-xs text-slate-500 dark:text-slate-400">ノート / 思考の外部化</p>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">週の振り返りや気づきを記録する</h1>
      </header>
      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <SkeletonBlock rows={6} />
      </div>
    </div>
  );
}

export default function NotesPage() {
  return (
    <Suspense fallback={<NotesPageFallback />}>
      <NotesPageContent />
    </Suspense>
  );
}
