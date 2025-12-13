"use client";

// キャンバスノートの状態と初期化ロジックをまとめた再利用可能なフック
import { useEffect, useState } from "react";
import type { SceneSnapshot } from "./types";
import { EMPTY_SCENE } from "./types";

interface UseCanvasNoteArgs {
  noteId?: string | null;
  template?: string | null;
}

export function useCanvasNote({ noteId, template }: UseCanvasNoteArgs) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isShareable, setIsShareable] = useState(false);
  const [initialScene, setInitialScene] = useState<SceneSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(() => Boolean(noteId));

  // 既存ノート読み込み
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
            ? (note.drawingData.elements as SceneSnapshot["elements"])
            : EMPTY_SCENE.elements;
          const appState =
            note.drawingData.appState && typeof note.drawingData.appState === "object"
              ? (note.drawingData.appState as SceneSnapshot["appState"])
              : EMPTY_SCENE.appState;
          setInitialScene({ elements, appState });
        } else {
          setInitialScene(EMPTY_SCENE);
        }
      } catch (error) {
        console.error("Failed to load note:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNote();
  }, [noteId]);

  // テンプレート適用（新規作成時のみ）
  useEffect(() => {
    if (noteId) return;
    if (!template) return;

    if (template === "5w2h") {
      setTitle("5W2Hノート");
      setDescription(
        [
          "【5W2H テンプレート】",
          "Who（誰が）:",
          "What（何を）:",
          "Why（なぜ）:",
          "When（いつ）:",
          "Where（どこで）:",
          "How（どのように）:",
          "How much（いくらで / どれくらい）:",
        ].join("\n"),
      );
    } else if (template === "5why") {
      setTitle("5Whyノート");
      setDescription(
        ["【5Why テンプレート】", "課題 / 事象:", "Why 1:", "Why 2:", "Why 3:", "Why 4:", "Why 5:", "対策案:"].join("\n"),
      );
    } else {
      setTitle("");
      setDescription("");
    }
  }, [noteId, template]);

  return {
    title,
    setTitle,
    description,
    setDescription,
    isShareable,
    setIsShareable,
    initialScene,
    setInitialScene,
    isLoading,
    setIsLoading,
  };
}
