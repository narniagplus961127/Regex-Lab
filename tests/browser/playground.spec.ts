import { expect, test } from "@playwright/test";
test("edits a pattern and test text live, then changes global matching", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("Regular expression").fill("\\d+");
  await page.getByLabel("Playground test text").fill("Order 123 and 456");
  await expect(page.getByRole("status")).toContainText("2 matches found");
  await expect(page.locator("mark")).toHaveText(["123", "456"]);
  await page.getByRole("button", { name: "g Global", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("1 match found");
});
test("invalid syntax explains the problem and editing recovers", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("Regular expression").fill("[");
  await expect(
    page
      .getByRole("region", { name: "Live text playground" })
      .getByRole("alert"),
  ).toContainText("Check brackets");
  await page.getByLabel("Regular expression").fill("z");
  await expect(page.getByRole("status")).toContainText("0 matches found");
});
test("a slow pattern stops and old results cannot replace a newer edit", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("Regular expression").fill("(a+)+$");
  await page.getByLabel("Playground test text").fill("a".repeat(32) + "!");
  await expect(
    page
      .getByRole("region", { name: "Live text playground" })
      .getByRole("alert"),
  ).toContainText("took too long", {
    timeout: 10000,
  });
  await page.getByLabel("Regular expression").fill("!");
  await expect(page.getByRole("status")).toContainText("1 match found");
  await page.getByLabel("Regular expression").fill("(a+)+$");
  await expect(page.getByRole("status")).toContainText("Testing");
  await page.getByLabel("Regular expression").fill("!");
  await expect(page.getByRole("status")).toContainText("1 match found");
  await page.waitForTimeout(1700);
  await expect(page.locator("mark")).toHaveText(["!"]);
  await expect(
    page
      .getByRole("region", { name: "Live text playground" })
      .getByRole("alert"),
  ).toHaveCount(0);
});
test("over-limit text is rejected and clipping clearly identifies incomplete counts", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("Regular expression").fill("a");
  await page.getByLabel("Playground test text").fill("a".repeat(501));
  await expect(page.getByRole("status")).toContainText("500+ matches found");
  await expect(
    page.getByText(
      "Showing the first 500 matches. More matches exist; this is not the complete count.",
    ),
  ).toBeVisible();
  await page.getByLabel("Playground test text").fill("a".repeat(30001));
  await expect(
    page
      .getByRole("region", { name: "Live text playground" })
      .getByRole("alert"),
  ).toContainText("30,000");
});
test("Unicode empty matches terminate and flags change JavaScript behavior", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("Regular expression").fill("(?:)");
  await page.getByLabel("Playground test text").fill("😀");
  await expect(page.getByRole("status")).toContainText("3 matches found");
  await page.getByRole("button", { name: "u Unicode", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("2 matches found");
  await page.getByLabel("Regular expression").fill("^b.c$");
  await page.getByLabel("Playground test text").fill("a\nB\nc");
  await expect(page.getByRole("status")).toContainText("0 matches found");
  await page.getByRole("button", { name: "m Multiline", exact: true }).click();
  await page.getByRole("button", { name: "s Dot all", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("1 match found");
  await page
    .getByRole("button", { name: "i Ignore case", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("0 matches found");
});
test("pattern and editable playground fit narrow screens without horizontal scrolling", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByLabel("Regular expression")).toBeVisible();
  await expect(page.getByLabel("Playground test text")).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
});
