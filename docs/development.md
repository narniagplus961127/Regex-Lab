# Development and hosting

A JavaScript regex playground built with Next.js 16.4 and TypeScript.

## Run locally

Use Node.js 24.x. The project pins this major version in package.json to keep local development and Vercel consistent while allowing minor and patch updates.

```sh
npm ci
npm run dev
```

Visit http://localhost:3000. The playground works without an API key. Test text stays in the browser, in an isolated worker. Tests stop after 1.5 seconds; patterns accept up to 2,000 characters and test text up to 30,000. The first 500 matches are displayed, with clipping clearly identified.

## Verify

```sh
npm test
npx playwright install chromium
npm run test:e2e
npm run typecheck
npm run build
npm run format:check
npm run eol:check
```

Browser tests default to one worker to keep cold dev-server compilation and isolated regex-worker deadlines stable. Example-generation workflows can also run with `npx playwright test --config playwright.examples.config.ts` on IPv4 port 3106.

Use `npm run format` and `npm run eol:fix` after edits. All authored text uses CRLF. Run a production build locally with `npm run build` followed by `npm start`. The explicit webpack scripts bundle the isolated regex worker using Next.js worker support. Deployment is a separate owner action.

## AI generation setup

Visitors do not need an account or API key. The owner obtains a Groq key from [Groq Console](https://console.groq.com/keys), copies `.env.example` to `.env.local`, and fills in `GROQ_API_KEY`. Restart the dev server after changing configuration. Keep the key server-only: never prefix it with `NEXT_PUBLIC_`, commit it, or put it in a description. Only `GROQ_API_KEY` and `GROQ_MODEL` are read; without a key the local playground and presets remain usable.

The default `GROQ_MODEL` is `openai/gpt-oss-20b`; `openai/gpt-oss-120b` also supports the strict structured output used here. Before choosing another model, verify [Groq strict structured output support](https://console.groq.com/docs/structured-outputs). Unsupported/retired model errors are shown as generation failures, never replaced by a fabricated AI result. Groq free access has model-specific usage quotas; review [Groq rate limits](https://console.groq.com/docs/rate-limits) and your console limits rather than assuming unlimited free generation.

Generation sends the description, current explicit example checks (text and whether each should match), matching intent, and selected flags to the server and Groq. Playground test text is never submitted. Examples are checked locally after applying the returned pattern and effective flags. Failing checks remain visible; revise examples or the description and generate again without losing playground text. There is no hidden repair or regeneration loop. The server validates the response structure, output bounds, and JavaScript syntax without executing generated regex against text. This does not guarantee that a pattern is accurate or fast; inspect it locally before use.

Limits: description 2,000 characters; up to 20 examples of 1,000 characters each (empty text allowed); streamed request body 140,000 bytes and 5 seconds; provider request 20 seconds with no automatic retries and at most 2,200 output tokens; pattern 2,000 characters; explanation 4,000 characters; up to eight limitation notes of 500 characters each. Requests are cancelled on client disconnect where the host propagates cancellation.

Each running server instance shares a 5-request/hour generation budget and permits at most two concurrent provider calls across all visitors. These in-memory guards reset on restart and are independent across Vercel instances. They are basic safeguards, not a distributed quota or billing cap. Configure provider quotas and hosting protection appropriate to public traffic before publishing.

## Vercel owner setup

This is a Next.js project with the default build command `npm run build`. When you choose to host it on Vercel, select Node.js 24, add `GROQ_API_KEY` as a server environment secret in only the intended environment, and set `GROQ_MODEL` if changing the default. Do not share production secrets with unrelated preview branches. Redeployment is required for updated environment values. Configure and verify a preview before publishing.

[Vercel Hobby](https://vercel.com/docs/plans/hobby) is restricted to personal, non-commercial use and has usage limits. Review the current terms for commercial projects. Hosting and AI free tiers have separate limits.

Generation tests use deterministic provider transport fixtures only in tests. A real-provider smoke check needs an owner-provided credential; when no key is present that external boundary remains unverified. To smoke-check after local configuration, write a short description such as "Find six-digit order numbers", generate, inspect the explanation, and test matching and non-matching inputs locally.
