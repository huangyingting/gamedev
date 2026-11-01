import { test, expect } from "@playwright/test";
import { getConcepts } from "../../src/lib/localized-concepts";

test("EN/CN switches the current concept, server language, metadata and copyable prompt", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("./concepts/easing/");
  await expect(page.locator(".language-switch a", { hasText: "EN" })).toHaveAttribute("aria-current", "page");
  await page.getByRole("link", { name: "简体中文", exact: true }).click();
  await expect(page).toHaveURL(/\/gamedev\/zh\/concepts\/easing\/$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("缓动");
  await expect(page).toHaveTitle(/缓动.*游戏开发实验室/);
  await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", /\/gamedev\/concepts\/easing\/$/);
  await expect(page.locator("h2")).toContainText(["在游戏中试一试", "常见误区", "实现示意"]);
  await expect(page.locator("canvas")).toHaveAttribute("data-ready", "true");
  await page.getByRole("button", { name: "暂停缓动动画", exact: true }).click();
  await expect(page.getByRole("button", { name: "播放缓动动画", exact: true })).toBeVisible();
  const copy = page.getByRole("button", { name: "复制缓动提示词", exact: true });
  await copy.click();
  await expect(copy).toHaveText("已复制！");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(getConcepts("zh").find(concept => concept.slug === "easing")!.prompt);
  await page.getByRole("link", { name: "English", exact: true }).click();
  await expect(page).toHaveURL(/\/gamedev\/concepts\/easing\/$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Easing");
});

test("all Chinese concepts and their direct static routes are translated and render", async ({ page, request }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("./zh/");
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await expect(page).toHaveTitle("Game Dev Lab · 游戏开发实验室 — 34 个交互概念");
  await expect(page.locator(".card")).toHaveCount(34);
  const homeResponse = await request.get("./zh/");
  expect(await homeResponse.text()).toContain('lang="zh-CN"');
  for (const concept of getConcepts("zh")) {
    const card = page.locator(`#${concept.slug}`);
    await expect(card.locator("h3")).toHaveText(concept.title);
    await card.scrollIntoViewIfNeeded();
    await expect(card.locator("canvas")).toHaveAttribute("data-ready", "true");
    await expect(card.locator(".demo__caption")).toContainText("实时演示");
    await expect(card.locator(".prompt > code")).toHaveText(concept.prompt);
    const response = await request.get(`./zh/concepts/${concept.slug}/`);
    expect(response.status(), concept.slug).toBe(200);
    const html = await response.text();
    expect(html).toContain('lang="zh-CN"');
    expect(html).toContain(concept.title);
    expect(html).toContain(concept.example);
    expect(html).toContain(concept.mistake);
    expect(html).toContain("实现示意");
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test("Chinese search accepts both Chinese and English technical terms", async ({ page }) => {
  await page.goto("./zh/");
  const search = page.getByRole("searchbox", { name: "搜索概念" });
  await search.fill("土狼");
  await expect(page.locator(".card")).toHaveCount(1);
  await expect(page.locator(".card h3")).toHaveText("土狼时间");
  await page.getByRole("button", { name: "随机探索", exact: true }).click();
  await expect(page).toHaveURL(/\/zh\/concepts\/coyote-time\/$/);
  await page.getByRole("link", { name: "游戏开发实验室首页" }).click();
  await search.fill("EASING");
  await expect(page.locator(".card")).toHaveCount(3);
  await expect(page.locator("#easing h3")).toHaveText("缓动");
  await page.getByRole("group", { name: "按章节筛选概念" }).getByRole("button", { name: /性能优化/ }).click();
  await expect(page.locator(".card")).toHaveCount(0);
  await expect(page.getByText("没有找到相关实验。", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "显示全部概念" }).click();
  await expect(page.locator(".card")).toHaveCount(34);
  await expect(search).toHaveValue("");
});

test("switching languages preserves chapter hashes and information-page routes", async ({ page }) => {
  await page.goto("./");
  await page.getByRole("navigation", { name: "Chapters" }).getByRole("link", { name: "Systems", exact: true }).click();
  await page.getByRole("link", { name: "简体中文", exact: true }).click();
  await expect(page).toHaveURL(/\/zh\/#chapter-systems$/);
  await expect(page.locator("#chapter-systems")).toBeInViewport();
  await page.getByRole("navigation", { name: "章节" }).getByRole("link", { name: "游戏手感", exact: true }).click();
  await page.getByRole("link", { name: "English", exact: true }).click();
  await expect(page).toHaveURL(/\/gamedev\/#chapter-feel$/);
  await expect(page.locator("#chapter-feel")).toBeInViewport();
  await page.getByRole("navigation", { name: "Site information" }).getByRole("link", { name: "About", exact: true }).click();
  await expect(page).toHaveURL(/\/gamedev\/about\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("About this guide");
  await page.getByRole("link", { name: "简体中文", exact: true }).click();
  await expect(page).toHaveURL(/\/zh\/about\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("关于这份指南");
  await page.getByRole("navigation", { name: "网站信息" }).getByRole("link", { name: "隐私", exact: true }).click();
  await expect(page).toHaveURL(/\/zh\/privacy\/$/);
  await expect(page.getByRole("heading", { name: "交互留在你的浏览器中" })).toBeVisible();
  await page.getByRole("link", { name: "English", exact: true }).click();
  await expect(page).toHaveURL(/\/gamedev\/privacy\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Privacy");
});

test("Chinese controls respect reduced motion and stay usable on narrow screens", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./zh/concepts/screen-shake/");
  await expect(page.locator("canvas")).toHaveAttribute("data-ready", "true");
  const play = page.getByRole("button", { name: "播放屏幕震动动画", exact: true });
  await expect(play).toBeVisible();
  const canvas = page.locator("canvas");
  const frame = await canvas.getAttribute("data-frame");
  await page.waitForTimeout(150);
  expect(await canvas.getAttribute("data-frame")).toBe(frame);
  await play.click();
  await expect.poll(async () => Number(await canvas.getAttribute("data-frame"))).toBeGreaterThan(Number(frame));
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(page.getByRole("link", { name: "English", exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test("language switch uses a just-updated browser URL before React rerenders", async ({ page }) => {
  await page.goto("./");
  await expect(page.locator(".hero__sandbox canvas")).toHaveAttribute("data-ready", "true");
  const path = new URL("about/", page.url()).pathname;
  await page.evaluate(path => {
    window.history.replaceState(window.history.state, "", path);
    document.querySelector<HTMLAnchorElement>('.language-switch a[hreflang="zh-CN"]')!.click();
  }, path);
  await expect(page).toHaveURL(/\/zh\/about\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("关于这份指南");
});
