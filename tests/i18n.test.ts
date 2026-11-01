import { test } from "node:test";
import assert from "node:assert/strict";
import { concepts } from "../src/lib/concepts";
import { getConcepts } from "../src/lib/localized-concepts";
import { languagePath } from "../src/lib/i18n";
import { createDemoState, renderDemo } from "../src/lib/demos";

test("language switching preserves paths with or without the deployment prefix", () => {
  const previous = process.env.NEXT_PUBLIC_BASE_PATH;
  process.env.NEXT_PUBLIC_BASE_PATH = "/gamedev";
  try {
    assert.equal(languagePath("/gamedev/concepts/easing/", "zh"), "/zh/concepts/easing/");
    assert.equal(languagePath("/gamedev/zh/concepts/easing/", "en"), "/concepts/easing/");
    assert.equal(languagePath("/zh/privacy/", "en"), "/privacy/");
    assert.equal(languagePath("/about", "zh"), "/zh/about/");
    assert.equal(languagePath("/gamedev/", "zh"), "/zh/");
    assert.equal(languagePath("/gamedev/zh/", "en"), "/");
    assert.equal(languagePath("/zh", "zh"), "/zh/");
  } finally {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_BASE_PATH;
    else process.env.NEXT_PUBLIC_BASE_PATH = previous;
  }
});

test("every concept has complete Chinese teaching content without changing identity or code", () => {
  const chinese = getConcepts("zh");
  assert.equal(chinese.length, concepts.length);
  for (let index = 0; index < concepts.length; index++) {
    const localized = chinese[index];
    const original = concepts[index];
    assert.equal(localized.slug, original.slug);
    assert.equal(localized.category, original.category);
    assert.equal(localized.number, original.number);
    for (const key of ["title", "tagline", "description", "prompt", "example", "mistake"] as const) {
      assert.match(localized[key], /[\u4e00-\u9fff]/, `${original.slug}: ${key} needs translation`);
    }
    assert.equal(localized.code.replace(/\/\/[^\n]*/g, ""), original.code.replace(/\/\/[^\n]*/g, ""));
  }
});

test("Chinese canvas labels translate all demo modes and retain numeric measurements", () => {
  const labels: string[] = [];
  const ctx = new Proxy({}, {
    get: (_target, key) => key === "fillText" ? (text: string) => labels.push(text) : () => undefined,
    set: () => true,
  }) as CanvasRenderingContext2D;
  for (const concept of getConcepts("zh")) {
    for (const variant of [0, 1, 2]) for (const time of [0, 1.5, 3]) {
      const state = createDemoState();
      state.variant = variant;
      state.time = time;
      renderDemo(ctx, concept.slug, concept.category, state, 1 / 60, "zh", concept.title);
    }
  }
  for (const label of labels) {
    const words = label.replace(/\b(LOD|UV|N|L|FPS|Hz|ms|A)\b/g, "").match(/[a-zA-Z]+/g);
    assert.equal(words, null, `untranslated canvas label: ${label}`);
  }
  assert.ok(labels.some(label => /^距离 \d+\.\d \/ 用指针瞄准$/.test(label)));
  assert.ok(labels.some(label => label.includes("当前状态：")));
});
