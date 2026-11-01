import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <div><strong>Build it. Watch it. Understand it.</strong><p>An independent, interactive guide to game development.</p><a href="https://github.com/huangyingting/gamedev" target="_blank" rel="noreferrer">Source on GitHub ↗</a></div>
      <nav aria-label="Site information"><Link href="/about/">About</Link><Link href="/privacy/">Privacy</Link><Link href="/#updates">Updates</Link><Link href="/#top">Back to top ↑</Link></nav>
      <p className="site-footer__credit">Inspired by the format of <a href="https://gamedev-cheatsheet.com/" target="_blank" rel="noreferrer">Nicolas Zullo&apos;s Game Dev Cheat Sheet</a>. Independently written; not affiliated with the original site.</p>
    </footer>
  );
}
