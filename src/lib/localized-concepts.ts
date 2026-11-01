import { chapters, concepts, type Concept } from "./concepts";
import { chineseConcepts } from "./concepts.zh";
import { chineseChapters, type Locale } from "./i18n";

export const getConcepts = (locale: Locale): Concept[] => locale === "en" ? concepts : concepts.map(concept => ({
  ...concept,
  ...chineseConcepts[concept.slug],
  code: concept.code.replace("// unloadRadius must exceed loadRadius", "// 卸载半径必须大于加载半径"),
}));

export const getChapters = (locale: Locale) => locale === "en" ? chapters : chapters.map(chapter => ({ ...chapter, ...chineseChapters[chapter.id] }));
