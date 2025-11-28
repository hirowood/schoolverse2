"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { ExcalidrawImperativeAPI, ExcalidrawElement, AppState, BinaryFileData } from "@excalidraw/excalidraw/types/types";
import CameraCapture from "@/components/notes/CameraCapture";
import OcrProcessor from "@/components/notes/OcrProcessor";

// Excalidrawをdynamic importでSSR無効化
const Excalidraw = dynamic(
  async () => (await import("@excalidraw/excalidraw")).Excalidraw,
  { ssr: false }
);

// 型定義
interface SceneSnapshot {
  elements: readonly ExcalidrawElement[];
  appState: Partial<AppState>;
}

function CanvasPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const noteId = searchParams.get("id");
  const taskId = searchParams.get("taskId");
  const taskTitle = searchParams.get("taskTitle");

  const apiRef = useRef<ExcalidrawImperativeAPI | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isShareable, setIsShareable] = useState(false);
  const [initialScene, setInitialScene] = useState<SceneSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(!!noteId);
  const [isSaving, setIsSaving] = useState(false);

  // カメラ/OCR状態
  const [showCamera, setShowCamera] = useState(false);
  const [showOcr, setShowOcr] = useState(false);
  const [ocrImageUrl, setOcrImageUrl] = useState<string | null>(null);
  const [cameraMode, setCameraMode] = useState<"image" | "ocr">("image");

  // 既存ノートを読み込む
  useEffect(() => {
    if (!noteId) return;

    const fetchNote = async () => {
      try {
        const res = await fetch(`/api/notes/${noteId}`);
        if (!res.ok) throw new Error("Failed to fetch note");
        const data = await res.json();
        const note = data.note;

        setTitle(note.title || "");
        setDescription(note.content || "");
        setIsShareable(note.isShareable || false);

        if (note.drawingData) {
          const elements = Array.isArray(note.drawingData.elements) 
            ? note.drawingData.elements as ExcalidrawElement[]
            : [];
          const appState = note.drawingData.appState && typeof note.drawingData.appState === 'object'
            ? note.drawingData.appState as Partial<AppState>
            : {};
          setInitialScene({ elements, appState });
        }
      } catch (error) {
        console.error("Failed to load note:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNote();
  }, [noteId]);

  // 画像をキャンバスに追加
  const handleAddImage = useCallback(async (file: File) => {
    if (!apiRef.current) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      const id = crypto.randomUUID();
      
      // BinaryFileDataの形式で追加
      const fileData: BinaryFileData = {
        id,
        dataURL: dataUrl,
        mimeType: file.type as BinaryFileData["mimeType"],
        created: Date.now(),
      };
      
      await apiRef.current!.addFiles([fileData]);
      
      // 画像要素を作成してシーンに追加
      const img = new Image();
      img.onload = () => {
        const element: Partial<ExcalidrawElement> = {
          type: "image",
          id: crypto.randomUUID(),
          x: 100,
          y: 100,
          width: Math.min(img.width, 400),
          height: Math.min(img.height, 300),
          fileId: id,
        };
        
        const currentElements = apiRef.current!.getSceneElements();
        apiRef.current!.updateScene({
          elements: [...currentElements, element as ExcalidrawElement],
        });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }, []);

  // カメラ撮影完了
  const handleCameraCapture = useCallback(async (dataUrl: string) => {
    setShowCamera(false);

    if (cameraMode === "ocr") {
      setOcrImageUrl(dataUrl);
      setShowOcr(true);
    } else {
      // 画像モード: DataURLをFileに変換してキャンバスに追加
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], `camera-${Date.now()}.jpg`, { type: "image/jpeg" });
      await handleAddImage(file);
    }
  }, [cameraMode, handleAddImage]);

  // OCR完了
  const handleOcrComplete = useCallback((text: string) => {
    setShowOcr(false);
    setOcrImageUrl(null);

    if (!apiRef.current || !text) return;

    // テキスト要素を作成
    const currentElements = apiRef.current.getSceneElements();
    const appState = apiRef.current.getAppState();

    const centerX = (appState.width || 800) / 2;
    const centerY = (appState.height || 600) / 2;

    const textElement: Partial<ExcalidrawElement> = {
      type: "text",
      id: crypto.randomUUID(),
      x: centerX - 100,
      y: centerY,
      text,
      fontSize: 16,
      fontFamily: 1,
      textAlign: "left",
      verticalAlign: "top",
    };

    apiRef.current.updateScene({
      elements: [...currentElements, textElement as ExcalidrawElement],
    });
  }, []);

  // 保存
  const handleSave = async () => {
    if (!apiRef.current) return;

    setIsSaving(true);
    try {
      const elements = apiRef.current.getSceneElements();
      const appState = apiRef.current.getAppState();

      // 保存に必要な appState のみ抽出
      const saveAppState = {
        viewBackgroundColor: appState.viewBackgroundColor,
        zoom: appState.zoom,
        scrollX: appState.scrollX,
        scrollY: appState.scrollY,
      };

      const body = {
        title: title || "無題のキャンバス",
        content: description,
        templateType: "canvas",
        isShareable,
        drawingData: {
          elements: elements,
          appState: saveAppState,
        },
        ...(taskId && { relatedTaskId: taskId, relatedTaskTitle: taskTitle }),
      };

      const url = noteId ? `/api/notes/${noteId}` : "/api/notes";
      const method = noteId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to save");

      router.push("/notes");
    } catch (error) {
      console.error("Save error:", error);
      alert("保存に失敗しました");
    } finally {
      setIsSaving(false);
    }
  };

  // ファイル選択からの画像追加
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleAddImage(file);
    e.target.value = "";
  };

  // OCRファイル選択
  const handleOcrFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setOcrImageUrl(ev.target?.result as string);
        setShowOcr(true);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* ヘッダー */}
      <div className="p-2 sm:p-4 border-b dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between mb-2">
          <Link href="/notes" className="text-blue-600 hover:underline text-sm">
            ← ノート一覧に戻る
          </Link>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? "保存中..." : "💾 保存"}
          </button>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="タイトル"
            className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          />
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="説明（任意）"
            className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          />
          <label className="flex items-center gap-2 px-3 py-2">
            <input
              type="checkbox"
              checked={isShareable}
              onChange={(e) => setIsShareable(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">共有可能</span>
          </label>
        </div>

        {/* ツールボタン */}
        <div className="flex flex-wrap gap-2 mt-2">
          <label className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 text-sm">
            🖼️ 画像追加
            <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
          </label>

          <button
            onClick={() => {
              setCameraMode("image");
              setShowCamera(true);
            }}
            className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm"
          >
            📷 カメラ撮影
          </button>

          <label className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 text-sm">
            🔍 OCR
            <input type="file" accept="image/*" onChange={handleOcrFileSelect} className="hidden" />
          </label>

          <button
            onClick={() => {
              setCameraMode("ocr");
              setShowCamera(true);
            }}
            className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm"
          >
            📷→🔍 カメラ+OCR
          </button>
        </div>

        {/* タスク連携表示 */}
        {taskTitle && (
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            📎 タスク「{taskTitle}」に関連付け
          </div>
        )}
      </div>

      {/* キャンバス */}
      <div className="flex-1 min-h-0">
        <Excalidraw
          excalidrawAPI={(api) => {
            apiRef.current = api;
          }}
          initialData={initialScene ? {
            elements: initialScene.elements,
            appState: initialScene.appState as Partial<AppState>,
          } : undefined}
          UIOptions={{
            canvasActions: {
              saveToActiveFile: false,
              loadScene: false,
              export: { saveFileToDisk: true },
              saveAsImage: true,
            },
          }}
        />
      </div>

      {/* カメラモーダル */}
      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onCancel={() => setShowCamera(false)}
        />
      )}

      {/* OCRモーダル */}
      {showOcr && ocrImageUrl && (
        <OcrProcessor
          imageUrl={ocrImageUrl}
          onComplete={handleOcrComplete}
          onCancel={() => {
            setShowOcr(false);
            setOcrImageUrl(null);
          }}
        />
      )}

      {/* 使い方ヒント */}
      <details className="p-2 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <summary className="cursor-pointer text-sm text-gray-600 dark:text-gray-400">
          💡 使い方ヒント
        </summary>
        <ul className="mt-2 text-xs text-gray-500 dark:text-gray-500 space-y-1 pl-4">
          <li>• 左のツールバーで図形・テキスト・フリーハンドを選択</li>
          <li>• 画像はドラッグ&ドロップでも追加可能</li>
          <li>• OCRで画像からテキストを抽出してキャンバスに配置</li>
          <li>• すべてのオブジェクトは移動・拡大縮小・回転可能</li>
        </ul>
      </details>
    </div>
  );
}

export default function CanvasPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    }>
      <CanvasPageContent />
    </Suspense>
  );
}
