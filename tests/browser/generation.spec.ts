import { expect, test } from "@playwright/test";
test("generate from description while preserving private playground text", async ({
  page,
}) => {
  await page.route("**/api/generate", async (route) => {
    if (route.request().method() === "GET")
      return route.fulfill({ json: { configured: true } });
    expect(route.request().postDataJSON()).toEqual({
      description: "Find numbers",
      mode: "find",
      flags: "gi",
      examples: [],
    });
    await route.fulfill({
      json: {
        pattern: "[0-9]+",
        flags: "gi",
        explanation: "Finds ASCII digits.",
        limitations: ["ASCII only."],
      },
    });
  });
  await page.goto("/");

  await page.getByLabel("Describe your pattern").fill("Find numbers");
  await expect(
    page.getByRole("button", { name: "Generate regex", exact: true }),
  ).toBeEnabled();
  await page.getByLabel("Test text").fill("private 123");
  await page
    .getByRole("button", { name: "Generate regex", exact: true })
    .click();
  await expect(page.getByLabel("Regular expression")).toHaveValue("[0-9]+");
  await expect(page.getByLabel("Test text")).toHaveValue("private 123");
  await expect(
    page.getByText("Finds ASCII digits.", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("ASCII only.", { exact: true })).toBeVisible();
});
test("failed generation preserves a usable pattern and test text", async ({
  page,
}) => {
  await page.route("**/api/generate", (route) =>
    route.request().method() === "GET"
      ? route.fulfill({ json: { configured: true } })
      : route.fulfill({
          status: 429,
          json: {
            error:
              "AI quota is busy or exhausted. Wait a little and try again.",
          },
        }),
  );
  await page.goto("/");

  await page.getByLabel("Describe your pattern").fill("Find numbers");
  await expect(
    page.getByRole("button", { name: "Generate regex", exact: true }),
  ).toBeEnabled();
  await page.getByLabel("Regular expression").fill("[A-Z]+");
  await page.getByLabel("Test text").fill("private 123");
  await page
    .getByRole("button", { name: "Generate regex", exact: true })
    .click();
  await expect(
    page
      .getByRole("region", { name: "AI pattern generator" })
      .getByRole("alert"),
  ).toContainText("AI quota");
  await expect(page.getByLabel("Regular expression")).toHaveValue("[A-Z]+");
  await expect(page.getByLabel("Test text")).toHaveValue("private 123");
});
test("missing configuration explains setup while local matching stays usable", async ({
  page,
}) => {
  await page.route("**/api/generate", (route) =>
    route.fulfill({ json: { configured: false } }),
  );
  await page.goto("/");
  await expect(
    page.getByText("AI is not configured.", { exact: false }),
  ).toBeVisible({ timeout: 20000 });
  await page.getByLabel("Describe your pattern").fill("Find numbers");

  await expect(
    page.getByRole("button", { name: "Generate regex", exact: true }),
  ).toBeDisabled();
  await page.getByLabel("Regular expression").fill("[0-9]+");
  await page.getByLabel("Test text").fill("abc 123");
  await expect(page.locator("mark")).toHaveText("123");
});
test("generation reports progress, prevents duplicates, and can be cancelled", async ({
  page,
}) => {
  let submissions = 0;
  await page.route("**/api/generate", async (route) => {
    if (route.request().method() === "GET")
      return route.fulfill({ json: { configured: true } });
    submissions++;
    // Keep the public HTTP boundary pending until browser cancellation.
  });
  await page.goto("/");
  await page.getByLabel("Describe your pattern").fill("Find numbers");
  await expect(
    page.getByRole("button", { name: "Generate regex", exact: true }),
  ).toBeEnabled();
  const previous = await page.getByLabel("Regular expression").inputValue();
  await page
    .getByRole("button", { name: "Generate regex", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Generating…", exact: true }),
  ).toBeDisabled();
  await expect.poll(() => submissions).toBe(1);
  await page
    .getByRole("button", { name: "Cancel generation", exact: true })
    .click();
  await expect(
    page
      .getByRole("region", { name: "AI pattern generator" })
      .getByRole("alert"),
  ).toContainText("cancelled");
  await expect(page.getByLabel("Regular expression")).toHaveValue(previous);
  await expect(
    page.getByRole("button", { name: "Generate regex", exact: true }),
  ).toBeEnabled();
});

test("explicit examples guide generation and failed checks stay visible until revision", async ({
  page,
}) => {
  const submissions: unknown[] = [];
  await page.route("**/api/generate", async (route) => {
    if (route.request().method() === "GET")
      return route.fulfill({ json: { configured: true } });
    submissions.push(route.request().postDataJSON());
    await route.fulfill({
      json: {
        pattern: "[0-9]+",
        flags: "i",
        explanation: "Matches digits; check examples locally.",
        limitations: [],
      },
    });
  });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Validate entire input", exact: true })
    .click();
  await page.getByLabel("Describe your pattern").fill("Require digits");
  await page.getByLabel("Test text").fill("private playground 999");
  await page
    .getByRole("button", { name: "Add should match", exact: true })
    .click();
  await page.getByLabel("Example 1 text").fill("123");
  await page
    .getByRole("button", { name: "Add should not match", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Add should not match", exact: true })
    .click();
  await page.getByLabel("Example 3 text").fill("abc 123");
  await page
    .getByRole("button", { name: "Add should match", exact: true })
    .click();
  await page.getByLabel("Example 4 text").fill("ABC");
  await expect(
    page.getByText("Current example checks are sent", { exact: false }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Generate regex", exact: true })
    .click();
  await expect(page.getByLabel("Regular expression")).toHaveValue("[0-9]+");
  await expect(
    page.getByText("3 / 4 checks passing", { exact: true }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("region", { name: "Example checks" })
      .getByText("Fail", { exact: true }),
  ).toBeVisible();
  expect(submissions).toEqual([
    {
      description: "Require digits",
      mode: "validate",
      flags: "gi",
      examples: [
        { text: "123", shouldMatch: true },
        { text: "", shouldMatch: false },
        { text: "abc 123", shouldMatch: false },
        { text: "ABC", shouldMatch: true },
      ],
    },
  ]);
  await expect(page.getByLabel("Test text")).toHaveValue(
    "private playground 999",
  );
  await page.getByLabel("Example 4 text").fill("456");
  await page
    .getByRole("button", { name: "Find matches in text", exact: true })
    .click();
  await page.getByLabel("Describe your pattern").fill("Find digits anywhere");
  await page
    .getByRole("button", { name: "Generate regex", exact: true })
    .click();
  await expect.poll(() => submissions.length).toBe(2);
  await expect(
    page.getByText("3 / 4 checks passing", { exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("Example 4 text")).toHaveValue("456");
  await expect(page.getByLabel("Test text")).toHaveValue(
    "private playground 999",
  );
});
