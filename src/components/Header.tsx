"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { chapters } from "@/lib/concepts";

export function Header() {
  const [active, setActive] = useState("");
  const pathname = usePathname();
  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>(".chapter");
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
    }, { rootMargin: "-10% 0px -70% 0px" });
    sections.forEach(section => observer.observe(section));
    return () => observer.disconnect();
  }, [pathname]);
  return (
    <header className="bar">
      <div className="bar__inner">
        <Link className="logo" href="/" aria-label="Game dev cheat sheet home"><span className="logo__mark" aria-hidden="true"><i /><i /><i /><i /></span>Game dev cheat sheet</Link>
        <nav aria-label="Chapters" className="bar__nav">
          {chapters.map(chapter => <Link key={chapter.id} href={`/#chapter-${chapter.id}`} data-category={chapter.id} aria-current={active === `chapter-${chapter.id}` ? "location" : undefined}>{chapter.title}</Link>)}
        </nav>
        <Link className="bar__link" href="/#updates">Get updates <span aria-hidden="true">↗</span></Link>
      </div>
    </header>
  );
}
