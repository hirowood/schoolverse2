import { credoItems } from "../data/credoItems";
import { CredoCard } from "./CredoCard";

/**
 * クレド実践ページ全体のボード
 * 上部に説明文、その下にクレドカードのグリッドを表示する
 */
export function CredoBoard() {
  return (
    <div className="space-y-4">
      {/* タイトル＋説明 */}
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">クレド実践ボード</h1>
        <p className="text-sm text-slate-600">
          池田裕樹さんのクレド11箇条を、毎日の行動や振り返りに落とし込むためのボードです。
        </p>
        <p className="text-xs text-slate-500">
          今日は「一歩実践できそうなルール」を1つ選んでチェック。徐々にスクラップや日次メモなども追加していけます。
        </p>
      </header>

      {/* カードのグリッド */}
      <section className="grid gap-4 lg:grid-cols-2">
        {credoItems.map((item) => (
          <CredoCard key={item.id} item={item} />
        ))}
      </section>
    </div>
  );
}
