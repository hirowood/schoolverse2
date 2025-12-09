"use client";

import { XpToast } from "@/components/gamification/XpToast";
import { useQuestStore } from "@/hooks/useQuestStore";

export function XpToastContainer() {
  const lastXpGain = useQuestStore((state) => state.lastXpGain);
  const clearLastXpGain = useQuestStore((state) => state.clearLastXpGain);

  if (!lastXpGain) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <XpToast
        xpEarned={lastXpGain.xpEarned}
        questTitle={lastXpGain.questTitle}
        levelUp={lastXpGain.levelUp}
        newLevel={lastXpGain.newLevel}
        onClose={clearLastXpGain}
      />
    </div>
  );
}
