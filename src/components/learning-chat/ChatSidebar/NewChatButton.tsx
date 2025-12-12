"use client";

import { ChatMode, LearningCategory } from "@/features/learning-chat/types";
import { Button } from "@/components/ui/Button";

type Props = {
  onCreate: (mode?: ChatMode, category?: LearningCategory) => Promise<unknown>;
};

export function NewChatButton({ onCreate }: Props) {
  return (
    <Button
      variant="solid"
      color="slate"
      size="tap"
      className="w-full rounded-full sm:w-auto"
      onClick={() => onCreate()}
    >
      ＋ 新規チャット
    </Button>
  );
}
