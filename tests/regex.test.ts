import { describe, expect, it } from "vitest";
import { evaluateRegex } from "../src/lib/regex";

describe("evaluateRegex", () => {
  it("reports a complete count when exactly 500 matches exist", () => {
    const result = evaluateRegex({
      pattern: "a",
      flags: "g",
      mode: "find",
      text: "a".repeat(500),
      examples: [],
    });

    expect(result.matches).toHaveLength(500);
    expect(result.truncated).toBe(false);
  });
});

describe("whole-input validation and captures", () => {
  it.each([
    ["cat|dog", "g", "dog", true],
    ["cat|dog", "g", "a cat", false],
    ["^dog$", "m", "x\ndog", false],
    ["dog$", "m", "dog\n", false],
    ["dog|cat", "m", "dog\ncat", false],
    ["", "g", "", true],
    ["", "g", "a", false],
    ["[\\s\\S]*", "gm", "dog\ncat", true],
  ])(
    "validates %s with flags %s against %j",
    (pattern, flags, text, matched) => {
      const result = evaluateRegex({
        pattern,
        flags,
        text,
        mode: "validate",
        examples: [{ id: "sample", text, shouldMatch: matched }],
      });

      expect(result.matches.length > 0).toBe(matched);

      expect(result.examples).toEqual([
        { id: "sample", matched, passed: true },
      ]);
    },
  );

  it("returns numbered and named captures without conflating empty and unmatched values", () => {
    const result = evaluateRegex({
      pattern: "(?<letter>a)(?<optional>b)?(?<empty>c*)",
      flags: "g",
      mode: "find",
      text: "xxa a",
      examples: [],
    });

    expect(result.matches).toEqual([
      {
        value: "a",
        index: 2,
        groups: ["a", null, ""],
        namedGroups: { letter: "a", optional: null, empty: "" },
      },
      {
        value: "a",
        index: 4,
        groups: ["a", null, ""],
        namedGroups: { letter: "a", optional: null, empty: "" },
      },
    ]);
  });
});
