import Link from "next/link";
import { Demo } from "@/components/Demo";
import { ConceptExplorer } from "@/components/ConceptExplorer";
import { concepts } from "@/lib/concepts";

export default function Home() {
  const featured = concepts.find(concept => concept.slug === "particle-system")!;
  return (
    <main id="main">
      <section className="hero" id="top">
        <div className="hero__orb hero__orb--one" aria-hidden="true" />
        <div className="hero__orb hero__orb--two" aria-hidden="true" />
        <div className="hero__inner">
          <div className="hero__copy">
            <p className="hero__kicker"><span className="status-dot" aria-hidden="true" />An interactive field guide</p>
            <h1>Less guessing.<br /><em>More game.</em></h1>
            <p className="hero__lede">The ideas behind games that feel great.<br />Explore <strong>34 playable concepts</strong>, understand the mechanics, and turn what you learn into your next AI prompt.</p>
            <div className="hero__actions">
              <a className="button-primary" href="#library">Enter the lab <span aria-hidden="true">↗</span></a>
              <Link className="hero__secondary" href="/concepts/coyote-time/">Start with game feel <span aria-hidden="true">→</span></Link>
            </div>
            <div className="hero__facts" aria-label="Guide features"><span><b>34</b> live experiments</span><span><b>4</b> disciplines</span><span><b>∞</b> possibilities</span></div>
          </div>
          <section className="hero__sandbox" data-category="systems" aria-labelledby="sandbox-title">
            <div className="sandbox__bar"><span><i aria-hidden="true" /><i aria-hidden="true" /><i aria-hidden="true" /></span><span>PLAYGROUND / 001</span><span className="sandbox__live"><span className="status-dot" aria-hidden="true" />LIVE</span></div>
            <div className="sandbox__title"><div><p>Featured experiment</p><h2 id="sandbox-title">A little controlled chaos.</h2></div><span aria-hidden="true">✳</span></div>
            <Demo concept={featured} />
            <div className="sandbox__footer"><span>One emitter. Endless expression.</span><Link href="/concepts/particle-system/">How it works <span aria-hidden="true">↗</span></Link></div>
          </section>
        </div>
      </section>
      <section className="learning-path" aria-label="How to use the lab">
        <div><span>01 / EXPLORE</span><p>See the idea in motion.</p></div>
        <div><span>02 / UNDERSTAND</span><p>Get the why, not just the what.</p></div>
        <div><span>03 / BUILD</span><p>Take a prompt. Make it yours.</p></div>
      </section>
      <ConceptExplorer />
      <section className="updates" id="updates" aria-labelledby="updates-title">
        <div><p className="updates__kicker">Built to be explored. Open to everyone.</p><h2 id="updates-title">Keep your curiosity in play.</h2><p>Dig into the TypeScript, suggest an experiment, or follow the next update.</p></div>
        <a className="button-primary" href="https://github.com/huangyingting/gamedev" target="_blank" rel="noreferrer">Explore the source <span aria-hidden="true">↗</span></a>
      </section>
    </main>
  );
}
