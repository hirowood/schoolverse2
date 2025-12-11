type Props = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onBlur?: () => void;
  onFocusChange?: (focused: boolean) => void;
  disabled?: boolean;
};

export function MessageInput({ value, onChange, onSend, onBlur, onFocusChange, disabled }: Props) {
  return (
    <div className="flex items-end gap-2">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => onFocusChange?.(true)}
        onBlur={() => {
          onBlur?.();
          onFocusChange?.(false);
        }}
        placeholder="メッセージを入力..."
        className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-inner focus:border-slate-400 focus:outline-none"
        rows={3}
        disabled={disabled}
      />
      <button
        type="button"
        onClick={onSend}
        disabled={disabled || value.trim().length === 0}
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60"
      >
        送信
      </button>
    </div>
  );
}
