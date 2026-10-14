import { useRef, useState, type ReactNode } from "react";
import { type Mode } from "@/lib/regex";
import { exportPattern } from "@/lib/pattern-export";
import styles from "./pattern-details.module.css";

export function PatternCopy({
  pattern,
  flags,
  mode,
  children,
}: {
  pattern: string;
  flags: string;
  mode: Mode;
  children?: ReactNode;
}) {
  const [feedback, setFeedback] = useState<{
    key: string;
    message: string;
  } | null>(null);
  const regexOutput = useRef<HTMLDetailsElement>(null);
  const javascriptOutput = useRef<HTMLDetailsElement>(null);
  const key = JSON.stringify([pattern, flags, mode]);
  let output: ReturnType<typeof exportPattern> | undefined;
  try {
    output = exportPattern(pattern, flags, mode);
  } catch {}
  async function copy(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setFeedback({ key, message: `${label} copied.` });
    } catch {
      if (regexOutput.current) regexOutput.current.open = true;
      if (javascriptOutput.current) javascriptOutput.current.open = true;
      setFeedback({
        key,
        message:
          "Clipboard unavailable. Select the output below and copy it manually.",
      });
    }
  }
  return (
    <div
      className={styles.copy}
      role="region"
      aria-label="Copy current pattern"
    >
      {!output && (
        <p className={styles.error}>Fix the invalid pattern before copying.</p>
      )}
      <div className={styles.actions}>
        <button
          disabled={!output}
          onClick={() => output && copy(output.literal, "Regex")}
        >
          Copy regex
        </button>
        <button
          disabled={!output}
          onClick={() => output && copy(output.javascript, "JavaScript")}
        >
          Copy JavaScript
        </button>
      </div>
      <p aria-live="polite" className={styles.feedback}>
        {feedback?.key === key ? feedback.message : ""}
      </p>
      <details ref={regexOutput}>
        <summary>Exported regex</summary>
        <p className={styles.note}>
          {mode === "validate"
            ? "Whole-input export uses absolute boundaries and ignores global iteration, including with multiline enabled."
            : "The snippet finds every match with global enabled; otherwise it finds the first match."}{" "}
          Exported JavaScript runs in your environment; it has no playground
          worker deadline.
        </p>
        <label className={styles.label}>
          Effective regex
          <textarea
            aria-label="Effective regex"
            readOnly
            value={output?.literal ?? ""}
            rows={2}
          />
        </label>
      </details>
      <details ref={javascriptOutput}>
        <summary>JavaScript usage</summary>
        <label className={styles.label}>
          Copyable snippet
          <textarea
            aria-label="JavaScript snippet"
            readOnly
            value={output?.javascript ?? ""}
            rows={7}
          />
        </label>
      </details>
      {children}
    </div>
  );
}
