export default function MindMapNewPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">新規マインドマップ</h1>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        ここからマインドマップ作成画面に遷移する予定です。現時点ではAPI `/api/mindmap` の POST で作成できます。
      </p>
    </div>
  );
}
