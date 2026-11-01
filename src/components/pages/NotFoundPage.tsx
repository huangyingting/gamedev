import Link from "next/link";
import { localePath, messages, type Locale } from "@/lib/i18n";

export function NotFoundPage({ locale }: { locale: Locale }) {
  const t = messages[locale];
  return <main id="main" className="prose"><p className="detail__kicker">{t.notFoundKicker}</p><h1>{t.notFoundTitle}</h1><p>{t.notFoundText}</p><Link className="concept-link" href={localePath(locale, "/")}>{t.backAll} →</Link></main>;
}
