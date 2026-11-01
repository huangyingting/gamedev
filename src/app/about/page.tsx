import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "About" };

export default function About() {
  return (
    <main id="main" className="prose">
      <p className="detail__kicker">Behind the experiments</p>
      <h1>About this guide</h1>
      <p>Game Dev Lab is an interactive field guide by huangyingting, built with Next.js and TypeScript. It explores 34 game-development techniques through small, playable Canvas 2D demonstrations.</p>
      <h2>Learn by tinkering</h2>
      <p>A technique is easier to understand when you can see it respond. Each experiment pairs a live demonstration with an explanation, a practical prompt starter, and field notes you can use in your own project.</p>
      <h2>Find your next idea</h2>
      <p>Search the library by mechanic or keyword, filter by discipline, or choose “Surprise me” to discover something new. Watch an example, pause it, and move your pointer or use the arrow keys to explore. Open its field notes for a use case, a common mistake, and an implementation sketch.</p>
      <p>The examples are simplified teaching tools, not production physics or rendering engines. Adapt the ideas to your engine, measure performance in your own scenes, and tune the numbers for your game.</p>
      <h2>Open to experimentation</h2>
      <p>The application and typed demo algorithms are available under the MIT license in the <a href="https://github.com/huangyingting/gamedev" target="_blank" rel="noreferrer">GitHub repository</a>. Watch the repository for updates, report a correction, or suggest the next experiment.</p>
      <Link className="concept-link" href="/#library">Enter the lab →</Link>
    </main>
  );
}
