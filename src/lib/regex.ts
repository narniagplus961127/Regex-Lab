export type Mode = "find" | "validate";
export type Example = { id: string; text: string; shouldMatch: boolean };
export type RegexMatch = { value: string; index: number; groups: (string | null)[]; namedGroups: Record<string, string | null> };
export type TestRequest = { pattern: string; flags: string; mode: Mode; text: string; examples: Example[] };
export type TestResult = { matches: RegexMatch[]; examples: { id: string; passed: boolean; matched: boolean }[]; elapsed: number; truncated: boolean; error?: string };

export const FLAG_OPTIONS = [
  { flag: "g", name: "Global", description: "Find every match, instead of just the first." },
  { flag: "i", name: "Ignore case", description: "Treat uppercase and lowercase letters alike." },
  { flag: "m", name: "Multiline", description: "Allow ^ and $ to match line boundaries." },
  { flag: "s", name: "Dot all", description: "Allow a dot to match newline characters." },
  { flag: "u", name: "Unicode", description: "Interpret Unicode characters and escapes." },
] as const;

export function validatePattern(pattern: string, flags: string) {
  if (pattern.length > 2000) throw new Error("Keep patterns under 2,000 characters.");
  if (!/^(?!.*(.).*\1)[gimsu]*$/.test(flags)) throw new Error("Use each supported flag only once: g, i, m, s, u.");
  try { new RegExp(pattern, flags); } catch (error) {
    throw new Error(`${error instanceof Error ? error.message : "Invalid pattern"}. Check brackets, groups, and escaped characters.`);
  }
}

function makeRegex(pattern: string, flags: string, mode: Mode) {
  // The end assertion is strict even with multiline mode or a trailing newline.
  return new RegExp(mode === "validate" ? `^(?:${pattern})(?![\\s\\S])` : pattern, mode === "validate" ? flags.replace("g", "") : flags);
}

export function evaluateRegex(request: TestRequest): TestResult {
  const start = performance.now();
  const { pattern, flags, mode, text, examples } = request;
  try {
    validatePattern(pattern, flags);
    if (text.length > 30000 || examples.length > 20 || examples.some(e => e.text.length > 1000)) throw new Error("Test text is limited to 30,000 characters and 20 examples of 1,000 characters each.");
    const regex = makeRegex(pattern, flags, mode);
    const matches: RegexMatch[] = [];
    let match: RegExpExecArray | null;
    let truncated = false;
    while ((match = regex.exec(text)) !== null) {
      if (mode === "validate" && (match.index !== 0 || match[0].length !== text.length)) break;
      matches.push({ value: match[0], index: match.index, groups: match.slice(1).map(v => v ?? null), namedGroups: Object.fromEntries(Object.entries(match.groups ?? {}).map(([k, v]) => [k, v ?? null])) });
      if (!regex.global) break;
      if (matches.length === 500) { truncated = true; break; }
      // Empty matches must advance by a code point in Unicode mode.
      if (match[0] === "") {
        const codePoint = text.codePointAt(regex.lastIndex);
        regex.lastIndex += regex.unicode && codePoint !== undefined && codePoint > 0xffff ? 2 : 1;
      }
    }
    const exampleResults = examples.map(example => {
      const candidate = makeRegex(pattern, flags, mode).exec(example.text);
      const matched = candidate !== null && (mode === "find" || (candidate.index === 0 && candidate[0].length === example.text.length));
      return { id: example.id, matched, passed: matched === example.shouldMatch };
    });
    return { matches, examples: exampleResults, elapsed: performance.now() - start, truncated };
  } catch (error) {
    return { matches: [], examples: [], elapsed: performance.now() - start, truncated: false, error: error instanceof Error ? error.message : "Unable to test this pattern." };
  }
}

export function regexLiteral(pattern: string, flags: string) {
  // RegExp.source safely escapes literal slashes and line breaks for copy/paste.
  return `/${new RegExp(pattern, flags).source}/${flags}`;
}

export type PatternPart = { token: string; meaning: string };
export function explainPattern(pattern: string): PatternPart[] {
  const parts: PatternPart[] = [];
  const tokens = pattern.match(/\[(?:\\.|[^\]\\])*\]|\\[pP]\{[^}]+\}|\\.|\(\?<[^>]+>|\(\?[=:!]|\(\?<[=!]|\(\?:|\{\d+(?:,\d*)?\}[?]?|[+*?][?]?|[()^$.|]|[^\\[()^$.|+*?{}]+|./g) ?? [];
  const meanings: Record<string, string> = { "^": "Start of the input (or line with m).", "$": "End of the input (or line with m).", "\\d": "A digit from 0 to 9.", "\\D": "A character that is not a digit.", "\\w": "A word character: letters, digits, or underscore.", "\\W": "A non-word character.", "\\s": "A whitespace character, including spaces and newlines.", "\\S": "A character that is not whitespace.", "\\b": "A boundary between a word and non-word character.", "\\B": "A position that is not a word boundary.", ".": "Any character except a newline (includes newlines with s).", "+": "Repeat the preceding element one or more times.", "*": "Repeat the preceding element zero or more times.", "?": "Make the preceding element optional, or modify a preceding expression.", "(": "Start a capture group.", ")": "End the current group.", "(?:": "Start a group without capturing its value.", "(?=": "Require the following expression, without consuming it.", "(?!": "Reject the following expression, without consuming it.", "(?<=": "Require the preceding expression, without consuming it.", "(?<!": "Reject the preceding expression, without consuming it.", "|": "Choose between alternatives.", "\\n": "A newline character.", "\\t": "A tab character." };
  for (const token of tokens) {
    let meaning = meanings[token];
    if (!meaning && token.startsWith("[")) meaning = token.startsWith("[^") ? "One character outside this character set." : "One character from this character set.";
    if (!meaning && token.startsWith("{")) meaning = `Repeat the preceding element ${token.replace(/[{}?]/g, "").replace(",", " to ")} times${token.endsWith("?") ? ", taking as few as possible" : ""}.`;
    if (!meaning && /^[+*?]\?$/.test(token)) meaning = `${meanings[token[0]]} Prefer fewer repetitions.`;
    if (!meaning && token.startsWith("(?<")) meaning = `Start a capture group named ${token.slice(3, -1)}.`;
    if (!meaning && /^\\[1-9]$/.test(token)) meaning = `Match the text captured by group ${token.slice(1)}.`;
    if (!meaning && /^\\[pP]/.test(token)) meaning = "Match a Unicode property (requires Unicode mode).";
    if (!meaning && token.startsWith("\\")) meaning = "An escaped character or special escape sequence.";
    if (!meaning) meaning = `Literal text: ${JSON.stringify(token)}.`;
    parts.push({ token, meaning });
  }
  return parts;
}
