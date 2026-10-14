import type { Example, TestResult } from "@/lib/regex";
import styles from "./example-checks.module.css";

export function ExampleChecks({
  examples,
  onChange,
  result,
  testing,
}: {
  examples: Example[];
  onChange: (examples: Example[]) => void;
  result: TestResult;
  testing: boolean;
}) {
  const outcomes = new Map(
    result.examples.map((example) => [example.id, example]),
  );
  const completed =
    !testing && !result.error && result.examples.length === examples.length;
  const passing = result.examples.filter((example) => example.passed).length;
  const addExample = (shouldMatch: boolean) =>
    onChange([...examples, { id: crypto.randomUUID(), text: "", shouldMatch }]);
  return (
    <section className="panel" aria-label="Example checks">
      <div className="panel-heading">
        <h2>
          <span className="number-label">04</span>Example checks
        </h2>
      </div>
      <p className="limit-note">
        Tell the pattern what should match and what should fail. Empty input is
        a valid example. Checks run in your browser; their text and expected
        outcomes are sent to Groq only when you click Generate regex.
      </p>
      <div className={styles.actions}>
        <button
          className="flag-button"
          onClick={() => addExample(true)}
          disabled={examples.length >= 20}
        >
          Add should match
        </button>
        <button
          className="flag-button"
          onClick={() => addExample(false)}
          disabled={examples.length >= 20}
        >
          Add should not match
        </button>
      </div>
      <p className={styles.summary} aria-live="polite">
        {examples.length === 0
          ? "No example checks yet."
          : testing
            ? "Checking examples…"
            : !completed
              ? "Checks unavailable — fix the pattern or shorten the input."
              : `${passing} / ${examples.length} checks passing`}
      </p>
      <div className={styles.examples}>
        {examples.map((example, index) => {
          const outcome = completed ? outcomes.get(example.id) : undefined;
          return (
            <div className={styles.example} key={example.id}>
              <div className={styles.heading}>
                <label>
                  Expected:{" "}
                  <select
                    aria-label={`Example ${index + 1} expected outcome`}
                    value={example.shouldMatch ? "match" : "no-match"}
                    onChange={(event) =>
                      onChange(
                        examples.map((item) =>
                          item.id === example.id
                            ? {
                                ...item,
                                shouldMatch: event.target.value === "match",
                              }
                            : item,
                        ),
                      )
                    }
                  >
                    <option value="match">Should match</option>
                    <option value="no-match">Should not match</option>
                  </select>
                </label>
                <button
                  className="text-button"
                  aria-label={`Remove example ${index + 1}`}
                  onClick={() =>
                    onChange(examples.filter((item) => item.id !== example.id))
                  }
                >
                  Remove
                </button>
              </div>
              <textarea
                aria-label={`Example ${index + 1} text`}
                value={example.text}
                maxLength={1000}
                placeholder="Empty input"
                spellCheck={false}
                onChange={(event) =>
                  onChange(
                    examples.map((item) =>
                      item.id === example.id
                        ? { ...item, text: event.target.value }
                        : item,
                    ),
                  )
                }
              />
              <div className={styles.outcome}>
                <span>
                  {outcome
                    ? `Actual: ${outcome.matched ? "Match" : "No match"}`
                    : testing
                      ? "Actual: Pending"
                      : "Actual: Unavailable"}
                </span>
                {outcome && (
                  <strong
                    className={outcome.passed ? styles.pass : styles.fail}
                  >
                    {outcome.passed ? "Pass" : "Fail"}
                  </strong>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <p className="limit-note">
        Up to 20 examples, 1,000 characters each. The same 1.5-second testing
        deadline protects all checks.
      </p>
    </section>
  );
}
