import { describe, it, expect } from "vitest";
import { exportPattern } from "../src/lib/pattern-export";
import { evaluateRegex, explainPattern, type Mode } from "../src/lib/regex";
describe("copied patterns reproduce playground behavior", () => {
  it.each([
    ["cat|dog", "gm", "validate", "x\ndog", false],
    ["cat|dog", "gm", "validate", "dog", true],
    ["dog$", "m", "validate", "dog\n", false],
    ["a/b\\n\\\\", "g", "find", "a/b\n\\", true],
    ["", "g", "validate", "", true],
    ["", "g", "validate", "x", false],
    ["😀", "gu", "find", "x😀", true],
    ["[\\s\\S]*", "gm", "validate", "a\nb", true],
  ] as const)(
    "exports %s for %s %s against %j",
    (pattern, flags, mode, text, expected) => {
      const exported = exportPattern(pattern, flags, mode);
      const regex = Function(`return (${exported.literal})`)() as RegExp;
      expect(regex.test(text)).toBe(expected);
      expect(
        evaluateRegex({ pattern, flags, mode, text, examples: [] }).matches
          .length > 0,
      ).toBe(expected);
      const snippet = exported.javascript.replace(
        '"Replace with your text"',
        JSON.stringify(text),
      );
      const result = Function(
        `${snippet.replace("console.log(valid);", "").replace("console.log(matches);", "").replace("console.log(match);", "")}\nreturn ${mode === "validate" ? "valid" : flags.includes("g") ? "matches.length>0" : "match!==null"};`,
      )();
      expect(result).toBe(expected);
    },
  );
  it("does not turn invalid patterns into exports", () => {
    expect(() => exportPattern("[", "g", "find")).toThrow();
  });
});
it("keeps complex escapes together and identifies contextual caveats", () => {
  const parts = explainPattern("\\x41\\u0042\\12\\k<name>\\p{Letter}");
  expect(parts.map((part) => part.token)).toEqual([
    "\\x41",
    "\\u0042",
    "\\12",
    "\\k<name>",
    "\\p{Letter}",
  ]);
  expect(parts.find((part) => part.token === "\\12")?.meaning).toContain(
    "context",
  );
  expect(explainPattern("a{2,}")[1].meaning).toContain("at least 2");
});
it("copied global usage preserves match positions, captures, and empty Unicode matches", () => {
  const { javascript } = exportPattern("(?<letter>a)(b)?", "g", "find");
  const matches = Function(
    `${javascript.replace('"Replace with your text"', '"xxa ab"').replace("console.log(matches);", "")} return matches.map(match => ({index:match.index, value:match[0], letter:match.groups.letter, optional:match[2]??null}));`,
  )();
  expect(matches).toEqual([
    { index: 2, value: "a", letter: "a", optional: null },
    { index: 4, value: "ab", letter: "a", optional: "b" },
  ]);
  const empty = exportPattern("", "gu", "find");
  const positions = Function(
    `${empty.javascript.replace('"Replace with your text"', '"😀"').replace("console.log(matches);", "")} return matches.map(match=>match.index);`,
  )();
  expect(positions).toEqual([0, 2]);
});
it("serializes literal line breaks safely for executable JavaScript", () => {
  const output = exportPattern("a/b\n\\\\\r", "g", "find");
  const regex = Function(`return (${output.literal})`)() as RegExp;
  expect(regex.test("a/b\n\\\r")).toBe(true);
  expect(output.literal).not.toContain("\n");
  expect(output.literal).not.toContain("\r");
});
it.each([
  [
    "(?<=a)b>c",
    "(?<=",
    "Require the preceding expression, without consuming it.",
  ],
  [
    "(?<!a)b>c",
    "(?<!",
    "Reject the preceding expression, without consuming it.",
  ],
])(
  "explains lookbehind without consuming subsequent literal text: %s",
  (pattern, opener, meaning) => {
    expect(explainPattern(pattern)).toEqual([
      { token: opener, meaning },
      { token: "a", meaning: 'Literal text: "a".' },
      { token: ")", meaning: "End the current group." },
      { token: "b>c", meaning: 'Literal text: "b>c".' },
    ]);
  },
);
it("preserves named capture explanations beside lookbehind and literal greater-than text", () => {
  expect(explainPattern("(?<=a)(?<letter>b)>c")).toEqual([
    {
      token: "(?<=",
      meaning: "Require the preceding expression, without consuming it.",
    },
    { token: "a", meaning: 'Literal text: "a".' },
    { token: ")", meaning: "End the current group." },
    { token: "(?<letter>", meaning: "Start a capture group named letter." },
    { token: "b", meaning: 'Literal text: "b".' },
    { token: ")", meaning: "End the current group." },
    { token: ">c", meaning: 'Literal text: ">c".' },
  ]);
});
