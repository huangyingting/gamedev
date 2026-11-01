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
        <Link className="logo" href="/" aria-label="Game Dev Lab home"><span className="logo__mark" aria-hidden="true"><i /><i /><i /><i /></span>Game dev <span className="logo__lab">lab</span></Link>
        <nav aria-label="Chapters" className="bar__nav">
          {chapters.map(chapter => <Link key={chapter.id} href={`/#chapter-${chapter.id}`} data-category={chapter.id} onClick={() => document.dispatchEvent(new Event("reset-concept-filters"))} aria-current={active === `chapter-${chapter.id}` ? "location" : undefined}>{chapter.title}</Link>)}
        </nav>
        <a className="bar__link" href="https://github.com/huangyingting/gamedev" target="_blank" rel="noreferrer">View source <span aria-hidden="true">↗</span></a>
      </div>
    </header>
  );
}
