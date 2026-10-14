"use client";
import { useEffect, useRef, useState } from "react";
import type { TestRequest, TestResult } from "@/lib/regex";
const empty: TestResult = {
  matches: [],
  examples: [],
  elapsed: 0,
  truncated: false,
};
export function useRegexTest(request: TestRequest) {
  const [state, setState] = useState<{
    key: string;
    result: TestResult;
    testing: boolean;
  }>({ key: "", result: empty, testing: true });
  const sequence = useRef(0);
  const key = JSON.stringify(request);
  useEffect(() => {
    const id = ++sequence.current;
    let active = true;
    let worker: Worker | undefined;
    let deadline: ReturnType<typeof setTimeout> | undefined;
    const complete = (result: TestResult) => {
      if (!active || id !== sequence.current) return;
      clearTimeout(deadline);
      worker?.terminate();
      setState({ key, result, testing: false });
    };
    const delay = setTimeout(() => {
      try {
        worker = new Worker(
          new URL("../workers/regex.worker.ts", import.meta.url),
        );
        deadline = setTimeout(
          () =>
            complete({
              ...empty,
              error:
                "This pattern took too long. Simplify nested repetitions or use shorter test text, then try again.",
            }),
          1500,
        );
        worker.onmessage = (event: MessageEvent<TestResult>) =>
          complete(event.data);
        worker.onerror = () =>
          complete({
            ...empty,
            error:
              "The testing worker could not start. Edit your input to retry, or reload the page.",
          });
        worker.postMessage(JSON.parse(key));
      } catch {
        complete({
          ...empty,
          error:
            "Your browser could not start a testing worker. Reload the page to retry.",
        });
      }
    }, 160);
    return () => {
      active = false;
      ++sequence.current;
      clearTimeout(delay);
      clearTimeout(deadline);
      worker?.terminate();
    };
  }, [key]);
  return state.key === key ? state : { result: empty, testing: true };
}
