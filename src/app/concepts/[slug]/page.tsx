import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Demo } from "@/components/Demo";
import { Prompt } from "@/components/Prompt";
import { chapters, conceptBySlug, concepts } from "@/lib/concepts";

export const dynamicParams = false;
export function generateStaticParams() {
  return concepts.map(concept => ({ slug: concept.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const concept = conceptBySlug((await params).slug);
  return { title: concept?.title ?? "Concept not found", description: concept?.description };
}

export default async function ConceptPage({ params }: { params: Promise<{ slug: string }> }) {
  const concept = conceptBySlug((await params).slug);
  if (!concept) notFound();
  const chapter = chapters.find(chapter => chapter.id === concept.category)!;
  const index = concept.number - 1;
  const previous = concepts[index - 1];
  const next = concepts[index + 1];
  return (
    <main id="main" className="detail" data-category={concept.category}>
      <nav className="breadcrumb" aria-label="Breadcrumb"><Link href="/">All concepts</Link><span>/</span><Link href={`/#chapter-${chapter.id}`}>{chapter.title}</Link><span>/</span><span>{concept.title}</span></nav>
      <p className="detail__kicker">Concept {String(concept.number).padStart(2, "0")} / {chapter.title}</p>
      <h1>{concept.title}</h1>
      <p className="detail__tagline">{concept.tagline}</p>
      <p className="detail__intro">{concept.description}</p>
      <Demo concept={concept} large />
      <div className="detail__columns">
        <section><h2>Try it in a game</h2><p>{concept.example}</p></section>
        <section className="mistake"><h2>Common mistake</h2><p>{concept.mistake}</p></section>
      </div>
      <section className="detail__code"><h2>Implementation sketch</h2><p>Engine-neutral pseudocode. Adapt the APIs and coordinate conventions to your project.</p><pre><code>{concept.code}</code></pre></section>
      <Prompt title={concept.title} text={concept.prompt} />
      <nav className="concept-pagination" aria-label="Adjacent concepts">
        {previous ? <Link href={`/concepts/${previous.slug}/`}>← {previous.title}</Link> : <Link href="/">← All concepts</Link>}
        {next ? <Link href={`/concepts/${next.slug}/`}>{next.title} →</Link> : <Link href="/">All concepts →</Link>}
      </nav>
    </main>
  );
}
