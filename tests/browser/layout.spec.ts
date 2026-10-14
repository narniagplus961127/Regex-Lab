import { expect, test } from "@playwright/test";
test("desktop stacks generation and testing beside an independently scrolling library", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  const library = page.getByRole("complementary", { name: "Preset sidebar" });
  await expect(library).toBeVisible();
  const generator = await page
    .getByRole("region", { name: "AI pattern generator" })
    .boundingBox();
  const pattern = await page.locator(".pattern-panel").boundingBox();
  const text = await page
    .getByRole("region", { name: "Live text playground" })
    .boundingBox();
  const dock = await library.boundingBox();
  const header = await page.getByRole("banner").boundingBox();
  const footer = await page.getByRole("contentinfo").boundingBox();
  expect(footer!.width).toBe(header!.width);
  expect(footer!.x).toBe(header!.x);
  expect(dock!.y - header!.height).toBeGreaterThanOrEqual(24);
  await expect(
    page.getByRole("region", { name: "Pattern explanation" }),
  ).not.toBeVisible();
  await page.getByText("Understand your pattern", { exact: true }).click();
  await expect(
    page.getByRole("region", { name: "Pattern explanation" }),
  ).toBeVisible();
  expect(pattern!.y).toBeGreaterThan(generator!.y + generator!.height - 1);
  expect(text!.y).toBeGreaterThan(pattern!.y);
  expect(dock!.x).toBeGreaterThan(generator!.x + generator!.width - 1);
  const beforeScroll = await page.evaluate(() => scrollY);
  await library.evaluate((el) => (el.scrollTop = 700));
  expect(await library.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
  await expect(library.getByLabel("Search presets")).toBeInViewport();
  await expect(library.getByLabel("Preset category")).toBeInViewport();
  expect(await page.evaluate(() => scrollY)).toBe(beforeScroll);
});

test("tablet drawer traps keyboard focus, preserves edits and restores trigger on Escape and backdrop", async ({
  page,
}) => {
  await page.setViewportSize({ width: 900, height: 900 });
  await page.goto("/");
  await expect(
    page.getByRole("region", { name: "Live text playground" }),
  ).toContainText("2 matches found");
  await page.getByLabel("Describe your pattern").fill("Keep my description");
  await page.getByLabel("Regular expression").fill("keep-me");
  const trigger = page.getByRole("button", {
    name: "Preset library",
    exact: true,
  });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Preset library drawer" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByLabel("Search presets")).toBeFocused();
  const last = dialog.getByRole("button", {
    name: "Load File extension",
    exact: true,
  });
  await last.focus();
  await page.keyboard.press("Tab");
  await expect(
    dialog.getByRole("button", { name: "Close preset library", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(last).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await expect(page.getByLabel("Describe your pattern")).toHaveValue(
    "Keep my description",
  );
  await expect(page.getByLabel("Regular expression")).toHaveValue("keep-me");
  await trigger.click();
  await page.mouse.click(10, 450);
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await dialog.getByLabel("Search presets").fill("24-hour");
  await dialog
    .getByRole("button", { name: "Load 24-hour time", exact: true })
    .click();
  await expect(dialog).not.toBeVisible();
  await expect(page.getByLabel("Regular expression")).toBeFocused();
  await expect(page.getByLabel("Playground test text")).toHaveValue("09:45");
  await expect(page.getByLabel("Describe your pattern")).toHaveValue(
    "Keep my description",
  );
});

test("mobile drawer keeps background fixed while its preset list scrolls", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto("/");
  await expect(
    page.getByRole("region", { name: "Live text playground" }),
  ).toContainText("2 matches found");
  await page
    .getByRole("button", { name: "Preset library", exact: true })
    .click();
  const dialog = page.getByRole("dialog", { name: "Preset library drawer" });
  await expect(dialog).toBeVisible();
  await page.mouse.move(5, 450);
  await page.mouse.wheel(0, 900);
  await page.waitForTimeout(150);
  expect(await page.evaluate(() => scrollY)).toBe(0);
  const drawerLibrary = dialog.getByRole("region", { name: "Preset library" });
  await drawerLibrary.evaluate((el) => (el.scrollTop = 1000));
  expect(await drawerLibrary.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
  await expect(dialog.getByLabel("Search presets")).toBeInViewport();
  await expect(dialog.getByLabel("Preset category")).toBeInViewport();
  await expect(
    dialog.getByRole("button", { name: "Close preset library" }),
  ).toBeInViewport();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await page.mouse.move(200, 450);
  await page.mouse.wheel(0, 600);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
});
