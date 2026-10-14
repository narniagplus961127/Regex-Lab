import { useState } from "react";
import { Sparkles } from "lucide-react";
import { useGeneration, type GeneratedPattern } from "@/hooks/use-generation";
import { type Mode, type Example } from "@/lib/regex";
import styles from "./generator-panel.module.css";

export function GeneratorPanel({
  mode,
  flags,
  examples,
  onGenerated,
}: {
  mode: Mode;
  flags: string;
  examples: Example[];
  onGenerated: (result: GeneratedPattern, mode: Mode) => void;
}) {
  const [generated, setGenerated] = useState(false);
  const [description, setDescription] = useState("");
  const { configured, busy, error, generate, cancel } = useGeneration();

  return (
    <section
      className={`panel ${styles.panel}`}
      aria-label="AI pattern generator"
    >
      <div className="panel-heading">
        <h2>
          <Sparkles size={18} /> AI regex generator
        </h2>
      </div>

      <label htmlFor="description" className={styles.label}>
        Describe your pattern
      </label>

      <textarea
        id="description"
        rows={3}
        maxLength={2000}
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="Find order numbers starting with ORD followed by six digits"
      />

      <p className={styles.note}>
        {description.length}/2,000 characters ·{" "}
        {mode === "find" ? "Find matches" : "Validate entire input"} · Flags:{" "}
        <code>
          {mode === "validate"
            ? flags.replace("g", "") || "none"
            : flags || "none"}
        </code>
      </p>

      <p className={styles.privacy}>
        Current example checks are sent to Groq when you click Generate regex,
        together with your description, matching intent, and flags. Playground
        test text stays in your browser.
      </p>

      {configured === false && (
        <div className={styles.setup}>
          <p>AI is not configured. Presets and local testing still work.</p>

          <details>
            <summary>Owner setup</summary>

            <p>
              Add GROQ_API_KEY to .env.local locally, or the server environment
              on Vercel, then restart.
            </p>
          </details>
        </div>
      )}

      <div className={styles.actions}>
        <button
          className={styles.generate}
          disabled={busy || !description.trim() || configured === false}
          onClick={() => {
            setGenerated(false);

            void generate(
              {
                description,
                mode,
                flags,
                examples: examples.map(({ text, shouldMatch }) => ({
                  text,
                  shouldMatch,
                })),
              },
              (result) => {
                onGenerated(result, mode);
                setGenerated(true);
              },
            );
          }}
        >
          <Sparkles size={16} />

          {busy ? "Generating…" : "Generate regex"}
        </button>

        {busy && <button onClick={cancel}>Cancel generation</button>}
      </div>

      <p aria-live="polite" role="status" className={styles.note}>
        {busy
          ? "Generating a pattern…"
          : generated && !error
            ? "Pattern generated. Test it in the playground."
            : ""}
      </p>

      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}

      <p className={styles.note}>
        AI patterns can be wrong. Inspect the explanation and test your examples
        before using a pattern.
      </p>
    </section>
  );
}
