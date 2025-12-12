"use client";

// 保存済みノートの一覧とアクションボタンをまとめたコンポーネント
import Link from "next/link";
import type { NoteRecord, NoteTemplateType } from "@/lib/notes/types";
import { Button, buttonClassName } from "@/components/ui/Button";
import { cardClassName } from "@/components/ui/Card";

type Props = {
  notes: NoteRecord[];
  loading: boolean;
  analyzingNoteId: string | null;
  requestingCoach: string | null;
  deletingId: string | null;
  onAnalyze: (noteId: string) => void;
  onRequestCoach: (noteId: string) => void;
  onSelect: (note: NoteRecord) => void;
  onDelete: (noteId: string) => void;
  formatIso: (d: Date | string) => string;
  templateLabels: Map<NoteTemplateType | string, string>;
};

export function NotesList({
  notes,
  loading,
  analyzingNoteId,
  requestingCoach,
  deletingId,
  onAnalyze,
  onRequestCoach,
  onSelect,
  onDelete,
  formatIso,
  templateLabels,
}: Props) {
  return (
    <section className={cardClassName({})}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">保存済みノート</h2>
        <span className="text-xs text-slate-500 dark:text-slate-400">編集して再保存できます</span>
      </div>
      {loading ? (
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">読み込み中...</p>
      ) : notes.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">まだノートがありません</p>
      ) : (
        <div className="mt-3 space-y-3">
          {notes.map((note) => (
            <article
              key={note.id}
              className={cardClassName({ variant: "subtle", padding: "sm", shadow: "none" })}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{note.title || "無題のノート"}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {note.templateType
                      ? `テンプレート: ${templateLabels.get(note.templateType) ?? note.templateType}`
                      : "テンプレート未設定"}
                    ・更新: {formatIso(note.updatedAt)}
                    {note.analyzedAt && <span className="ml-1 text-blue-500">✨ AI分析済み</span>}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    画像: {note.imageFiles.length}件 / OCR: {note.ocrTexts.length}件
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs sm:text-[11px]">
                  <Button
                    rounded="full"
                    size="chipXs"
                    variant="soft"
                    color="purple"
                    onClick={() => onAnalyze(note.id)}
                    disabled={analyzingNoteId === note.id}
                  >
                    {analyzingNoteId === note.id ? "🔍 分析中..." : "🔍 AI分析"}
                  </Button>
                  <Button
                    rounded="full"
                    size="chipXs"
                    variant="soft"
                    color="blue"
                    onClick={() => onRequestCoach(note.id)}
                    disabled={requestingCoach === note.id}
                  >
                    {requestingCoach === note.id ? "🤖 分析中..." : "🤖 AIコーチ"}
                  </Button>
                  <Button
                    rounded="full"
                    size="chipXs"
                    variant="outline"
                    color="slate"
                    className="hover:border-slate-500"
                    onClick={() => onSelect(note)}
                  >
                    編集
                  </Button>
                  <Link
                    href={`/notes/canvas?id=${note.id}`}
                    className={buttonClassName({
                      variant: "outline",
                      color: "slate",
                      size: "chipXs",
                      rounded: "full",
                      className: "hover:border-slate-500",
                    })}
                  >
                    キャンバス
                  </Link>
                  <Button
                    rounded="full"
                    size="chipXs"
                    variant="outline"
                    color="red"
                    onClick={() => onDelete(note.id)}
                    disabled={deletingId === note.id}
                  >
                    {deletingId === note.id ? "削除中..." : "削除"}
                  </Button>
                </div>
              </div>

              {/* AI要約表示 */}
              {note.aiSummary && (
                <div className="mt-2 rounded-md bg-blue-50 p-2 dark:bg-blue-900/20">
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    <span className="font-medium">📝 AI要約:</span> {note.aiSummary}
                  </p>
                </div>
              )}

              <p className="mt-2 text-sm text-slate-700 dark:text-slate-300 line-clamp-2">{note.content ?? "内容がありません"}</p>

              {/* タグ表示（手動 + 自動） */}
              {(note.tags.length > 0 || (note.autoTags && note.autoTags.length > 0)) && (
                <div className="mt-2 flex flex-wrap gap-1 text-[11px]">
                  {note.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200">
                      #{tag}
                    </span>
                  ))}
                  {note.autoTags?.map((tag) => (
                    <span key={`auto-${tag}`} className="rounded-full bg-blue-50 px-2 py-1 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200">
                      #AI:{tag}
                    </span>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
