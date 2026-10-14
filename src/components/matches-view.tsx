import type { TestResult } from "@/lib/regex";
import styles from "./match-details.module.css";

function captureValue(value: string | null) {
  return value === null
    ? "Unmatched"
    : value === ""
      ? "Empty string"
      : JSON.stringify(value);
}

export function MatchesView({
  result,
  testing,
}: {
  result: TestResult;
  testing: boolean;
}) {
  return (
    <section className="panel" aria-label="Match details">
      <div className="panel-heading">
        <h2>
          <span className="number-label">03</span>Match details
        </h2>
      </div>

      <p className="limit-note">
        Positions start at 0 and count JavaScript UTF-16 units. End positions
        are exclusive.
      </p>

      {testing || result.error || result.matches.length === 0 ? (
        <p className="limit-note">
          {testing
            ? "Waiting for the current pattern…"
            : result.error
              ? "Fix the pattern to inspect captures."
              : "No matches to inspect."}
        </p>
      ) : (
        <div className={styles.matches}>
          {result.matches.map((match, index) => (
            <details key={index} open={index === 0} className={styles.match}>
              <summary>
                Match {index + 1}{" "}
                <span>
                  Start {match.index} · End {match.index + match.value.length}
                </span>
              </summary>
              <code className={styles.value}>{captureValue(match.value)}</code>
              {match.groups.length > 0 ? (
                <ul>
                  {match.groups.map((value, group) => (
                    <li key={group}>
                      Group {group + 1}: {captureValue(value)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No capture groups in this match.</p>
              )}

              {Object.keys(match.namedGroups).length > 0 && (
                <>
                  <h3>Named captures</h3>

                  <ul>
                    {Object.entries(match.namedGroups).map(([name, value]) => (
                      <li key={name}>
                        {name}: {captureValue(value)}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </details>
          ))}
        </div>
      )}
    </section>
  );
}
