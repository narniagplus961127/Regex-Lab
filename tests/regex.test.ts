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
