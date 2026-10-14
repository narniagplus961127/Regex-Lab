import { expect, test } from "@playwright/test";
test("searches, resets, and loads a preset as a complete editable playground", async ({
  page,
}) => {
  await page.goto("/");
  const library = page.getByRole("region", { name: "Preset library" });
  await expect(library.getByRole("button", { name: /^Load / })).toHaveCount(20);
  await library.getByLabel("Search presets").fill("subdomains");
  await expect(library.getByRole("button", { name: /^Load / })).toHaveCount(1);
  await library.getByLabel("Preset category").selectOption("Developer");
  await expect(library).toContainText("No presets match");
  await library.getByRole("button", { name: "Reset filters" }).click();
  await library
    .getByRole("button", { name: "Load 24-hour time", exact: true })
    .click();
  await expect(page.getByLabel("Playground test text")).toHaveValue("09:45");
  await expect(
    page.getByRole("button", { name: "Validate entire input" }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("region", { name: "Example checks" }),
  ).toContainText("2 / 2 checks passing");
  await expect(
    page.getByRole("region", { name: "Explanation and copying" }),
  ).toContainText("00–23");
  await page.getByLabel("Regular expression").fill("never");
  await expect(
    page.getByRole("region", { name: "Example checks" }),
  ).toContainText("1 / 2 checks passing");
});

test("reaches the library from navigation without losing playground edits", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("Regular expression").fill("my-work");
  await page.getByRole("link", { name: "Preset library" }).click();
  await expect(page).toHaveURL(/#preset-library$/);
  await expect(page.getByLabel("Regular expression")).toHaveValue("my-work");
  await expect(
    page.getByRole("region", { name: "Preset library" }),
  ).toBeInViewport();
});

test("every preset loads matching intent, sample, limits, and passing checks without AI", async ({
  page,
}) => {
  await page.goto("/");
  const library = page.getByRole("region", { name: "Preset library" });
  const setups: [string, string, "find" | "validate", string][] = [
    ["Email address", "hello@example.com", "find", "deliverability"],
    ["HTTP/HTTPS URL", "https://example.com/docs", "find", "URL validity"],
    ["Domain name", "docs.example.com", "validate", "punycode"],
    ["US-style phone number", "415-555-0123", "validate", "subscriber"],
    ["International phone format", "+60123456789", "validate", "country code"],
    ["Username", "alex_chen", "validate", "reserved names"],
    ["Password format", "RegexLab2026", "validate", "password strength"],
    ["URL slug", "my-first-post", "validate", "Unicode"],
    ["ASCII alphanumeric", "Regex2026", "validate", "accented"],
    ["ISO-style date", "2026-10-14", "find", "calendar validation"],
    ["24-hour time", "09:45", "validate", "time zones"],
    ["Integer", "-123", "validate", "exponents"],
    ["Decimal number", "-42.50", "validate", "grouping commas"],
    ["IPv4 address", "192.168.1.1", "find", "reachability"],
    [
      "UUID v4",
      "550e8400-e29b-41d4-a716-446655440000",
      "validate",
      "uniqueness",
    ],
    ["Hex color", "#a3e635", "find", "alpha colors"],
    ["Semantic version", "1.2.3-beta.1+build.007", "validate", "precedence"],
    ["Whitespace runs", " \t\n", "find", "JavaScript"],
    ["ASCII hashtag", "#Regex_2026", "find", "Unicode tags"],
    ["File extension", "report.PDF", "validate", "MIME type"],
  ];
  for (const [name, sample, intent, limit] of setups) {
    await library
      .getByRole("button", { name: `Load ${name}`, exact: true })
      .click();
    await expect(page.getByLabel("Playground test text")).toHaveValue(sample);
    await expect(
      page.getByRole("button", {
        name:
          intent === "find" ? "Find matches in text" : "Validate entire input",
      }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(
      page.getByRole("region", { name: "Example checks" }),
    ).toContainText("2 / 2 checks passing");
    await expect(
      page.getByRole("region", { name: "Explanation and copying" }),
    ).toContainText(limit);
    await expect(
      page.getByRole("button", { name: "Copy regex", exact: true }),
    ).toBeEnabled();
  }
});
