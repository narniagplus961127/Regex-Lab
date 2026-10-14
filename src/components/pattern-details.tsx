import { useState } from "react";
import { explainPattern, type Mode } from "@/lib/regex";
import { exportPattern, type PatternExplanation } from "@/lib/pattern-export";
import styles from "./pattern-details.module.css";
export function PatternDetails({
  pattern,
  flags,
  mode,
  explanation,
}: {
  pattern: string;
  flags: string;
  mode: Mode;
  explanation?: PatternExplanation;
}) {
  const [feedback, setFeedback] = useState<{
    key: string;
    message: string;
  } | null>(null);
  const key = JSON.stringify([pattern, flags, mode]);
  let output: ReturnType<typeof exportPattern> | undefined;
  try {
    output = exportPattern(pattern, flags, mode);
  } catch {}
  const current =
    explanation?.pattern === pattern &&
    explanation.flags === flags &&
    explanation.mode === mode;
  async function copy(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setFeedback({ key, message: `${label} copied.` });
    } catch {
      setFeedback({
        key,
        message:
          "Clipboard unavailable. Select the output below and copy it manually.",
      });
    }
  }
  return (
    <section
      className={`panel ${styles.panel}`}
      aria-label="Explanation and copying"
    >
      <div className="panel-heading">
        <h2>Understand and copy</h2>
      </div>
      {current ? (
        <>
          <p className={styles.summary}>{explanation.summary}</p>
          {explanation.limitations?.map((item) => (
            <p className={styles.note} key={item}>
              {item}
            </p>
          ))}
        </>
      ) : (
        <p className={styles.note}>
          The pattern or settings changed. Use the current syntax reference
          below; the previous summary no longer applies.
        </p>
      )}
      <p className={styles.note}>
        Explanations help you read a pattern; passing your examples is still
        needed to check its behavior.
      </p>
      <details>
        <summary>Technical syntax reference</summary>
        <p className={styles.note}>
          This reference describes common tokens, not every JavaScript
          construct. Context, flags, and surrounding tokens can change their
          meaning.
        </p>
        <dl className={styles.tokens}>
          {explainPattern(pattern).map((part, index) => (
            <div key={index}>
              <dt>
                <code>{part.token}</code>
              </dt>
              <dd>{part.meaning}</dd>
            </div>
          ))}
        </dl>
      </details>
      <p className={styles.note}>
        {mode === "validate"
          ? "Whole-input export uses absolute boundaries and ignores global iteration, including with multiline enabled."
          : "The snippet finds every match with global enabled; otherwise it finds the first match."}{" "}
        Exported JavaScript runs in your environment; it has no playground
        worker deadline.
      </p>
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
      <label className={styles.label}>
        Effective regex
        <textarea
          aria-label="Effective regex"
          readOnly
          value={output?.literal ?? ""}
          rows={2}
        />
      </label>
      <details>
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
    </section>
  );
}
