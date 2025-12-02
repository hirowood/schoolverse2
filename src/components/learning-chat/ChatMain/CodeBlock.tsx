"use client";

import { useState } from "react";

type Props = {
  language?: string;
  code: string;
};

export function CodeBlock({ language = "text", code }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="rounded-md border border-slate-200 bg-slate-900 text-slate-100">
      <div className="flex items-center justify-between px-3 py-1 text-[11px] uppercase tracking-wide text-slate-300">
        <span>{language}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded bg-slate-800 px-2 py-1 text-[10px] font-semibold text-white hover:bg-slate-700"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto px-3 py-2 text-xs leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}
