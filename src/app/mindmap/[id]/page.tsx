interface Props {
  params: { id: string };
}

export default function MindMapDetailPage({ params }: Props) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">マインドマップ編集</h1>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        ID: {params.id}
      </p>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        編集UIはこれから実装します。API経由でノードやエッジの操作が可能です。
      </p>
    </div>
  );
}
