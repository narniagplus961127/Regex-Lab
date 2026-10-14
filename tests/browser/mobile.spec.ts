import { expect, test } from "@playwright/test";
test("mobile keyboard visitor loads a preset and returns to editing and copying", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(
    page.getByRole("region", { name: "Live text playground" }),
  ).toContainText("2 matches found");
  const libraryLink = page.getByRole("button", {
    name: "Preset library",
    exact: true,
  });
  await expect(libraryLink).toBeVisible();
  await libraryLink.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByLabel("Search presets")).toBeFocused();
  await page.keyboard.type("24-hour");
  const load = page.getByRole("button", {
    name: "Load 24-hour time",
    exact: true,
  });
  await load.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByLabel("Regular expression")).toBeFocused();
  await expect(
    page.getByRole("region", { name: "Example checks" }),
  ).toContainText("2 / 2 checks passing");
  await page.getByLabel("Regular expression").fill("[");
  await expect(
    page
      .getByRole("region", { name: "Live text playground" })
      .getByRole("alert"),
  ).toContainText("Invalid");
  await expect(page.getByLabel("Regular expression")).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await page
    .getByLabel("Regular expression")
    .fill("(?<hour>[0-9]{2}):([0-9]{2})");
  await expect(
    page.getByRole("region", { name: "Match details" }),
  ).toContainText('hour: "09"');
  const usage = page.getByText("JavaScript usage", { exact: true });
  await usage.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByLabel("JavaScript snippet")).toBeVisible();
  await page.getByRole("button", { name: "Copy regex", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("region", { name: "Copy current pattern" }),
  ).toContainText(/copied|Clipboard unavailable/);
  await expect(page.getByLabel("Regular expression")).toBeEnabled();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("mobile example-guided generation supports keyboard editing, statuses and copy", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route("**/api/generate", async (route) => {
    if (route.request().method() === "GET")
      return route.fulfill({ json: { configured: true } });
    expect(route.request().postDataJSON().examples).toEqual([
      { text: "ORD-123", shouldMatch: true },
      { text: "bad", shouldMatch: false },
    ]);
    await route.fulfill({
      json: {
        pattern: "ORD-(?<number>[0-9]{3})",
        flags: "g",
        explanation: "Finds order numbers.",
        limitations: ["Three ASCII digits only."],
      },
    });
  });
  await page.goto("/");
  await expect(
    page.getByRole("region", { name: "Live text playground" }),
  ).toContainText("2 matches found");
  await page.getByLabel("Describe your pattern").fill("Find order numbers");
  await page
    .getByRole("button", { name: "Add should match", exact: true })
    .focus();
  await page.keyboard.press("Enter");
  await page.getByLabel("Example 1 text").fill("ORD-123");
  await page
    .getByRole("button", { name: "Add should not match", exact: true })
    .focus();
  await page.keyboard.press("Enter");
  await page.getByLabel("Example 2 text").fill("bad");
  await page.getByLabel("Playground test text").fill("private ORD-123");
  const generate = page.getByRole("button", {
    name: "Generate regex",
    exact: true,
  });
  await generate.focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("region", { name: "AI pattern generator" }),
  ).toContainText("Pattern generated. Test it in the playground.");
  await page.getByLabel("Regular expression").focus();
  await expect(page.getByLabel("Regular expression")).toBeFocused();
  await expect(
    page.getByRole("region", { name: "Example checks" }),
  ).toContainText("2 / 2 checks passing");
  await expect(
    page.getByRole("region", { name: "Match details" }),
  ).toContainText('number: "123"');
  await page.getByText("Understand your pattern", { exact: true }).click();
  await expect(
    page.getByRole("region", { name: "Pattern explanation" }),
  ).toContainText("Finds order numbers.");
  await page.getByLabel("Example 1 text").fill("ORD-12");
  await expect(
    page.getByRole("region", { name: "Example checks" }),
  ).toContainText("1 / 2 checks passing");
  await page.getByLabel("Regular expression").fill("ORD-(?<number>[0-9]{2,3})");
  await expect(
    page.getByRole("region", { name: "Example checks" }),
  ).toContainText("2 / 2 checks passing");
  await page
    .getByRole("button", { name: "Copy JavaScript", exact: true })
    .focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("region", { name: "Copy current pattern" }),
  ).toContainText(/copied|Clipboard unavailable/);
});

test("narrow editors contain long Unicode lines and keep highlights aligned on scroll", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/");
  await expect(
    page.getByRole("region", { name: "Live text playground" }),
  ).toContainText("2 matches found");
  await page.getByLabel("Regular expression").fill("(?<word>é😀)");
  await page.getByRole("button", { name: "Unicode", exact: false }).click();
  const text = Array.from(
    { length: 30 },
    (_, i) => `${i} ${"漢".repeat(150)} é😀`,
  ).join("\n");
  const editor = page.getByLabel("Playground test text");
  await editor.fill(text);
  await expect(page.locator("mark")).toHaveCount(30);
  await editor.evaluate((el) => {
    el.scrollTop = 230;
    el.scrollLeft = 670;
    el.dispatchEvent(new Event("scroll"));
  });
  const position = await editor.evaluate((el) => ({
    x: el.scrollLeft,
    y: el.scrollTop,
    left: el.getBoundingClientRect().left,
    top: el.getBoundingClientRect().top,
    font: getComputedStyle(el).font,
    padding: getComputedStyle(el).padding,
  }));
  const highlight = await page.locator(".highlight-overlay").evaluate((el) => ({
    x: el.scrollLeft,
    y: el.scrollTop,
    left: el.getBoundingClientRect().left,
    top: el.getBoundingClientRect().top,
    font: getComputedStyle(el).font,
    padding: getComputedStyle(el).padding,
  }));
  expect(position.x).toBeGreaterThan(0);
  expect(position.y).toBeGreaterThan(0);
  expect(highlight).toEqual(position);
  await page.getByLabel("Regular expression").fill("a".repeat(1900));
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("desktop keyboard tab order and mobile screenshots", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await expect(
    page.getByRole("region", { name: "Live text playground" }),
  ).toContainText("2 matches found");
  await expect(
    page.getByText("AI is not configured.", { exact: false }),
  ).toBeVisible();
  await page.getByLabel("Describe your pattern").focus();
  // Empty description disables Generate; owner guidance is a disclosure before the pattern.
  await page.keyboard.press("Tab");
  await expect(page.getByText("Owner setup", { exact: true })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Regular expression")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Find matches in text", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Validate entire input", exact: true }),
  ).toBeFocused();
  await page.screenshot({
    path: "output/playwright/desktop-workbench.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "output/playwright/mobile-workbench.png",
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Preset library", exact: true })
    .click();
  await page.screenshot({ path: "output/playwright/mobile-library.png" });
});
