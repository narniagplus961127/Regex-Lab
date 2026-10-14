import { expect, test } from "@playwright/test";
test("understands and copies the current pattern without stale summaries", async ({
  page,
}) => {
  await page.goto("/");
  const details = page.getByRole("region", { name: "Explanation and copying" });
  await expect(details).toContainText("Finds email-like addresses");
  await page.getByLabel("Regular expression").fill("cat|dog");
  await expect(details).not.toContainText("Finds email-like addresses");
  await page.getByRole("button", { name: "Validate entire input" }).click();
  await page.getByRole("button", { name: "m Multiline", exact: true }).click();
  await expect(details.getByLabel("Effective regex")).toHaveValue(/\(\?<\!/);
  const literal = await details.getByLabel("Effective regex").inputValue();
  const outcomes = await page.evaluate((source) => {
    const regex = Function(`return (${source})`)();
    return ["dog", "x\ndog", "dog\n"].map((text) => regex.test(text));
  }, literal);
  expect(outcomes).toEqual([true, false, false]);
  await page.getByLabel("Regular expression").fill("[");
  await expect(
    details.getByRole("button", { name: "Copy regex", exact: true }),
  ).toBeDisabled();
});
test("copies outputs with visible clipboard success and manual fallback while retaining playground state", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          (window as unknown as { copied: string }).copied = text;
        },
      },
    });
  });
  await page.goto("/");
  const details = page.getByRole("region", { name: "Explanation and copying" });
  await page.getByLabel("Regular expression").fill("a/b\\\\");
  await page.getByLabel("Playground test text").fill("a/b\\");
  await details
    .getByRole("button", { name: "Copy regex", exact: true })
    .click();
  await expect(details).toContainText("Regex copied.");
  expect(
    await page.evaluate(() => (window as unknown as { copied: string }).copied),
  ).toBe("/a\\/b\\\\/gi");
  await details.getByText("JavaScript usage", { exact: true }).click();
  await details
    .getByRole("button", { name: "Copy JavaScript", exact: true })
    .click();
  await expect(details).toContainText("JavaScript copied.");
  expect(
    await page.evaluate(() => (window as unknown as { copied: string }).copied),
  ).toContain("input.matchAll(regex)");
  await expect(page.getByLabel("Playground test text")).toHaveValue("a/b\\");
  await page.evaluate(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: async () => {
          throw new Error("denied");
        },
      },
    });
  });
  await details
    .getByRole("button", { name: "Copy regex", exact: true })
    .click();
  await expect(details).toContainText(
    "Select the output below and copy it manually.",
  );
  await expect(details.getByLabel("Effective regex")).toHaveValue(
    "/a\\/b\\\\/gi",
  );
});
test("summary becomes unavailable after settings change, with current syntax reference retained", async ({
  page,
}) => {
  await page.goto("/");
  const details = page.getByRole("region", { name: "Explanation and copying" });
  await page
    .getByRole("button", { name: "i Ignore case", exact: true })
    .click();
  await expect(details).not.toContainText("Finds email-like addresses");
  await details
    .getByText("Technical syntax reference", { exact: true })
    .click();
  await expect(details).toContainText(
    "A boundary between a word and non-word character.",
  );
  await page.getByLabel("Regular expression").fill("a{2,}");
  await expect(details).toContainText("at least 2");
});
