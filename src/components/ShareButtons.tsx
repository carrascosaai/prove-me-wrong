"use client";

import { useState } from "react";

export function ShareButtons({
  url,
  text,
}: {
  url: string;
  text: string;
}) {
  const [copied, setCopied] = useState(false);

  const x = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    text,
  )}&url=${encodeURIComponent(url)}`;
  const wa = `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  }

  const btn =
    "inline-flex items-center justify-center gap-2 rounded-md border border-line px-3 py-2 text-sm font-medium hover:bg-white/5 hover:border-line-strong transition-colors";

  return (
    <div className="flex flex-wrap gap-2">
      <a className={btn} href={x} target="_blank" rel="noopener noreferrer">
        Share on X
      </a>
      <a className={btn} href={wa} target="_blank" rel="noopener noreferrer">
        WhatsApp
      </a>
      <button type="button" className={btn} onClick={copy}>
        {copied ? "Copied ✓" : "Copy link"}
      </button>
    </div>
  );
}
