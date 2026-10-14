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
