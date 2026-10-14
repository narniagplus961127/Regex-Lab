"use client";
import { useState } from "react";
import { Braces, FlaskConical, ShieldCheck, Terminal } from "lucide-react";
import { FLAG_OPTIONS, type Mode, type Example } from "@/lib/regex";
import { useRegexTest } from "@/hooks/use-regex-test";
import { TestEditor } from "./test-editor";
import { MatchesView } from "./matches-view";
import { ExampleChecks } from "./example-checks";
import { PatternDetails } from "./pattern-details";
import { type PatternExplanation } from "@/lib/pattern-export";
export function Playground() {
  const [pattern, setPattern] = useState(
    "\\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}\\b",
  );
  const [explanation, setExplanation] = useState<PatternExplanation>({
    pattern: "\\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}\\b",
    flags: "gi",
    mode: "find",
    summary: "Finds email-like addresses in text, ignoring letter case.",
    limitations: [
      "This practical example does not prove an address exists or cover every valid email format.",
    ],
  });
  const [examples, setExamples] = useState<Example[]>([]);
  const [mode, setMode] = useState<Mode>("find");
  const [flags, setFlags] = useState("gi");
  const [text, setText] = useState(
    "Reach us at hello@example.com\nOr contact team@regexlab.dev",
  );
  const { result, testing } = useRegexTest({
    pattern,
    flags,
    text,
    mode,
    examples,
  });
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="/">
          <span className="brand-symbol">
            <Braces />
          </span>
          Regex<span>Lab</span>
          <small>BETA</small>
        </a>
        <p className="sidebar-label">WORKSPACE</p>
        <div className="nav-active">
          <FlaskConical size={18} /> Playground <span>●</span>
        </div>
        <div className="sidebar-bottom">
          <ShieldCheck size={20} />
          <strong>Private by default</strong>
          <p>Your test text stays in this browser.</p>
        </div>
      </aside>
      <main>
        <header className="topbar">
          <span>WORKSPACE / PLAYGROUND</span>
          <span>
            <span className="status-dot" /> JavaScript engine
          </span>
        </header>
        <div className="workspace">
          <div className="page-heading">
            <div className="eyebrow">A LITTLE LESS GUESSWORK.</div>
            <h1>
              Make every character <em>count.</em>
            </h1>
            <p>
              Write a pattern. Test your text. Find exactly what you’re looking
              for.
            </p>
          </div>
          <div className="workbench">
            <section className="intro-card">
              <span className="intro-icon">
                <Braces size={28} />
              </span>
              <h2>
                Your pattern,
                <br />
                in plain sight.
              </h2>
              <p>
                Explore matches as you type. The playground runs locally, so you
                can experiment without an account.
              </p>
              <div className="intro-facts">
                <span>JavaScript regular expressions</span>
                <span>Live matching, isolated worker</span>
                <span>No API key needed for testing</span>
              </div>
            </section>
            <div className="editor-column">
              <section className="panel pattern-panel">
                <div className="panel-heading">
                  <h2>
                    <span className="number-label">01</span>Regular expression
                  </h2>
                  <span className="engine-label">JAVASCRIPT</span>
                </div>
                <div
                  className={`regex-input-shell ${result.error ? "has-error" : ""}`}
                >
                  <span>/</span>
                  <input
                    aria-label="Regular expression"
                    spellCheck={false}
                    autoComplete="off"
                    value={pattern}
                    onChange={(e) => setPattern(e.target.value)}
                    placeholder="Enter a regex pattern"
                  />
                  <span>/</span>
                  <code>{flags || "—"}</code>
                </div>
                <div
                  className="intent-row"
                  role="group"
                  aria-label="Matching intent"
                >
                  <button
                    className={`flag-button ${mode === "find" ? "on" : ""}`}
                    aria-pressed={mode === "find"}
                    onClick={() => setMode("find")}
                  >
                    Find matches in text
                  </button>
                  <button
                    className={`flag-button ${mode === "validate" ? "on" : ""}`}
                    aria-pressed={mode === "validate"}
                    onClick={() => setMode("validate")}
                  >
                    Validate entire input
                  </button>
                </div>
                <div className="flags-row">
                  <span>Flags</span>
                  {FLAG_OPTIONS.map((option) => (
                    <button
                      key={option.flag}
                      className={`flag-button ${flags.includes(option.flag) ? "on" : ""}`}
                      aria-pressed={flags.includes(option.flag)}
                      title={option.description}
                      onClick={() =>
                        setFlags(
                          FLAG_OPTIONS.filter((o) =>
                            o.flag === option.flag
                              ? !flags.includes(o.flag)
                              : flags.includes(o.flag),
                          )
                            .map((o) => o.flag)
                            .join(""),
                        )
                      }
                    >
                      <code>{option.flag}</code>
                      {option.name}
                    </button>
                  ))}
                </div>
                <p className="limit-note">
                  {mode === "validate"
                    ? "Global iteration is ignored in validation mode."
                    : "Pattern limit: 2,000 characters. Enable global to find every match."}
                </p>
              </section>
              <TestEditor
                text={text}
                onChange={setText}
                result={result}
                testing={testing}
              />
              <MatchesView result={result} testing={testing} />
              <PatternDetails
                pattern={pattern}
                flags={flags}
                mode={mode}
                explanation={explanation}
              />
              <ExampleChecks
                examples={examples}
                onChange={setExamples}
                result={result}
                testing={testing}
              />
            </div>
          </div>
          <footer>
            <span>
              <Terminal size={14} /> A small tool for better patterns.
            </span>
            <span>Made to match.</span>
          </footer>
        </div>
      </main>
    </div>
  );
}
