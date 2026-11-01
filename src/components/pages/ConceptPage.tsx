import Link from "next/link";
import { notFound } from "next/navigation";
import { Demo } from "@/components/Demo";
import { Prompt } from "@/components/Prompt";
import { getChapters, getConcepts } from "@/lib/localized-concepts";
import { localePath, messages, type Locale } from "@/lib/i18n";

export function ConceptPage({ slug, locale }: { slug: string; locale: Locale }) {
  const concepts = getConcepts(locale);
  const concept = concepts.find(concept => concept.slug === slug);
  if (!concept) notFound();
  const chapter = getChapters(locale).find(chapter => chapter.id === concept.category)!;
  const t = messages[locale];
  const path = (href: string) => localePath(locale, href);
  const index = concept.number - 1;
  const previous = concepts[index - 1];
  const next = concepts[index + 1];
  return (
    <main id="main" className="detail" data-category={concept.category}>
      <nav className="breadcrumb" aria-label={t.breadcrumb}><Link href={path("/")}>{t.allConcepts}</Link><span>/</span><Link href={path(`/#chapter-${chapter.id}`)}>{chapter.title}</Link><span>/</span><span>{concept.title}</span></nav>
      <p className="detail__kicker">{t.concept} {String(concept.number).padStart(2, "0")} / {chapter.title}</p>
      <h1>{concept.title}</h1>
      <p className="detail__tagline">{concept.tagline}</p>
      <p className="detail__intro">{concept.description}</p>
      <Demo concept={concept} large />
      <div className="detail__columns">
        <section><h2>{t.tryInGame}</h2><p>{concept.example}</p></section>
        <section className="mistake"><h2>{t.commonMistake}</h2><p>{concept.mistake}</p></section>
      </div>
      <section className="detail__code"><h2>{t.implementation}</h2><p>{t.pseudocode}</p><pre><code>{concept.code}</code></pre></section>
      <Prompt title={concept.title} text={concept.prompt} />
      <nav className="concept-pagination" aria-label={t.adjacentConcepts}>
        {previous ? <Link href={path(`/concepts/${previous.slug}/`)}>← {previous.title}</Link> : <Link href={path("/")}>← {t.allConcepts}</Link>}
        {next ? <Link href={path(`/concepts/${next.slug}/`)}>{next.title} →</Link> : <Link href={path("/")}>{t.allConcepts} →</Link>}
      </nav>
    </main>
  );
}
