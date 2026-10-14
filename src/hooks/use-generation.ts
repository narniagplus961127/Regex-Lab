import { useEffect, useRef, useState } from "react";
import { validatePattern, type Mode, type Example } from "@/lib/regex";
export type GeneratedPattern = {
  pattern: string;
  flags: string;
  explanation: string;
  limitations: string[];
};
export function useGeneration() {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const controller = useRef<AbortController | null>(null);
  useEffect(() => {
    const status = new AbortController();
    fetch("/api/generate", { signal: status.signal })
      .then((response) => response.json())
      .then((result) => {
        if (!status.signal.aborted) setConfigured(result.configured === true);
      })
      .catch(() => {
        if (!status.signal.aborted)
          setError(
            "Could not check AI availability. You can still try generation.",
          );
      });
    return () => {
      status.abort();
      controller.current?.abort();
      controller.current = null;
    };
  }, []);
  async function generate(
    input: {
      description: string;
      mode: Mode;
      flags: string;
      examples: Pick<Example, "text" | "shouldMatch">[];
    },
    apply: (result: GeneratedPattern) => void,
  ) {
    if (controller.current) return;
    const current = new AbortController();
    controller.current = current;
    setBusy(true);
    setError("");
    const timer = setTimeout(() => current.abort("timeout"), 25000);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
        signal: current.signal,
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          typeof result.error === "string"
            ? result.error
            : "Generation is unavailable. Try again.",
        );
      if (
        typeof result.pattern !== "string" ||
        !result.pattern ||
        typeof result.flags !== "string" ||
        typeof result.explanation !== "string" ||
        result.explanation.length > 4000 ||
        !Array.isArray(result.limitations) ||
        result.limitations.length > 8 ||
        !result.limitations.every(
          (item: unknown) => typeof item === "string" && item.length <= 500,
        )
      )
        throw new Error("AI returned an unusable pattern. Try again.");
      validatePattern(result.pattern, result.flags);
      if (current.signal.aborted || controller.current !== current) return;
      apply(result);
    } catch (error) {
      if (controller.current === current)
        setError(
          current.signal.aborted
            ? current.signal.reason === "timeout"
              ? "Generation timed out. Try again; your current pattern is unchanged."
              : "Generation cancelled. Your current pattern is unchanged."
            : error instanceof Error && !(error instanceof TypeError)
              ? error.message
              : "Could not connect to generation. Check your connection and try again.",
        );
    } finally {
      clearTimeout(timer);
      if (controller.current === current) {
        controller.current = null;
        setBusy(false);
      }
    }
  }
  function cancel() {
    controller.current?.abort();
  }
  return { configured, busy, error, generate, cancel };
}
