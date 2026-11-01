"use client";

import { useEffect, useRef, useState } from "react";

export function Prompt({ title, text }: { title: string; text: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setStatus("copied");
    } catch {
      setStatus("error");
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus("idle"), 2500);
  }

  return (
    <div className="prompt">
      <div className="prompt__head"><span>Prompt starter</span><button type="button" onClick={copy} aria-label={`Copy ${title} prompt`}>{status === "copied" ? "Copied!" : "Copy"}</button></div>
      <code>{text}</code>
      <span className={`prompt__status${status === "error" ? " prompt__status--error" : ""}`} role="status" aria-live="polite">{status === "copied" ? "Prompt copied to clipboard." : status === "error" ? "Clipboard unavailable. Select the prompt text to copy it manually." : ""}</span>
    </div>
  );
}
