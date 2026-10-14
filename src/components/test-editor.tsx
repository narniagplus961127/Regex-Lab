"use client";

import { useRef, type ReactNode } from "react";
import { LockKeyhole, Trash2 } from "lucide-react";
import type { TestResult } from "@/lib/regex";

export function TestEditor({
  text,
  onChange,
  result,
  testing,
}: {
  text: string;
  onChange: (value: string) => void;
  result: TestResult;
  testing: boolean;
}) {
  const overlay = useRef<HTMLPreElement>(null);
  const highlighted: ReactNode[] = [];
  let end = 0;

  result.matches.forEach((match, index) => {
    highlighted.push(text.slice(end, match.index));

    highlighted.push(
      match.value ? (
        <mark key={index} title={`Match ${index + 1}`}>
          {match.value}
        </mark>
      ) : (
        <span key={index} className="empty-match" title="Zero-length match" />
      ),
    );

    end = match.index + match.value.length;
  });

  highlighted.push(text.slice(end));

  return (
    <section className="panel test-panel" aria-label="Live text playground">
      <div className="panel-heading">
        <h2>
          <span className="number-label">02</span>Test your text{" "}
          <span className="live-badge">● LIVE</span>
        </h2>

        <button
          className="text-button"
          onClick={() => onChange("")}
          disabled={!text}
        >
          <Trash2 size={14} /> Clear
        </button>
      </div>

      <div className="test-toolbar">
        <span>PLAYGROUND</span>
        <span>
          <LockKeyhole size={12} /> Runs in your browser
        </span>
      </div>

      <div className="text-layer">
        <pre ref={overlay} className="highlight-overlay" aria-hidden="true">
          {highlighted}

          {"\n"}
        </pre>

        <textarea
          aria-label="Playground test text"
          value={text}
          onChange={(e) => onChange(e.target.value)}
          onScroll={(e) => {
            if (overlay.current) {
              overlay.current.scrollTop = e.currentTarget.scrollTop;
              overlay.current.scrollLeft = e.currentTarget.scrollLeft;
            }
          }}
          spellCheck={false}
          wrap="off"
          placeholder="Paste or type your test text here…"
        />
      </div>

      <div
        className={`test-status ${result.error ? "status-error" : ""}`}
        role="status"
        aria-live="polite"
      >
        <span>
          {testing
            ? "Testing…"
            : result.error
              ? "Pattern needs attention"
              : `${result.matches.length}${result.truncated ? "+" : ""} ${result.matches.length === 1 ? "match" : "matches"} found`}
        </span>
        <span>{text.length.toLocaleString()} / 30,000 characters</span>
      </div>

      {result.error && (
        <p className="error-box" role="alert" id="pattern-error">
          {result.error}
        </p>
      )}

      {result.truncated && (
        <p className="limit-note">
          Showing the first 500 matches. More matches exist; this is not the
          complete count.
        </p>
      )}

      <p className="limit-note">
        Empty matches mark a position. Tests stop after 1.5 seconds.
      </p>
    </section>
  );
}
