"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { getChapters } from "@/lib/localized-concepts";
import { languagePath, localePath, messages } from "@/lib/i18n";
import { useLocale } from "@/components/LocaleProvider";
import { sitePath } from "@/lib/concepts";

function subscribeHash(callback: () => void): () => void {
  window.addEventListener("hashchange", callback);
  window.addEventListener("popstate", callback);
  return () => {
    window.removeEventListener("hashchange", callback);
    window.removeEventListener("popstate", callback);
  };
}
const getHash = () => window.location.hash;
const getServerHash = () => "";

export function Header() {
  const locale = useLocale();
  const t = messages[locale];
  const chapters = getChapters(locale);
  const [active, setActive] = useState("");
  const pathname = usePathname();
  const hash = useSyncExternalStore(subscribeHash, getHash, getServerHash);
  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>(".chapter");
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
    }, { rootMargin: "-10% 0px -70% 0px" });
    sections.forEach(section => observer.observe(section));
    return () => observer.disconnect();
  }, [pathname]);
  return (
    <header className="bar">
      <div className="bar__inner">
        <Link className="logo" href={localePath(locale, "/")} aria-label={t.homeLabel}><span className="logo__mark" aria-hidden="true"><i /><i /><i /><i /></span>{locale === "zh" ? "游戏开发" : "Game dev"} <span className="logo__lab">{locale === "zh" ? "实验室" : "lab"}</span></Link>
        <nav aria-label={t.chaptersLabel} className="bar__nav">
          {chapters.map(chapter => <Link key={chapter.id} href={localePath(locale, `/#chapter-${chapter.id}`)} data-category={chapter.id} onClick={() => document.dispatchEvent(new Event("reset-concept-filters"))} aria-current={active === `chapter-${chapter.id}` ? "location" : undefined}>{chapter.title}</Link>)}
        </nav>
        <div className="bar__actions">
          <nav className="language-switch" aria-label={t.languageLabel}>
            {(["en", "zh"] as const).map(language => (
              <a key={language} href={`${sitePath(languagePath(pathname, language))}${hash}`} lang={language === "zh" ? "zh-CN" : "en"} hrefLang={language === "zh" ? "zh-CN" : "en"}
                aria-label={language === "zh" ? "简体中文" : "English"} aria-current={locale === language ? "page" : undefined}
                onClick={event => { event.currentTarget.href = `${sitePath(languagePath(window.location.pathname, language))}${window.location.hash}`; }}>
                {language === "zh" ? "CN" : "EN"}
              </a>
            ))}
          </nav>
          <a className="bar__link" href="https://github.com/huangyingting/gamedev" target="_blank" rel="noreferrer">{t.viewSource} <span aria-hidden="true">↗</span></a>
        </div>
      </div>
    </header>
  );
}
