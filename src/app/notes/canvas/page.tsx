"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import "@excalidraw/excalidraw/index.css";
import "./toolbar-touch.css";
import { CanvasCaptureModals } from "@/features/notes/canvas/CanvasCaptureModals";
import { CanvasHeader } from "@/features/notes/canvas/CanvasHeader";
import { useCanvasNote } from "@/features/notes/canvas/useCanvasNote";
import {
  AppState,
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
  const clampZoom = (value: number) => Math.min(4, Math.max(0.2, value));
  const [zoomPercent, setZoomPercent] = useState(100);
  const [toolbarTop, setToolbarTop] = useState<number>(16);

  const updateZoomLabel = useCallback(() => {
    const current = apiRef.current?.getAppState().zoom?.value ?? 1;
    setZoomPercent(Math.round(current * 100));
  }, []);

  const zoomBy = useCallback(
    (delta: number) => {
      const api = apiRef.current;
      if (!api) return;
      const current = api.getAppState().zoom?.value ?? 1;
      const next = clampZoom(current + delta);
      const nextZoom = { value: next as AppState["zoom"]["value"] };
      api.updateScene({ appState: { zoom: nextZoom } });
      updateZoomLabel();
    },
    [updateZoomLabel],
  );

  useEffect(() => {
    updateZoomLabel();
  }, [updateZoomLabel]);

  useEffect(() => {
    const updateToolbarPosition = () => {
      const header = document.querySelector<HTMLElement>("[data-canvas-header]");
      const headerBottom = header?.getBoundingClientRect().bottom ?? 0;
      setToolbarTop(Math.max(12, headerBottom + 12));
    };

    updateToolbarPosition();
    window.addEventListener("resize", updateToolbarPosition);

    const header = document.querySelector<HTMLElement>("[data-canvas-header]");
    const resizeObserver =
      header && typeof ResizeObserver !== "undefined" ? new ResizeObserver(updateToolbarPosition) : null;
    if (header) resizeObserver?.observe(header);

    return () => {
      window.removeEventListener("resize", updateToolbarPosition);
      resizeObserver?.disconnect();
    };
  }, []);

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
        <div className="excalidraw-container relative h-full w-full">
          <div className="pointer-events-none fixed left-0 right-0 z-20 px-4" style={{ top: toolbarTop }}>
            <div className="pointer-events-auto mx-auto flex max-w-5xl flex-wrap items-center gap-2 rounded-xl bg-white/95 p-3 shadow-lg ring-1 ring-slate-200 dark:bg-slate-800/95 dark:ring-slate-700">
              <ToolbarButton label="メニュー" onClick={() => undefined}>
                ☰
              </ToolbarButton>
              <ToolbarButton label="拡大" onClick={() => zoomBy(0.2)}>
                ＋
              </ToolbarButton>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{zoomPercent}%</span>
              <ToolbarButton label="縮小" onClick={() => zoomBy(-0.2)}>
                －
              </ToolbarButton>
              <ToolbarButton
                label="Undo"
                onClick={() => {
                  const historyApi = apiRef.current as unknown as { history?: { undo?: () => void } };
                  historyApi.history?.undo?.();
                }}
              >
                ↶
              </ToolbarButton>
              <ToolbarButton
                label="Redo"
                onClick={() => {
                  const historyApi = apiRef.current as unknown as { history?: { redo?: () => void } };
                  historyApi.history?.redo?.();
                }}
              >
                ↷
              </ToolbarButton>
              <ToolSelector
                onSelect={(tool) => apiRef.current?.setActiveTool?.({ type: tool } as { type: ToolType })}
                activeTool={apiRef.current?.getAppState().activeTool?.type}
                orientation="row"
              />
            </div>
          </div>

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

      {/* Mobile action bar below canvas header for consistent spacing */}
      <div
        className="sticky z-20 bg-gray-50 px-4 pt-2 pb-3 dark:bg-gray-900 md:hidden"
        style={{ top: toolbarTop }}
      >
        <div className="flex flex-wrap items-center gap-2">
          <ToolbarButton label="メニュー" onClick={() => undefined}>
            ☰
          </ToolbarButton>
          <ToolbarButton label="拡大" onClick={() => zoomBy(0.2)}>
            ＋
          </ToolbarButton>
          <ToolbarButton label="縮小" onClick={() => zoomBy(-0.2)}>
            －
          </ToolbarButton>
          <ToolbarButton
            label="Undo"
            onClick={() => {
              const historyApi = apiRef.current as unknown as { history?: { undo?: () => void } };
              historyApi.history?.undo?.();
            }}
          >
            ↶
          </ToolbarButton>
          <ToolbarButton
            label="Redo"
            onClick={() => {
              const historyApi = apiRef.current as unknown as { history?: { redo?: () => void } };
              historyApi.history?.redo?.();
            }}
          >
            ↷
          </ToolbarButton>
          <ToolSelector
            onSelect={(tool) => apiRef.current?.setActiveTool?.({ type: tool } as { type: ToolType })}
            activeTool={apiRef.current?.getAppState().activeTool?.type}
            orientation="row"
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

type ToolType = "selection" | "rectangle" | "diamond" | "ellipse" | "arrow" | "line" | "freedraw" | "text";

interface ToolSelectorProps {
  onSelect: (tool: ToolType) => void;
  activeTool?: string;
  orientation?: "desktop" | "mobile" | "row";
}

const TOOL_ITEMS: Array<{ type: ToolType; label: string; icon: string }> = [
  { type: "selection", label: "選択", icon: "🖱" },
  { type: "rectangle", label: "四角", icon: "▭" },
  { type: "diamond", label: "ひし形", icon: "◇" },
  { type: "ellipse", label: "丸", icon: "◯" },
  { type: "arrow", label: "矢印", icon: "➡" },
  { type: "line", label: "線", icon: "─" },
  { type: "freedraw", label: "フリーハンド", icon: "✏" },
  { type: "text", label: "テキスト", icon: "A" },
];

function ToolSelector({ onSelect, activeTool, orientation = "row" }: ToolSelectorProps) {
  const base = orientation === "row" ? "flex flex-row flex-wrap gap-2" : "flex flex-col gap-2";

  return (
    <div className={base}>
      {TOOL_ITEMS.map((item) => {
        const isActive = activeTool === item.type;
        return (
          <button
            key={item.type}
            type="button"
            onClick={() => onSelect(item.type)}
            className={`inline-flex min-w-[3.25rem] items-center justify-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold shadow-sm ring-1 ring-slate-200 transition ${
              isActive ? "bg-indigo-600 text-white ring-indigo-400" : "bg-white text-slate-800 dark:bg-slate-700 dark:text-white"
            }`}
            aria-pressed={isActive}
          >
            <span>{item.icon}</span>
            <span className="hidden sm:inline">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

interface ToolbarButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  label: string;
}

function ToolbarButton({ onClick, children, label }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-w-[3.25rem] items-center justify-center gap-1 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 dark:bg-slate-700 dark:text-white dark:ring-slate-600"
      aria-label={label}
    >
      {children}
      <span className="hidden sm:inline">{label}</span>
    </button>
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
