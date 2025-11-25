import { CredoItem } from "./types";

// 中高生にも伝わるよう少しやわらかめに表現したクレド11箇条
export const CREDO_ITEMS: CredoItem[] = [
  {
    id: "credo-1",
    order: 1,
    category: "情報の受け取り方",
    title: "頭で覚えず、必ずメモに残す",
    description:
      "指示・予定・不安は1行1情報でメモ。聞いたことは自分の言葉でメモしておく。",
  },
  {
    id: "credo-2",
    order: 2,
    category: "思考の整理",
    title: "全部出して、ざっくり分けてから考える",
    description:
      "事実・タスク・気持ちをいったん全部書き出し、勉強/生活/健康などに分けて整理する。",
  },
  {
    id: "credo-3",
    order: 3,
    category: "タスク管理",
    title: "今日やる3つを決めて、5〜15分で動く",
    description:
      "小さく約束して守る。終わらなければさらに分解して次の日に回す。",
  },
  {
    id: "credo-4",
    order: 4,
    category: "体調と気分",
    title: "状態を記録し、呼吸と小休憩でリセット",
    description:
      "睡眠/体温/気分をメモ。詰まったら4-4-6呼吸と短い休憩で切り替える。",
  },
  {
    id: "credo-5",
    order: 5,
    category: "運動",
    title: "前日に時間とメニュー3つを決めて淡々とやる",
    description:
      "行く時間とウォームアップ・メイン・ストレッチを決め、迷わず実行。行けない日はストレッチや散歩で代替。",
  },
  {
    id: "credo-6",
    order: 6,
    category: "食事",
    title: "プロテイン・魚・野菜を意識する",
    description:
      "完璧を狙わず、取れた要素を評価。朝や運動後にプロテイン、魚と野菜を生活に入れる。",
  },
  {
    id: "credo-7",
    order: 7,
    category: "部屋と環境",
    title: "朝3分・夜5分・週1の30分リセット",
    description:
      "短いリセットを習慣化し、週1回は徹底整理。いらないものを処分し、紙は仕分けする。",
  },
  {
    id: "credo-8",
    order: 8,
    category: "日々の改善",
    title: "毎日「小さな改善と一歩」を1つ積む",
    description:
      "読書や記事から1つ学びをメモ。呼吸/運動/整理など続いた習慣にチェックを入れる。",
  },
  {
    id: "credo-9",
    order: 9,
    category: "自己受容",
    title: "できなかった日も「今日のデータ」として受け取る",
    description:
      "過去ではなく今日の事実で評価。守れるサイズの約束を反復し、できたら必ず記録する。",
  },
  {
    id: "credo-10",
    order: 10,
    category: "コミュニケーション",
    title: "事実と気持ちを分け、ていねいに伝える",
    description:
      "『事実＋自分の感情＋してほしいこと』で伝える。相手の立場を想像してから送る。",
  },
  {
    id: "credo-11",
    order: 11,
    category: "1日の終わり方",
    title: "今日の一歩・学び・改善を書いて区切る",
    description:
      "完了タスクと学びを1つ記録し、呼吸と短い瞑想で区切る。続いた習慣にチェックを入れる。",
  },
];
