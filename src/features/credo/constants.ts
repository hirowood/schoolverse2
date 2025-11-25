type CredoText = {
  pageTitle: string;
  pageDescription: string;
  loadingSessionTitle: string;
  loadingSessionDescription: string;
  unauthTitle: string;
  unauthDescription: string;
  unauthHint: string;
  dateLabel: string;
  summaryTitle: string;
  summarySubtitle: string;
  summaryRate: string;
  summaryCount: string;
  summaryRanking: string;
  summaryMissing: string;
  summaryHighlight: string;
  summaryLoading: string;
  summaryEmptyHighlight: string;
  summaryEmptyRanking: string;
  summaryMissingMore: (n: number) => string;
  summaryTopLabel: string;
  summaryRangeLabel: (count: number) => string;
  badgeDone: string;
  coachHigh: string;
  coachMid: string;
  coachLow: string;
  todaySummaryTitle: string;
  todayDateLabel: (date: string) => string;
  todayHint: string;
  todayLoading: string;
  todaySaving: string;
  modalDoneLabel: string;
  modalNoteLabel: string;
  modalNotePlaceholder: string;
  modalCancel: string;
  modalSave: string;
  errorAuth: string;
  errorFetch: string;
  errorSummary: string;
};

export const CREDO_TEXT: CredoText = {
  pageTitle: "クレドボード",
  pageDescription:
    "クレドをクリックするとモーダルで記録できます。実践できたら「完了」、気づきメモは週次サマリーに反映されます。",

  // Auth / loading
  loadingSessionTitle: "クレドボード",
  loadingSessionDescription: "セッションを確認しています...",
  unauthTitle: "クレドボード",
  unauthDescription: "ホームのログインモーダルからサインインすると、クレドの記録と週次サマリーを利用できます。",
  unauthHint: "※ ホーム上部のログイン/新規登録モーダルからサインインしてください。",

  // Headline
  dateLabel: "日付",

  // Summary section
  summaryTitle: "週次サマリー",
  summarySubtitle: "週内の振り返りプレビュー",
  summaryRate: "実践率",
  summaryCount: "実践数",
  summaryRanking: "よくやった項目",
  summaryMissing: "未実践",
  summaryHighlight: "ハイライト",
  summaryLoading: "更新中...",
  summaryEmptyHighlight: "まだありません",
  summaryEmptyRanking: "まだありません",
  summaryMissingMore: (n: number) => `+${n}件`,
  summaryTopLabel: "トップ3",
  summaryRangeLabel: (count: number) => `11項目中 ${count} 件`,
  badgeDone: "実践済み",

  // Coach comments
  coachHigh: "かなりいい調子です。引き続き頑張りましょう！",
  coachMid: "まずは1日1つだけ、慣れてきたら増やしてみよう。",
  coachLow: "クレドの中から3つに絞ってやってみよう。",

  // Today list
  todaySummaryTitle: "今日のサマリー",
  todayDateLabel: (date: string) => `日付: ${date}`,
  todayHint:
    "サマリー順はドラッグ（マウス/タッチ対応）で並べ替えできます。元に戻すときは再読み込みしてください。",
  todayLoading: "読み込み中...",
  todaySaving: "保存中...",

  // Modal
  modalDoneLabel: "このクレドを実践した",
  modalNoteLabel: "気づきメモ",
  modalNotePlaceholder: "気づきを短く書いてみよう（200文字まで）",
  modalCancel: "キャンセル",
  modalSave: "保存",

  // Errors
  errorAuth: "サインインしてください",
  errorFetch: "データ取得に失敗しました",
  errorSummary: "サマリーの取得に失敗しました",
};
