import { expect, test } from "@playwright/test";

test("understands and copies the current pattern without stale summaries", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("region", { name: "Live text playground" }),
  ).toContainText("2 matches found");

  await page.getByText("Understand your pattern", { exact: true }).click();

  const details = page.getByRole("region", { name: "Pattern explanation" });

  await expect(details).toContainText("Finds email-like addresses");
  await page.getByLabel("Regular expression").fill("cat|dog");
  await expect(details).not.toContainText("Finds email-like addresses");
  await page.getByRole("button", { name: "Validate entire input" }).click();
  await page.getByRole("button", { name: "m Multiline", exact: true }).click();
  await expect(page.getByLabel("Effective regex")).toHaveValue(/\(\?<\!/);

  const literal = await page.getByLabel("Effective regex").inputValue();
  const outcomes = await page.evaluate((source) => {
    const regex = Function(`return (${source})`)();

    return ["dog", "x\ndog", "dog\n"].map((text) => regex.test(text));
  }, literal);

  expect(outcomes).toEqual([true, false, false]);
  await page.getByLabel("Regular expression").fill("[");

  await expect(
    page.getByRole("button", { name: "Copy regex", exact: true }),
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

  await expect(
    page.getByRole("region", { name: "Live text playground" }),
  ).toContainText("2 matches found");

  await page.getByText("Understand your pattern", { exact: true }).click();

  const details = page.getByRole("region", { name: "Pattern explanation" });

  await page.getByLabel("Regular expression").fill("a/b\\\\");
  await page.getByLabel("Playground test text").fill("a/b\\");
  await page.getByRole("button", { name: "Copy regex", exact: true }).click();

  await expect(
    page.getByRole("region", { name: "Copy current pattern" }),
  ).toContainText("Regex copied.");

  expect(
    await page.evaluate(() => (window as unknown as { copied: string }).copied),
  ).toBe("/a\\/b\\\\/gi");

  await page.getByText("JavaScript usage", { exact: true }).click();

  await page
    .getByRole("button", { name: "Copy JavaScript", exact: true })
    .click();

  await expect(
    page.getByRole("region", { name: "Copy current pattern" }),
  ).toContainText("JavaScript copied.");

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

  await page.getByRole("button", { name: "Copy regex", exact: true }).click();

  await expect(
    page.getByRole("region", { name: "Copy current pattern" }),
  ).toContainText("Select the output below and copy it manually.");

  await expect(page.getByLabel("Effective regex")).toHaveValue("/a\\/b\\\\/gi");
});

test("summary becomes unavailable after settings change, with current syntax reference retained", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("region", { name: "Live text playground" }),
  ).toContainText("2 matches found");

  await page.getByText("Understand your pattern", { exact: true }).click();

  const details = page.getByRole("region", { name: "Pattern explanation" });

  await page
    .getByRole("button", { name: "i Ignore case", exact: true })
    .click();

  await expect(details).not.toContainText("Finds email-like addresses");

  await expect(details).toContainText(
    "A boundary between a word and non-word character.",
  );

  await page.getByLabel("Regular expression").fill("a{2,}");
  await expect(details).toContainText("at least 2");
});
