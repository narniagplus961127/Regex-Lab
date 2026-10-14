import { evaluateRegex, type TestRequest } from "../lib/regex";

self.onmessage = (event: MessageEvent<TestRequest>) => {
  self.postMessage(evaluateRegex(event.data));
};
