type UnclaimedRewardsBannerProps = {
  count: number;
  onClaimAll: () => void;
};

export function UnclaimedRewardsBanner({ count, onClaimAll }: UnclaimedRewardsBannerProps) {
  if (count <= 0) return null;
  return (
    <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 shadow-sm">
      <div className="text-sm font-semibold text-emerald-800">
        📢 報酬を受け取れる実績があります！（{count}件）
      </div>
      <button
        type="button"
        onClick={onClaimAll}
        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white shadow hover:bg-emerald-700"
      >
        まとめて受け取る
      </button>
    </div>
  );
}
