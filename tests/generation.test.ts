import { afterEach, expect, test, vi } from "vitest";
import { GET, POST } from "../src/app/api/generate/route";
afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});
test("local testing can discover setup without exposing credentials", async () => {
  vi.stubEnv("GROQ_API_KEY", "");
  expect(await (await GET()).json()).toEqual({ configured: false });
  const response = await POST(
    new Request("http://localhost/api/generate", {
      method: "POST",
      body: JSON.stringify({
        description: "Numbers",
        mode: "find",
        flags: "g",
      }),
    }),
  );
  expect(response.status).toBe(503);
  expect(await response.json()).toEqual({
    error:
      "AI generation is not configured. The owner must set GROQ_API_KEY; local testing still works.",
  });
});
test("description generates a validated pattern through the real provider transport", async () => {
  vi.stubEnv("GROQ_API_KEY", "test-secret-not-real");
  const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValue(
    Response.json({
      id: "fixture",
      object: "chat.completion",
      created: 1,
      model: "openai/gpt-oss-20b",
      choices: [
        {
          index: 0,
          finish_reason: "stop",
          message: {
            role: "assistant",
            content: JSON.stringify({
              pattern: "[0-9]+",
              flags: "gi",
              explanation: "Finds digits.",
              limitations: ["ASCII digits only."],
            }),
          },
        },
      ],
      usage: { prompt_tokens: 10, completion_tokens: 10, total_tokens: 20 },
    }),
  );
  const response = await POST(
    new Request("http://localhost/api/generate", {
      method: "POST",
      body: JSON.stringify({
        description: "Find numbers",
        mode: "validate",
        flags: "gi",
      }),
    }),
  );
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({
    pattern: "[0-9]+",
    flags: "i",
    explanation: "Finds digits.",
    limitations: ["ASCII digits only."],
  });
  const body = String(fetch.mock.calls[0][1]?.body);
  expect(body).toContain("Find numbers");
  expect(body).toContain('"strict":true');
  expect(body).not.toContain("hello@example.com");
});

test("invalid and oversized request bodies are rejected before provider access", async () => {
  vi.stubEnv("GROQ_API_KEY", "test-secret-not-real");
  const fetch = vi.spyOn(globalThis, "fetch");
  for (const body of [
    JSON.stringify({
      description: "Digits",
      flags: "g",
      mode: "find",
      text: "private",
    }),
    "{",
  ]) {
    const response = await POST(
      new Request("http://localhost/api/generate", { method: "POST", body }),
    );
    expect(response.status).toBe(400);
  }
  const bytes = new TextEncoder().encode("x".repeat(14000));
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(bytes);
      controller.close();
    },
  });
  const response = await POST(
    new Request("http://localhost/api/generate", {
      method: "POST",
      body: stream,
      duplex: "half",
    } as RequestInit),
  );
  expect(response.status).toBe(413);
  expect(fetch).not.toHaveBeenCalled();
});
test("provider quota errors are safe and no retries spend extra quota", async () => {
  vi.stubEnv("GROQ_API_KEY", "test-secret-not-real");
  const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValue(
    Response.json(
      {
        error: {
          message: "secret test-secret-not-real",
          type: "rate_limit_error",
        },
      },
      { status: 429 },
    ),
  );
  const response = await POST(
    new Request("http://localhost/api/generate", {
      method: "POST",
      body: JSON.stringify({ description: "Digits", flags: "g", mode: "find" }),
    }),
  );
  expect(response.status).toBe(429);
  expect(await response.json()).toEqual({
    error:
      "AI quota is busy or exhausted. Wait a little and try again; the owner may need to check Groq usage.",
  });
  expect(fetch).toHaveBeenCalledTimes(1);
});
test("instance budget bounds repeated generation requests", async () => {
  vi.stubEnv("GROQ_API_KEY", "test-secret-not-real");
  vi.resetModules();
  const route = await import("../src/app/api/generate/route");
  const fetch = vi
    .spyOn(globalThis, "fetch")
    .mockRejectedValue(new Error("network"));
  const request = () =>
    new Request("http://localhost/api/generate", {
      method: "POST",
      body: JSON.stringify({ description: "Digits", flags: "g", mode: "find" }),
    });
  for (let n = 0; n < 20; n++)
    expect((await route.POST(request())).status).toBe(502);
  expect((await route.POST(request())).status).toBe(429);
  expect(fetch).toHaveBeenCalledTimes(20);
});
test("provider syntax and output bounds are checked without executing a pattern", async () => {
  vi.stubEnv("GROQ_API_KEY", "test-secret-not-real");
  const fetch = vi.spyOn(globalThis, "fetch");
  for (const pattern of ["[", "x".repeat(2001)]) {
    fetch.mockResolvedValueOnce(
      Response.json({
        id: "fixture",
        object: "chat.completion",
        created: 1,
        model: "openai/gpt-oss-20b",
        choices: [
          {
            index: 0,
            finish_reason: "stop",
            message: {
              role: "assistant",
              content: JSON.stringify({
                pattern,
                flags: "g",
                explanation: "Digits",
                limitations: [],
              }),
            },
          },
        ],
        usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
      }),
    );
    const response = await POST(
      new Request("http://localhost/api/generate", {
        method: "POST",
        body: JSON.stringify({
          description: "Digits",
          mode: "find",
          flags: "g",
        }),
      }),
    );
    expect(response.status).toBe(502);
    expect(JSON.stringify(await response.json())).not.toContain(
      "test-secret-not-real",
    );
  }
});
test("concurrent provider calls are capped and cancellation releases a slot", async () => {
  vi.stubEnv("GROQ_API_KEY", "test-secret-not-real");
  vi.resetModules();
  const route = await import("../src/app/api/generate/route");
  let calls = 0;
  vi.spyOn(globalThis, "fetch").mockImplementation(async (_url, options) => {
    calls++;
    return await new Promise<Response>((_, reject) =>
      options?.signal?.addEventListener(
        "abort",
        () => reject(new DOMException("aborted", "AbortError")),
        { once: true },
      ),
    );
  });
  const first = new AbortController();
  const second = new AbortController();
  const request = (signal?: AbortSignal) =>
    new Request("http://localhost/api/generate", {
      method: "POST",
      signal,
      body: JSON.stringify({ description: "Digits", mode: "find", flags: "g" }),
    });
  const pending = [
    route.POST(request(first.signal)),
    route.POST(request(second.signal)),
  ];
  await vi.waitFor(() => expect(calls).toBe(2));
  expect((await route.POST(request())).status).toBe(429);
  first.abort();
  second.abort();
  expect(
    (await Promise.all(pending)).map((response) => response.status),
  ).toEqual([408, 408]);
  vi.spyOn(globalThis, "fetch").mockRejectedValue(
    new TypeError("connection secret test-secret-not-real"),
  );
  const response = await route.POST(request());
  expect(response.status).toBe(502);
  expect(JSON.stringify(await response.json())).not.toContain(
    "test-secret-not-real",
  );
});
