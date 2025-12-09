import { useEffect, useState } from "react";

type XpToastProps = {
  xpEarned: number;
  questTitle: string;
  levelUp?: boolean;
  newLevel?: number;
  onClose: () => void;
};

export function XpToast({ xpEarned, questTitle, levelUp, newLevel, onClose }: XpToastProps) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(onClose, 200);
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const baseClass =
    "w-full max-w-sm rounded-2xl border px-4 py-3 shadow-2xl transition text-slate-900 dark:text-slate-50";

  const levelUpClass = levelUp
    ? "bg-gradient-to-r from-amber-400 to-amber-500 border-amber-300 text-slate-900 animate-pulse"
    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700";

  return (
    <div className={`${baseClass} ${levelUpClass} ${exiting ? "animate-slide-out-right" : "animate-slide-in-right"}`}>
      <div className="text-lg font-bold">✨ +{xpEarned} XP</div>
      <div className="text-sm font-semibold">「{questTitle}」を完了！</div>
      {levelUp && (
        <div className="mt-1 text-sm font-bold text-slate-900">
          🎉 レベルアップ！ {newLevel ? `Lv.${newLevel}` : ""}
        </div>
      )}
    </div>
  );
}
