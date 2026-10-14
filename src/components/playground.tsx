"use client";
import { useRef, useState } from "react";
import { FLAG_OPTIONS, type Mode, type Example } from "@/lib/regex";
import { useRegexTest } from "@/hooks/use-regex-test";
import { TestEditor } from "./test-editor";
import { MatchesView } from "./matches-view";
import { ExampleChecks } from "./example-checks";
import { GeneratorPanel } from "./generator-panel";
import { WorkbenchLayout } from "./workbench-layout";
import { PatternCopy } from "./pattern-copy";
import { PatternDetails } from "./pattern-details";
import { type PatternExplanation } from "@/lib/pattern-export";
export function Playground() {
  const patternInput = useRef<HTMLInputElement>(null);
  function focusEditor() {
    patternInput.current?.focus();
    patternInput.current?.scrollIntoView({ block: "center" });
  }
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
    <WorkbenchLayout
      focusEditor={focusEditor}
      onSelect={(preset) => {
        focusEditor();
        setPattern(preset.pattern);
        setFlags(preset.flags);
        setMode(preset.mode);
        setText(preset.text);
        setExamples(preset.examples.map((example) => ({ ...example })));
        setExplanation({
          pattern: preset.pattern,
          flags: preset.flags,
          mode: preset.mode,
          summary: preset.explanation,
          limitations: preset.limitations,
        });
      }}
    >
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
        <div className="workbench" id="workbench">
          <GeneratorPanel
            mode={mode}
            flags={flags}
            examples={examples}
            onGenerated={(generated, intent) => {
              setPattern(generated.pattern);
              setFlags(generated.flags);
              setMode(intent);
              setExplanation({
                pattern: generated.pattern,
                flags: generated.flags,
                mode: intent,
                summary: generated.explanation,
                limitations: generated.limitations,
              });
            }}
          />{" "}
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
                  ref={patternInput}
                  aria-invalid={Boolean(result.error)}
                  aria-describedby={result.error ? "pattern-error" : undefined}
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
              <PatternCopy pattern={pattern} flags={flags} mode={mode}>
                <PatternDetails
                  pattern={pattern}
                  flags={flags}
                  mode={mode}
                  explanation={explanation}
                />
              </PatternCopy>
            </section>
            <TestEditor
              text={text}
              onChange={setText}
              result={result}
              testing={testing}
            />
            <MatchesView result={result} testing={testing} />
            <ExampleChecks
              examples={examples}
              onChange={setExamples}
              result={result}
              testing={testing}
            />
          </div>
        </div>
      </div>
    </WorkbenchLayout>
  );
}
