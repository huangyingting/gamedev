import { test, expect } from "@playwright/test";

test("all 34 demos render actual graphics without client errors or overflow", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("response", response => { if (response.status() >= 400 && new URL(response.url()).origin === new URL(page.url()).origin) errors.push(`${response.status()} ${response.url()}`); });
  await page.goto("./");
  await expect(page.locator(".card")).toHaveCount(34);
  await expect(page.locator(".chapter")).toHaveCount(4);
  for (const card of await page.locator(".card").all()) {
    await card.scrollIntoViewIfNeeded();
    const canvas = card.locator("canvas");
    await expect(canvas).toHaveAttribute("data-ready", "true");
    const colored = await canvas.evaluate((node: HTMLCanvasElement) => {
      const { data } = node.getContext("2d")!.getImageData(0, 0, node.width, node.height);
      let count = 0;
      for (let i = 0; i < data.length; i += 4) if (data[i] > 40 || data[i + 1] > 40 || data[i + 2] > 50) count++;
      return count;
    });
    expect(colored, `blank canvas: ${await card.getAttribute("id")}`).toBeGreaterThan(300);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test("pointer, pause, replay, and keyboard controls work", async ({ page }) => {
  await page.goto("./concepts/raycasting/");
  const canvas = page.locator("canvas");
  await expect(canvas).toHaveAttribute("data-ready", "true");
  await page.getByRole("button", { name: "Pause Raycasting animation", exact: true }).click();
  await page.waitForTimeout(100);
  const pausedFrame = await canvas.getAttribute("data-frame");
  const before = await canvas.evaluate((node: HTMLCanvasElement) => node.toDataURL());
  await page.waitForTimeout(150);
  expect(await canvas.getAttribute("data-frame")).toBe(pausedFrame);
  await canvas.focus();
  await canvas.press("ArrowUp");
  await expect.poll(() => canvas.evaluate((node: HTMLCanvasElement) => node.toDataURL())).not.toBe(before);
  const keyboardImage = await canvas.evaluate((node: HTMLCanvasElement) => node.toDataURL());
  const box = (await canvas.boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.75);
  await expect.poll(() => canvas.evaluate((node: HTMLCanvasElement) => node.toDataURL())).not.toBe(keyboardImage);
  await page.getByRole("button", { name: "Replay Raycasting animation", exact: true }).click();
  await page.getByRole("button", { name: "Play Raycasting animation", exact: true }).click();
  await expect.poll(async () => Number(await canvas.getAttribute("data-frame"))).toBeGreaterThan(0);
  const frame = Number(await canvas.getAttribute("data-frame"));
  await expect.poll(async () => Number(await canvas.getAttribute("data-frame"))).toBeGreaterThan(frame);
});

test("copy succeeds and errors are communicated", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("./concepts/easing/");
  const copy = page.getByRole("button", { name: "Copy Easing prompt" });
  await copy.click();
  await expect(copy).toHaveText("Copied!");
  const prompt = await page.locator(".prompt > code").innerText();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(prompt);
  await page.evaluate(() => { Object.defineProperty(navigator.clipboard, "writeText", { configurable: true, value: () => Promise.reject(new Error("denied")) }); });
  await copy.click();
  await expect(page.getByRole("status")).toContainText("Select the prompt text");
});

test("seed changes terrain and replay reproduces it", async ({ page }) => {
  await page.goto("./concepts/seeded-noise/");
  const canvas = page.locator("canvas");
  await expect(canvas).toHaveAttribute("data-ready", "true");
  await page.getByRole("button", { name: "Pause Seeded noise animation", exact: true }).click();
  await page.waitForTimeout(100);
  const original = await canvas.evaluate((node: HTMLCanvasElement) => node.toDataURL());
  await page.getByRole("button", { name: /New seed/ }).click();
  await expect.poll(() => canvas.evaluate((node: HTMLCanvasElement) => node.toDataURL())).not.toBe(original);
  const changed = await canvas.evaluate((node: HTMLCanvasElement) => node.toDataURL());
  await page.getByRole("button", { name: "Replay Seeded noise animation", exact: true }).click();
  await page.waitForTimeout(100);
  expect(await canvas.evaluate((node: HTMLCanvasElement) => node.toDataURL())).toBe(changed);
});

test("chapter links, details, pagination, privacy and about resolve", async ({ page }) => {
  await page.goto("./");
  await page.getByRole("navigation", { name: "Chapters" }).getByRole("link", { name: "Systems", exact: true }).click();
  await expect(page).toHaveURL(/#chapter-systems$/);
  await page.locator("#state-machine h3 a").click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Finite state machine");
  await page.getByRole("navigation", { name: "Adjacent concepts" }).getByRole("link", { name: /Hitbox and hurtbox/ }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Hitbox and hurtbox");
  await page.getByRole("navigation", { name: "Site information" }).getByRole("link", { name: "Privacy", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Privacy");
  await page.getByRole("navigation", { name: "Site information" }).getByRole("link", { name: "About", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("About this guide");
});

test("reduced motion starts paused and still permits explicit play", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./concepts/screen-shake/");
  const canvas = page.locator("canvas");
  await expect(canvas).toHaveAttribute("data-ready", "true");
  const play = page.getByRole("button", { name: "Play Screen shake animation", exact: true });
  await expect(play).toBeVisible();
  const frame = await canvas.getAttribute("data-frame");
  await page.waitForTimeout(150);
  expect(await canvas.getAttribute("data-frame")).toBe(frame);
  await play.click();
  await expect.poll(async () => Number(await canvas.getAttribute("data-frame"))).toBeGreaterThan(Number(frame));
});

test("offscreen canvases stop updating and resume on return", async ({ page }) => {
  await page.goto("./");
  const canvas = page.locator("#raycasting canvas");
  await canvas.scrollIntoViewIfNeeded();
  await expect(canvas).toHaveAttribute("data-ready", "true");
  await page.locator("#chunk-streaming").scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  const frame = await canvas.getAttribute("data-frame");
  await page.waitForTimeout(200);
  expect(await canvas.getAttribute("data-frame")).toBe(frame);
  await canvas.scrollIntoViewIfNeeded();
  await expect.poll(async () => Number(await canvas.getAttribute("data-frame"))).toBeGreaterThan(Number(frame));
});

test("every exported detail route and its assets load under the Pages prefix", async ({ page, request }) => {
  await page.goto("./");
  const links = await page.locator(".card h3 a").evaluateAll(nodes => nodes.map(node => (node as HTMLAnchorElement).href));
  for (const link of links) {
    const response = await request.get(link);
    expect(response.status(), link).toBe(200);
    expect(await response.text()).toContain("Implementation sketch");
  }
  await page.goto("./concepts/fragment-shader/");
  await expect(page.locator("canvas")).toHaveAttribute("data-ready", "true");
  await page.getByRole("button", { name: "Pause Fragment shader animation", exact: true }).click();
  await page.waitForTimeout(100);
  await expect(page.locator("pre code")).toContainText("float wave");
});

test("search and chapter filters combine, explain empty results, and reset", async ({ page }) => {
  await page.goto("./");
  const search = page.getByRole("searchbox", { name: "Search concepts" });
  const filters = page.getByRole("group", { name: "Filter concepts by chapter" });
  await search.fill("  EASING  ");
  await expect(page.locator(".card")).toHaveCount(3);
  await expect(page.locator("#easing h3")).toHaveText("Easing");
  await filters.getByRole("button", { name: /Performance/ }).click();
  await expect(page.locator(".card")).toHaveCount(0);
  await expect(page.getByText("No experiments found.", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Surprise me" })).toBeDisabled();
  await page.getByRole("button", { name: "Show all concepts" }).click();
  await expect(page.locator(".card")).toHaveCount(34);
  await expect(search).toHaveValue("");
  await filters.getByRole("button", { name: /Game feel/ }).click();
  await expect(page.locator(".card")).toHaveCount(10);
  await expect(page.locator(".library__results [role=status]")).toHaveText("10 concepts to explore");
  await page.getByRole("button", { name: "Reset filters" }).click();
  await search.fill("camera");
  expect(await page.locator(".card").count()).toBeGreaterThan(1);
  expect(await page.locator(".card").count()).toBeLessThan(34);
  await page.getByRole("button", { name: "Clear search" }).click();
  await expect(search).toBeFocused();
  await expect(page.locator(".card")).toHaveCount(34);
});

test("search keyboard shortcuts and chapter navigation restore the library", async ({ page }) => {
  await page.goto("./");
  const search = page.getByRole("searchbox", { name: "Search concepts" });
  await page.keyboard.press("/");
  await expect(search).toBeFocused();
  await search.fill("easing");
  await search.press("Escape");
  await expect(search).toHaveValue("");
  await expect(page.locator(".card")).toHaveCount(34);
  await search.fill("easing");
  await page.getByRole("navigation", { name: "Chapters" }).getByRole("link", { name: "Systems", exact: true }).click();
  await expect(page.locator(".card")).toHaveCount(34);
  await expect(page.locator("#chapter-systems")).toBeInViewport();
});

test("featured playground responds and surprise opens a matching concept", async ({ page }) => {
  await page.goto("./");
  await expect(page).toHaveTitle("Game Dev Lab — 34 Playable Concepts");
  const sandbox = page.locator(".hero__sandbox");
  const canvas = sandbox.locator("canvas");
  await expect(canvas).toHaveAttribute("data-ready", "true");
  await sandbox.getByRole("button", { name: "Pause Particle system animation", exact: true }).click();
  await page.waitForTimeout(100);
  const before = await canvas.evaluate((node: HTMLCanvasElement) => node.toDataURL());
  await sandbox.getByRole("button", { name: "Change effect" }).click();
  await expect.poll(() => canvas.evaluate((node: HTMLCanvasElement) => node.toDataURL())).not.toBe(before);
  await page.getByRole("searchbox", { name: "Search concepts" }).fill("seeded noise");
  await expect(page.locator(".card")).toHaveCount(1);
  await page.getByRole("button", { name: "Surprise me" }).click();
  await expect(page).toHaveURL(/\/concepts\/seeded-noise\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Seeded noise");
});
