import type { Metadata } from "next";
import { getConcepts } from "./localized-concepts";
import { localePath, messages, type Locale } from "./i18n";

export function localizedAlternates(path: string): Metadata["alternates"] {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return {
    languages: {
      en: `${base}${localePath("en", path)}`,
      "zh-CN": `${base}${localePath("zh", path)}`,
    },
  };
}

export function conceptMetadata(slug: string, locale: Locale): Metadata {
  const concept = getConcepts(locale).find(concept => concept.slug === slug);
  return {
    title: concept?.title ?? messages[locale].conceptNotFound,
    description: concept?.description,
    alternates: localizedAlternates(`/concepts/${slug}/`),
  };
}
