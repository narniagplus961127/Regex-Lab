import { expect, test } from "@playwright/test";

test("switches from finding fragments to strict whole-input validation", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("Regular expression").fill("cat|dog");
  await page.getByLabel("Playground test text").fill("a cat");

  await expect(
    page
      .getByRole("region", { name: "Live text playground" })
      .getByRole("status"),
  ).toContainText("1 match found");

  await page.getByRole("button", { name: "Validate entire input" }).click();

  await expect(
    page
      .getByRole("region", { name: "Live text playground" })
      .getByRole("status"),
  ).toContainText("0 matches found");

  await expect(
    page.getByText("Global iteration is ignored in validation mode."),
  ).toBeVisible();

  await page.getByLabel("Playground test text").fill("dog");

  await expect(
    page
      .getByRole("region", { name: "Live text playground" })
      .getByRole("status"),
  ).toContainText("1 match found");

  await page.getByRole("button", { name: "m Multiline", exact: true }).click();
  await page.getByLabel("Playground test text").fill("x\ndog");

  await expect(
    page
      .getByRole("region", { name: "Live text playground" })
      .getByRole("status"),
  ).toContainText("0 matches found");

  await page.getByLabel("Playground test text").fill("dog\n");

  await expect(
    page
      .getByRole("region", { name: "Live text playground" })
      .getByRole("status"),
  ).toContainText("0 matches found");
});

test("inspects positions and distinguishes empty from unmatched named captures", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("Regular expression").fill("(?<letter>a)(b)?(c*)");
  await page.getByLabel("Playground test text").fill("xxa");

  const matches = page.getByRole("region", { name: "Match details" });

  await expect(matches).toContainText("Start 2 · End 3");

  await expect(
    matches.getByText('Group 1: "a"', { exact: true }),
  ).toBeVisible();

  await expect(
    matches.getByText("Group 2: Unmatched", { exact: true }),
  ).toBeVisible();

  await expect(
    matches.getByText("Group 3: Empty string", { exact: true }),
  ).toBeVisible();

  await expect(matches.getByText('letter: "a"', { exact: true })).toBeVisible();
  await page.getByLabel("Regular expression").fill("[");
  await expect(matches).not.toContainText('letter: "a"');
});

test("adds, edits and removes positive and negative examples including empty input", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("Regular expression").fill("a+");

  const checks = page.getByRole("region", { name: "Example checks" });

  await checks.getByRole("button", { name: "Add should match" }).click();
  await checks.getByLabel("Example 1 text").fill("aaa");
  await checks.getByRole("button", { name: "Add should not match" }).click();
  await expect(checks).toContainText("2 / 2 checks passing");

  await expect(
    checks.getByText("Actual: No match", { exact: true }),
  ).toBeVisible();

  await page.getByLabel("Regular expression").fill("b+");
  await expect(checks).toContainText("1 / 2 checks passing");
  await checks.getByLabel("Example 1 text").fill("bbb");
  await expect(checks).toContainText("2 / 2 checks passing");
  await page.getByLabel("Regular expression").fill("a*");
  await expect(checks).toContainText("1 / 2 checks passing");
  await checks.getByLabel("Example 2 expected outcome").selectOption("match");
  await expect(checks).toContainText("2 / 2 checks passing");
  await page.getByLabel("Regular expression").fill("[");
  await expect(checks).toContainText("Checks unavailable");
  await expect(checks.getByText("Pass", { exact: true })).toHaveCount(0);
  await checks.getByRole("button", { name: "Remove example 1" }).click();
  await expect(checks.getByLabel("Example 2 text")).toHaveCount(0);
  await expect(checks.getByLabel("Example 1 text")).toHaveValue("");
});

test("matching intent and flags recheck examples and slow examples share the testing deadline", async ({
  page,
}) => {
  await page.goto("/");

  const checks = page.getByRole("region", { name: "Example checks" });

  await page.getByLabel("Regular expression").fill("dog");
  await checks.getByRole("button", { name: "Add should match" }).click();
  await checks.getByLabel("Example 1 text").fill("a DOG");
  await expect(checks).toContainText("1 / 1 checks passing");
  await page.getByRole("button", { name: "Validate entire input" }).click();
  await expect(checks).toContainText("0 / 1 checks passing");
  await checks.getByLabel("Example 1 text").fill("DOG");
  await expect(checks).toContainText("1 / 1 checks passing");

  await page
    .getByRole("button", { name: "i Ignore case", exact: true })
    .click();

  await expect(checks).toContainText("0 / 1 checks passing");
  await page.getByLabel("Playground test text").fill("a");
  await page.getByLabel("Regular expression").fill("(a+)+$");
  await checks.getByLabel("Example 1 text").fill("a".repeat(32) + "!");
  await expect(checks).toContainText("Checking examples…");
  await expect(checks.getByText("Pass", { exact: true })).toHaveCount(0);

  await expect(
    page
      .getByRole("region", { name: "Live text playground" })
      .getByRole("alert"),
  ).toContainText("took too long", { timeout: 10000 });

  await expect(checks).toContainText("Checks unavailable");
  await page.getByLabel("Regular expression").fill("[\\s\\S]*");
  await expect(checks).toContainText("1 / 1 checks passing");
});
