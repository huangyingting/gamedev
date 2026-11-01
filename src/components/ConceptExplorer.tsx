"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Demo } from "@/components/Demo";
import { Prompt } from "@/components/Prompt";
import { chapters, concepts, type Category } from "@/lib/concepts";

export function ConceptExplorer() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "all">("all");
  const searchRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const filtered = concepts.filter(concept => {
    if (category !== "all" && concept.category !== category) return false;
    const content = `${concept.title} ${concept.tagline} ${concept.description} ${concept.prompt} ${concept.example}`.toLowerCase();
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
          <div><p className="detail__kicker">Choose your next rabbit hole</p><h2 id="library-title">The concept library<span>.</span></h2></div>
          <button className="surprise-button" type="button" disabled={!filtered.length} onClick={() => {
            const concept = filtered[Math.floor(Math.random() * filtered.length)];
            router.push(`/concepts/${concept.slug}/`);
          }}><span aria-hidden="true">⤨</span> Surprise me</button>
        </div>
        <div className="library__tools">
          <div className="search-field">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></svg>
            <input ref={searchRef} type="search" aria-label="Search concepts" placeholder="Find a mechanic, technique, or idea…" value={query}
              onChange={event => setQuery(event.target.value)} onKeyDown={event => { if (event.key === "Escape") { setQuery(""); event.currentTarget.blur(); } }} />
            {query ? <button type="button" aria-label="Clear search" onClick={() => { setQuery(""); searchRef.current?.focus(); }}>×</button> : <kbd aria-hidden="true">/</kbd>}
          </div>
          <div className="category-filters" role="group" aria-label="Filter concepts by chapter">
            <button type="button" aria-pressed={category === "all"} onClick={() => setCategory("all")}>All concepts <span>34</span></button>
            {chapters.map(chapter => <button key={chapter.id} type="button" data-category={chapter.id} aria-pressed={category === chapter.id} onClick={() => setCategory(chapter.id)}><i aria-hidden="true" />{chapter.title}<span>{concepts.filter(concept => concept.category === chapter.id).length}</span></button>)}
          </div>
        </div>
        <div className="library__results">
          <p role="status" aria-live="polite">{filtered.length} {filtered.length === 1 ? "concept" : "concepts"} to explore{query.trim() ? ` for “${query.trim()}”` : ""}</p>
          {filtering && <button type="button" onClick={reset}>Reset filters <span aria-hidden="true">↺</span></button>}
        </div>
      </section>
      {!filtered.length && <div className="empty-state"><span aria-hidden="true">⌕</span><h3>No experiments found.</h3><p>Try a broader term like “camera”, “jump”, or “physics”.</p><button type="button" className="button-primary" onClick={reset}>Show all concepts <span aria-hidden="true">→</span></button></div>}
      {chapters.map((chapter, index) => {
        const items = filtered.filter(concept => concept.category === chapter.id);
        return (
          <section key={chapter.id} className="chapter" id={`chapter-${chapter.id}`} data-category={chapter.id} hidden={!items.length}>
            <header className="chapter__head">
              <span className="chapter__index" aria-hidden="true">0{index + 1}</span>
              <h2><span className="chapter__mark" aria-hidden="true" />{chapter.title}</h2>
              <span className="chapter__count">{items.length} concepts</span>
              <p>{chapter.description}</p>
            </header>
            <div className="grid">
              {items.map(concept => (
                <article className="card" id={concept.slug} key={concept.slug} data-slug={concept.slug}>
                  <Demo concept={concept} />
                  <div className="card__body">
                    <div className="card__eyebrow"><span className="card__num">{String(concept.number).padStart(2, "0")}</span><span>Interactive concept</span></div>
                    <h3><Link href={`/concepts/${concept.slug}/`}>{concept.title}</Link></h3>
                    <p className="card__tagline">{concept.tagline}</p>
                    <p className="card__text">{concept.description}</p>
                    <Prompt title={concept.title} text={concept.prompt} />
                    <Link className="concept-link" href={`/concepts/${concept.slug}/`}>Open field notes <span aria-hidden="true">↗</span></Link>
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
