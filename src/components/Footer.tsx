import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <div><strong>Game dev lab<span className="footer-dot">.</span></strong><p>Small experiments. Better games.</p><a href="https://github.com/huangyingting/gamedev" target="_blank" rel="noreferrer">Source on GitHub ↗</a></div>
      <nav aria-label="Site information"><Link href="/about/">About</Link><Link href="/privacy/">Privacy</Link><Link href="/#updates">Updates</Link><Link href="/#top">Back to top ↑</Link></nav>
      <p className="site-footer__credit">Built with Next.js & TypeScript. Open source under the MIT license. No tracking, just tinkering.</p>
    </footer>
  );
}
