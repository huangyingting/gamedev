import Link from "next/link";

export default function NotFound() {
  return <main id="main" className="prose"><p className="detail__kicker">404 / outside the map</p><h1>Nothing rendered here.</h1><p>This page does not exist. Head back to the concepts to find your next technique.</p><Link className="concept-link" href="/">Back to all concepts →</Link></main>;
}
