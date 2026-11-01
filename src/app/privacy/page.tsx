import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy" };

export default function Privacy() {
  return <main id="main" className="prose"><p className="detail__kicker">Simple by design</p><h1>Privacy</h1><p>This site is a static application hosted by GitHub Pages. It has no account system, newsletter database, analytics scripts, advertising, tracking cookies, or browser-storage identifiers.</p><h2>Interactions stay in your browser</h2><p>Animations, search, and filters run locally. Search terms are not sent to a server or saved. The copy button writes the selected prompt to your clipboard only after you click it. The site does not read your clipboard. No email addresses are requested or stored.</p><h2>Hosting and external links</h2><p>GitHub may process request information such as IP addresses as part of providing its hosting service. Read <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noreferrer">GitHub&apos;s privacy statement</a> for its practices. External links take you to services governed by their own policies.</p></main>;
}
