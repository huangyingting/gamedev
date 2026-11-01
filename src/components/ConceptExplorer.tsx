"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Demo } from "@/components/Demo";
import { Prompt } from "@/components/Prompt";
import { concepts as englishConcepts, type Category } from "@/lib/concepts";
import { getChapters, getConcepts } from "@/lib/localized-concepts";
import { conceptCount, localePath, messages, resultsText } from "@/lib/i18n";
import { useLocale } from "@/components/LocaleProvider";

export function ConceptExplorer() {
  const locale = useLocale();
  const t = messages[locale];
  const chapters = getChapters(locale);
  const concepts = getConcepts(locale);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "all">("all");
  const searchRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const filtered = concepts.filter(concept => {
    if (category !== "all" && concept.category !== category) return false;
    const english = englishConcepts[concept.number - 1];
    const content = `${concept.slug} ${concept.title} ${concept.tagline} ${concept.description} ${concept.prompt} ${concept.example} ${english.title} ${english.tagline} ${english.description} ${english.prompt} ${english.example}`.toLowerCase();
    return words.every(word => content.includes(word));
  });
  const filtering = query.trim() !== "" || category !== "all";

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;
      if (event.key === "/" && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    const reset = () => { setQuery(""); setCategory("all"); };
    window.addEventListener("keydown", onKey);
    document.addEventListener("reset-concept-filters", reset);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("reset-concept-filters", reset);
    };
  }, []);

  function reset() { setQuery(""); setCategory("all"); }

  return (
    <div className="chapters">
      <section className="library" id="library" aria-labelledby="library-title">
        <div className="library__heading">
          <div><p className="detail__kicker">{t.libraryKicker}</p><h2 id="library-title">{t.libraryTitle}<span>.</span></h2></div>
          <button className="surprise-button" type="button" disabled={!filtered.length} onClick={() => {
            const concept = filtered[Math.floor(Math.random() * filtered.length)];
            router.push(localePath(locale, `/concepts/${concept.slug}/`));
          }}><span aria-hidden="true">⤨</span> {t.surprise}</button>
        </div>
        <div className="library__tools">
          <div className="search-field">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></svg>
            <input ref={searchRef} type="search" aria-label={t.searchLabel} placeholder={t.searchPlaceholder} value={query}
              onChange={event => setQuery(event.target.value)} onKeyDown={event => { if (event.key === "Escape") { setQuery(""); event.currentTarget.blur(); } }} />
            {query ? <button type="button" aria-label={t.clearSearch} onClick={() => { setQuery(""); searchRef.current?.focus(); }}>×</button> : <kbd aria-hidden="true">/</kbd>}
          </div>
          <div className="category-filters" role="group" aria-label={t.filterLabel}>
            <button type="button" aria-pressed={category === "all"} onClick={() => setCategory("all")}>{t.allConcepts} <span>34</span></button>
            {chapters.map(chapter => <button key={chapter.id} type="button" data-category={chapter.id} aria-pressed={category === chapter.id} onClick={() => setCategory(chapter.id)}><i aria-hidden="true" />{chapter.title}<span>{concepts.filter(concept => concept.category === chapter.id).length}</span></button>)}
          </div>
        </div>
        <div className="library__results">
          <p role="status" aria-live="polite">{resultsText(locale, filtered.length, query.trim())}</p>
          {filtering && <button type="button" onClick={reset}>{t.resetFilters} <span aria-hidden="true">↺</span></button>}
        </div>
      </section>
      {!filtered.length && <div className="empty-state"><span aria-hidden="true">⌕</span><h3>{t.emptyTitle}</h3><p>{t.emptyText}</p><button type="button" className="button-primary" onClick={reset}>{t.showAll} <span aria-hidden="true">→</span></button></div>}
      {chapters.map((chapter, index) => {
        const items = filtered.filter(concept => concept.category === chapter.id);
        return (
          <section key={chapter.id} className="chapter" id={`chapter-${chapter.id}`} data-category={chapter.id} hidden={!items.length}>
            <header className="chapter__head">
              <span className="chapter__index" aria-hidden="true">0{index + 1}</span>
              <h2><span className="chapter__mark" aria-hidden="true" />{chapter.title}</h2>
              <span className="chapter__count">{conceptCount(locale, items.length)}</span>
              <p>{chapter.description}</p>
            </header>
            <div className="grid">
              {items.map(concept => (
                <article className="card" id={concept.slug} key={concept.slug} data-slug={concept.slug}>
                  <Demo concept={concept} />
                  <div className="card__body">
                    <div className="card__eyebrow"><span className="card__num">{String(concept.number).padStart(2, "0")}</span><span>{t.interactiveConcept}</span></div>
                    <h3><Link href={localePath(locale, `/concepts/${concept.slug}/`)}>{concept.title}</Link></h3>
                    <p className="card__tagline">{concept.tagline}</p>
                    <p className="card__text">{concept.description}</p>
                    <Prompt title={concept.title} text={concept.prompt} />
                    <Link className="concept-link" href={localePath(locale, `/concepts/${concept.slug}/`)}>{t.fieldNotes} <span aria-hidden="true">↗</span></Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
