import Link from "next/link";
import { localePath, messages, type Locale } from "@/lib/i18n";

export function Footer({ locale }: { locale: Locale }) {
  const t = messages[locale];
  const path = (href: string) => localePath(locale, href);
  return (
    <footer className="site-footer">
      <div><strong>{locale === "zh" ? "游戏开发实验室" : "Game dev lab"}<span className="footer-dot">.</span></strong><p>{t.footerTagline}</p><a href="https://github.com/huangyingting/gamedev" target="_blank" rel="noreferrer">{t.sourceGitHub} ↗</a></div>
      <nav aria-label={t.siteInformation}><Link href={path("/about/")}>{t.about}</Link><Link href={path("/privacy/")}>{t.privacy}</Link><Link href={path("/#updates")}>{t.updates}</Link><Link href={path("/#top")}>{t.backTop} ↑</Link></nav>
      <p className="site-footer__credit">{t.footerCredit}</p>
    </footer>
  );
}
