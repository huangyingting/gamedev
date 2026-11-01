import Link from "next/link";
import { Demo } from "@/components/Demo";
import { Prompt } from "@/components/Prompt";
import { chapters, concepts } from "@/lib/concepts";

export default function Home() {
  return (
    <main id="main">
      <section className="hero" id="top">
        <div className="hero__floor" aria-hidden="true"><div className="hero__plane" /></div>
        <div className="hero__inner">
          <div className="hero__copy">
            <p className="hero__kicker">Build better games with AI<span className="caret" aria-hidden="true" /></p>
            <h1>Game dev terms<br /><em>for your next<br className="hero__break" /> AI prompt</em></h1>
            <p className="hero__lede">Better instructions start with better vocabulary. Explore <strong>34 concepts</strong> through live examples, then take a practical prompt starter into your next game project.</p>
            <a className="hero__follow" href="#chapter-3d">Explore the concepts <span aria-hidden="true">↓</span></a>
          </div>
          <section className="updates" id="updates" aria-labelledby="updates-title">
            <p className="updates__kicker">Keep experimenting</p>
            <h2 id="updates-title">Your next game starts here.</h2>
            <p>Follow the project for new examples and improvements.</p>
            <a className="updates__button" href="https://github.com/huangyingting/gamedev" target="_blank" rel="noreferrer">Watch on GitHub <span aria-hidden="true">↗</span></a>
            <p className="updates__privacy">This version is hosted on GitHub Pages. There is no email signup or newsletter server, and we do not collect your email. <Link href="/privacy/">Privacy details</Link>.</p>
            <div className="updates__stats"><span><b>34</b> concepts</span><span><b>4</b> chapters</span><span><b>100%</b> TypeScript</span></div>
          </section>
        </div>
      </section>
      <div className="chapters">
        {chapters.map(chapter => {
          const items = concepts.filter(concept => concept.category === chapter.id);
          return (
            <section key={chapter.id} className="chapter" id={`chapter-${chapter.id}`} data-category={chapter.id}>
              <header className="chapter__head">
                <h2><span className="chapter__mark" aria-hidden="true" />{chapter.title}</h2>
                <span className="chapter__count">{items.length} concepts</span>
                <p>{chapter.description}</p>
              </header>
              <div className="grid">
                {items.map(concept => (
                  <article className="card" id={concept.slug} key={concept.slug} data-slug={concept.slug}>
                    <Demo concept={concept} />
                    <div className="card__body">
                      <span className="card__num">{String(concept.number).padStart(2, "0")}</span>
                      <h3><Link href={`/concepts/${concept.slug}/`}>{concept.title}</Link></h3>
                      <p className="card__tagline">{concept.tagline}</p>
                      <p className="card__text">{concept.description}</p>
                      <Prompt title={concept.title} text={concept.prompt} />
                      <Link className="concept-link" href={`/concepts/${concept.slug}/`}>Example & common mistake <span aria-hidden="true">→</span></Link>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
