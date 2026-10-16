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
        examples: [
          { text: "123", shouldMatch: true },
          { text: "", shouldMatch: false },
        ],
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

  const messages = JSON.parse(body).messages;
  const prompt = JSON.parse(
    messages.find((message: { role: string }) => message.role === "user")
      .content,
  );

  expect(prompt.examples).toEqual([
    { text: "123", shouldMatch: true },
    { text: "", shouldMatch: false },
  ]);

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

  const bytes = new TextEncoder().encode("x".repeat(140001));
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
      headers: { "Content-Length": "1" },
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

test("instance budget allows five requests per hour and resets after the window", async () => {
  let now = Date.now();

  vi.spyOn(Date, "now").mockImplementation(() => now);
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

  for (let n = 0; n < 5; n++)
    expect((await route.POST(request())).status).toBe(502);

  const blocked = await route.POST(request());

  expect(blocked.status).toBe(429);
  expect(blocked.headers.get("Retry-After")).toBe("3600");
  expect(fetch).toHaveBeenCalledTimes(5);
  now += 60000;
  expect((await route.POST(request())).status).toBe(429);
  expect(fetch).toHaveBeenCalledTimes(5);

  now += 3539999;
  const almostReset = await route.POST(request());
  expect(almostReset.status).toBe(429);
  expect(almostReset.headers.get("Retry-After")).toBe("1");

  now += 1;
  expect((await route.POST(request())).status).toBe(502);
  expect(fetch).toHaveBeenCalledTimes(6);
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

test("example request bounds reject malformed checks before contacting Groq", async () => {
  vi.stubEnv("GROQ_API_KEY", "test-secret-not-real");

  const transport = vi.spyOn(globalThis, "fetch");

  for (const examples of [
    Array.from({ length: 21 }, () => ({ text: "", shouldMatch: true })),
    [{ text: "x".repeat(1001), shouldMatch: true }],
    [{ text: "", shouldMatch: "false" }],
    [{ text: "", shouldMatch: false, id: "private-id" }],
    [{ shouldMatch: true }],
    null,
  ]) {
    const response = await POST(
      new Request("http://localhost/api/generate", {
        method: "POST",
        body: JSON.stringify({
          description: "Digits",
          flags: "g",
          mode: "find",
          examples,
        }),
      }),
    );

    expect(response.status).toBe(400);
  }

  expect(transport).not.toHaveBeenCalled();
});

test("all permitted Unicode examples reach Groq within the streaming byte bound", async () => {
  vi.stubEnv("GROQ_API_KEY", "test-secret-not-real");

  const transport = vi.spyOn(globalThis, "fetch").mockResolvedValue(
    Response.json({
      id: "unicode",
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
              pattern: "字+",
              flags: "u",
              explanation: "Matches this character.",
              limitations: [],
            }),
          },
        },
      ],
      usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
    }),
  );

  const examples = Array.from({ length: 20 }, () => ({
    text: "字".repeat(1000),
    shouldMatch: true,
  }));

  const body = JSON.stringify({
    description: "字".repeat(2000),
    mode: "validate",
    flags: "u",
    examples,
  });

  const response = await POST(
    new Request("http://localhost/api/generate", {
      method: "POST",
      headers: { "Content-Length": "1" },
      body,
    }),
  );

  expect(response.status).toBe(200);

  const messages = JSON.parse(
    String(transport.mock.calls[0][1]?.body),
  ).messages;

  expect(
    JSON.parse(
      messages.find((message: { role: string }) => message.role === "user")
        .content,
    ).examples,
  ).toEqual(examples);
});
