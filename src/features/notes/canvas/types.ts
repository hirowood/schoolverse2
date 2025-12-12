"use client";

// Excalidraw の型はパッケージ側で提供されているので、ここでは再エクスポートして集約する。
// （Canvasページ/関連フックから同じ import パスで参照できるようにする目的）
import type { ExcalidrawElement as _ExcalidrawElement, FileId as _FileId } from "@excalidraw/excalidraw/element/types";
import type { AppState as _AppState, BinaryFileData as _BinaryFileData, ExcalidrawImperativeAPI as _ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

export type ExcalidrawElement = _ExcalidrawElement;
export type FileId = _FileId;
export type BinaryFileData = _BinaryFileData;
export type AppState = _AppState;
export type ExcalidrawImperativeAPI = _ExcalidrawImperativeAPI;

export interface SceneSnapshot {
  elements: readonly ExcalidrawElement[];
  appState: Partial<AppState>;
}

export const EMPTY_SCENE: SceneSnapshot = {
  elements: [],
  appState: {
    viewBackgroundColor: "#ffffff",
    zenModeEnabled: false,
  },
};
