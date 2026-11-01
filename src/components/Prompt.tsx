"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { copyLabel, messages } from "@/lib/i18n";

export function Prompt({ title, text }: { title: string; text: string }) {
  const locale = useLocale();
  const t = messages[locale];
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
      <div className="prompt__head"><span>{t.promptStarter}</span><button type="button" onClick={copy} aria-label={copyLabel(locale, title)}>{status === "copied" ? t.copied : t.copy}</button></div>
      <code>{text}</code>
      <span className={`prompt__status${status === "error" ? " prompt__status--error" : ""}`} role="status" aria-live="polite">{status === "copied" ? t.copySuccess : status === "error" ? t.copyError : ""}</span>
    </div>
  );
}
