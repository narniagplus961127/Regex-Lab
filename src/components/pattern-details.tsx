import { explainPattern, type Mode } from "@/lib/regex";
import { type PatternExplanation } from "@/lib/pattern-export";
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
  const current =
    explanation?.pattern === pattern &&
    explanation.flags === flags &&
    explanation.mode === mode;

  return (
    <details className={styles.explanation}>
      <summary>Understand your pattern</summary>

      <section aria-label="Pattern explanation">
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

        <h3 className={styles.referenceHeading}>Syntax reference</h3>

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
      </section>
    </details>
  );
}
