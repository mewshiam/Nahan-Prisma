"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable — ignore */
    }
  };

  return (
    <button
      onClick={copy}
      aria-label="Copy command to clipboard"
      className="shrink-0 rounded-md border border-white/10 bg-white/5 p-1.5 text-neutral-400 transition-colors hover:bg-white/10 hover:text-white"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-[var(--np-cyan)]" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  );
}
