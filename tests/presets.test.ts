import { expect, test } from "vitest";
import { PRESETS } from "../src/lib/presets";
import { evaluateRegex } from "../src/lib/regex";
// Literal inputs encode the product's format contract independently of the recipes.
const cases: [string, string[], string[]][] = [
  [
    "email",
    ["alice.smith+tag@example.co.uk"],
    ["a..b@example.com", "name@bad-.com", "name@localhost"],
  ],
  [
    "url",
    ["Visit https://example.com/a?q=1 now"],
    ["ftp://example.com", "xhttps://example.com"],
  ],
  [
    "domain",
    ["a.example.com", "xn--bcher-kva.example"],
    ["bad_.example.com", "例子.com", "a".repeat(64) + ".com", "example.com."],
  ],
  [
    "phone",
    ["5550123", "212.555.0199", "212 555 0199"],
    ["12125550199", "212-555.0199", "(212) 555-0199"],
  ],
  [
    "international-phone",
    ["+123456789012345", "+12"],
    ["+1234567890123456", "+012", "+60 123"],
  ],
  ["username", ["abc", "a".repeat(20)], ["ab", "a".repeat(21), "aébc", "1abc"]],
  ["password", ["Abcdefg1"], ["Abcdef1", "abcdefg1", "ABCDEFG1", "Abc defg1"]],
  ["slug", ["a-1-blog"], ["-a", "a-", "a--b", "Blog"]],
  ["alphanumeric", ["Abc123"], ["", "abc_def", "café"]],
  [
    "date",
    ["2026-02-31"],
    ["2026-00-01", "2026-13-01", "2026-01-32", "12026-01-01", "2026-01-011"],
  ],
  ["time", ["00:00", "23:59"], ["24:00", "23:60", "1:00", "09:45 extra"]],
  ["integer", ["-12", "001"], ["12.3", "1e3", "1,000", "+1", "x12"]],
  ["number", ["-0.5", "100", "01.20"], ["1e3", "1,234.5", ".5", "5.", "x42.5"]],
  [
    "ipv4",
    ["IP: 255.255.255.255", "0.0.0.0"],
    ["256.1.2.3", "999.192.168.1.1", "01.2.3.4", "1.2.3.4.5"],
  ],
  [
    "uuid",
    ["550E8400-E29B-41D4-B716-446655440000"],
    [
      "550e8400-e29b-11d4-a716-446655440000",
      "550e8400-e29b-41d4-7716-446655440000",
      "x550e8400-e29b-41d4-a716-446655440000",
    ],
  ],
  ["hex", ["Color: #ABC and #001122"], ["#abcd", "#001122ff", "#xyz", "x#fff"]],
  [
    "semver",
    ["0.0.0", "1.2.3-alpha.0+001", "1.2.3-01a"],
    ["01.2.3", "1.2.3-01", "1.2.3-alpha..1", "v1.2.3", "1.2.3+"],
  ],
  ["whitespace", ["x\t\ny"], ["abc_def", ""]],
  ["hashtag", ["Try #hello_123 and #123"], ["#café", "word#tag", "#", "##tag"]],
  [
    "extension",
    ["photo.JPEG", "report.pdf", "icon.png"],
    ["photo.gif", "report.pdf.exe", "report.pdf\n", "path/report.pdf"],
  ],
];
test.each(cases)(
  "%s matches its documented scope in the playground evaluator",
  (id, positives, negatives) => {
    const preset = PRESETS.find((p) => p.id === id)!;
    expect(preset, "Recipe must exist").toBeDefined();
    const examples = [
      ...positives.map((text, i) => ({
        id: `positive-${i}`,
        text,
        shouldMatch: true,
      })),
      ...negatives.map((text, i) => ({
        id: `negative-${i}`,
        text,
        shouldMatch: false,
      })),
    ];
    const result = evaluateRegex({ ...preset, examples });
    expect(result.error).toBeUndefined();
    expect(result.examples.map((check) => check.passed)).toEqual(
      examples.map(() => true),
    );
    const supplied = evaluateRegex(preset);
    expect(supplied.error).toBeUndefined();
    expect(supplied.examples.map((check) => check.passed)).toEqual([
      true,
      true,
    ]);
  },
);
