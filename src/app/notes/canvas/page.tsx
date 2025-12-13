"use client";

import { Suspense, useCallback, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import "@excalidraw/excalidraw/styles.css";
import { CanvasCaptureModals } from "@/features/notes/canvas/CanvasCaptureModals";
import { CanvasHeader } from "@/features/notes/canvas/CanvasHeader";
import { useCanvasNote } from "@/features/notes/canvas/useCanvasNote";
import {
  BinaryFileData,
  EMPTY_SCENE,
  ExcalidrawElement,
  ExcalidrawImperativeAPI,
  FileId,
} from "@/features/notes/canvas/types";

const Excalidraw = dynamic(async () => (await import("@excalidraw/excalidraw")).Excalidraw, {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-gray-50">
      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
    </div>
  ),
});

function CanvasPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const noteId = searchParams?.get("id");
  const taskId = searchParams?.get("taskId");
  const taskTitle = searchParams?.get("taskTitle");
  const template = searchParams?.get("template");

  const apiRef = useRef<ExcalidrawImperativeAPI | null>(null);

  const { title, setTitle, description, setDescription, isShareable, setIsShareable, initialScene, isLoading } =
    useCanvasNote({ noteId, template });

  const [isSaving, setIsSaving] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraMode, setCameraMode] = useState<"image" | "ocr">("image");
  const [showOcr, setShowOcr] = useState(false);
  const [ocrImageUrl, setOcrImageUrl] = useState<string | null>(null);

  const handleAddImage = useCallback(async (file: File) => {
    if (!apiRef.current) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      const id = crypto.randomUUID() as FileId;

      const fileData: BinaryFileData = {
        id,
        dataURL: dataUrl as BinaryFileData["dataURL"],
        mimeType: file.type as BinaryFileData["mimeType"],
        created: Date.now(),
      };

      await apiRef.current!.addFiles([fileData]);

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

  const handleCameraCapture = useCallback(
    async (dataUrl: string) => {
      setShowCamera(false);

      if (cameraMode === "ocr") {
        setOcrImageUrl(dataUrl);
        setShowOcr(true);
        return;
      }

      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], `camera-${Date.now()}.jpg`, { type: "image/jpeg" });
      await handleAddImage(file);
    },
    [cameraMode, handleAddImage],
  );

  const handleOcrComplete = useCallback((text: string) => {
    setShowOcr(false);
    setOcrImageUrl(null);
    if (!apiRef.current || !text) return;

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

  const handleSave = async () => {
    if (!apiRef.current) return;
    setIsSaving(true);
    try {
      const elements = apiRef.current.getSceneElements();
      const appState = apiRef.current.getAppState();
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
          elements,
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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) handleAddImage(file);
    event.target.value = "";
  };

  const handleOcrFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setOcrImageUrl(ev.target?.result as string);
        setShowOcr(true);
      };
      reader.readAsDataURL(file);
    }
    event.target.value = "";
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <CanvasHeader
        title={title}
        description={description}
        isShareable={isShareable}
        onTitleChange={setTitle}
        onDescriptionChange={setDescription}
        onToggleShareable={setIsShareable}
        onSave={handleSave}
        saving={isSaving}
        onSelectImageFile={handleFileSelect}
        onSelectOcrFile={handleOcrFileSelect}
        onOpenCamera={(mode) => {
          setCameraMode(mode);
          setShowCamera(true);
        }}
        taskTitle={taskTitle}
      />

      <div className="min-h-0 flex-1">
        <div className="h-full w-full">
          <Excalidraw
            excalidrawAPI={(api) => {
              apiRef.current = api;
            }}
            initialData={{
              elements: initialScene?.elements ?? EMPTY_SCENE.elements,
              appState: {
                ...EMPTY_SCENE.appState,
                ...(initialScene?.appState ?? {}),
                zenModeEnabled: false,
              },
            }}
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
      </div>

      <CanvasCaptureModals
        showCamera={showCamera}
        showOcr={showOcr}
        ocrImageUrl={ocrImageUrl}
        onCapture={handleCameraCapture}
        onCloseCamera={() => setShowCamera(false)}
        onOcrComplete={handleOcrComplete}
        onCloseOcr={() => {
          setShowOcr(false);
          setOcrImageUrl(null);
        }}
      />

      <details className="border-t bg-gray-50 px-3 py-2 text-sm leading-relaxed text-gray-600 shadow-inner dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 sm:px-4">
        <summary className="cursor-pointer text-sm font-semibold text-gray-700 dark:text-gray-200">💡 使い方ヒント</summary>
        <ul className="mt-2 space-y-1 pl-4 text-xs text-gray-600 dark:text-gray-400">
          <li>🖊️ 左のツールバーで図形・テキスト・フリーハンドを選択</li>
          <li>🖼 画像はドラッグ&ドロップでも追加可能</li>
          <li>🔠 OCRで画像からテキストを抽出してキャンバスに配置</li>
          <li>↕️ 全てのオブジェクトは移動・拡大縮小・回転可能</li>
        </ul>
      </details>
    </div>
  );
}

export default function CanvasPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
        </div>
      }
    >
      <CanvasPageContent />
    </Suspense>
  );
}
