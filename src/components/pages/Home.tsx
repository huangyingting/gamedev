import Link from "next/link";
import { Demo } from "@/components/Demo";
import { ConceptExplorer } from "@/components/ConceptExplorer";
import { getConcepts } from "@/lib/localized-concepts";
import { localePath, messages, type Locale } from "@/lib/i18n";

export function Home({ locale }: { locale: Locale }) {
  const t = messages[locale];
  const path = (href: string) => localePath(locale, href);
  const featured = getConcepts(locale).find(concept => concept.slug === "particle-system")!;
  return (
    <main id="main">
      <section className="hero" id="top">
        <div className="hero__orb hero__orb--one" aria-hidden="true" />
        <div className="hero__orb hero__orb--two" aria-hidden="true" />
        <div className="hero__inner">
          <div className="hero__copy">
            <p className="hero__kicker"><span className="status-dot" aria-hidden="true" />{t.heroKicker}</p>
            <h1>{t.heroTitle}<br /><em>{t.heroAccent}</em></h1>
            <p className="hero__lede">{t.heroIntro}<br />{t.heroExplore}<strong>{t.heroConcepts}</strong>{t.heroOutro}</p>
            <div className="hero__actions">
              <a className="button-primary" href="#library">{t.enterLab} <span aria-hidden="true">↗</span></a>
              <Link className="hero__secondary" href={path("/concepts/coyote-time/")}>{t.startFeel} <span aria-hidden="true">→</span></Link>
            </div>
            <div className="hero__facts" aria-label={t.featuresLabel}><span><b>34</b> {t.liveExperiments}</span><span><b>4</b> {t.disciplines}</span><span><b>∞</b> {t.possibilities}</span></div>
          </div>
          <section className="hero__sandbox" data-category="systems" aria-labelledby="sandbox-title">
            <div className="sandbox__bar"><span><i aria-hidden="true" /><i aria-hidden="true" /><i aria-hidden="true" /></span><span>{t.playground} / 001</span><span className="sandbox__live"><span className="status-dot" aria-hidden="true" />{t.live}</span></div>
            <div className="sandbox__title"><div><p>{t.featured}</p><h2 id="sandbox-title">{t.sandboxTitle}</h2></div><span aria-hidden="true">✳</span></div>
            <Demo concept={featured} />
            <div className="sandbox__footer"><span>{t.sandboxFooter}</span><Link href={path("/concepts/particle-system/")}>{t.howItWorks} <span aria-hidden="true">↗</span></Link></div>
          </section>
        </div>
      </section>
      <section className="learning-path" aria-label={t.learnLabel}>
        <div><span>01 / {t.explore}</span><p>{t.exploreText}</p></div>
        <div><span>02 / {t.understand}</span><p>{t.understandText}</p></div>
        <div><span>03 / {t.build}</span><p>{t.buildText}</p></div>
      </section>
      <ConceptExplorer />
      <section className="updates" id="updates" aria-labelledby="updates-title">
        <div><p className="updates__kicker">{t.updatesKicker}</p><h2 id="updates-title">{t.updatesTitle}</h2><p>{t.updatesText}</p></div>
        <a className="button-primary" href="https://github.com/huangyingting/gamedev" target="_blank" rel="noreferrer">{t.exploreSource} <span aria-hidden="true">↗</span></a>
      </section>
    </main>
  );
}
