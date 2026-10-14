import { effectiveRegex, type Mode } from "./regex";
export type PatternExplanation = {
  pattern: string;
  flags: string;
  mode: Mode;
  summary: string;
  limitations?: string[];
};
export function exportPattern(pattern: string, flags: string, mode: Mode) {
  const regex = effectiveRegex(pattern, flags, mode);
  const literal = regex.toString();
  const javascript =
    mode === "validate"
      ? `const regex = ${literal};\nconst input = "Replace with your text";\nconst valid = regex.test(input);\nconsole.log(valid);`
      : regex.global
        ? `const regex = ${literal};\nconst input = "Replace with your text";\nconst matches = Array.from(input.matchAll(regex));\nconsole.log(matches);`
        : `const regex = ${literal};\nconst input = "Replace with your text";\nconst match = regex.exec(input);\nconsole.log(match);`;
  return { literal, javascript };
}
