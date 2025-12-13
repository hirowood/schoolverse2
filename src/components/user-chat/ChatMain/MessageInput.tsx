"use client";

import { Button } from "@/components/ui/Button";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onBlur?: () => void;
  onFocusChange?: (focused: boolean) => void;
  disabled?: boolean;
};

export function MessageInput({ value, onChange, onSend, onBlur, onFocusChange, disabled }: Props) {
  const canSend = !disabled && value.trim().length > 0;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => onFocusChange?.(true)}
        onBlur={() => {
          onBlur?.();
          onFocusChange?.(false);
        }}
        placeholder="メッセージを入力..."
        className="min-h-[120px] flex-1 rounded-2xl border border-slate-200/80 px-4 py-3 text-base shadow-inner focus:border-slate-400 focus:outline-none"
        rows={4}
        disabled={disabled}
      />
      <Button
        variant="solid"
        color="slate"
        size="tap"
        onClick={onSend}
        disabled={!canSend}
        className="w-full rounded-2xl py-3 text-base sm:w-40"
      >
        送信
      </Button>
    </div>
  );
}

