# 05: Generate a pattern from a description

**What to build:** A visitor writes a description, chooses matching intent and flags, and generates a pattern through a real server-side AI request. The returned pattern and explanation appear in the existing playground, ready for local inspection and copying.

**Blocked by:** 03 — Understand and copy the current pattern.

**Status:** ready-for-agent

**Resolution:** resolved

- [x] With the owner's server-side AI credential configured, a description produces a JavaScript pattern, effective flags, plain-language explanation, and relevant limitations through the real provider.
- [x] Generation uses the chosen matching intent and supported flags, and the resulting pattern is locally testable and copyable.
- [x] Returned structure and JavaScript syntax are validated before applying a result. Failed generation preserves the current usable pattern and test text.
- [x] Visitors see generation progress and cannot accidentally submit duplicate concurrent requests through the interface.
- [x] Missing configuration, provider errors, exhausted quotas, timeouts, invalid output, and connectivity failures produce useful feedback without exposing secrets or provider internals.
- [x] Without AI configuration, owner setup guidance is available and local pattern testing remains functional.
- [x] Request inspection proves playground text is excluded. Privacy wording accurately explains the submitted description and explicitly selected generation inputs.
- [x] API credentials remain server-only and do not appear in responses, client bundles, or logs.
- [x] Requests and outputs are bounded. Basic abuse limits apply; their scope is documented accurately, including per-instance limits if used.
- [x] Setup documentation describes obtaining/configuring a credential, choosing a supported configurable model, local startup, and hosting/free-tier restrictions; visitors never need their own keys.
- [x] Deterministic test-only provider responses exercise successful and failed flows. A real-provider smoke check is performed when credentials are available; any unverified external boundary is reported explicitly.
- [x] No fallback fabricates AI generation when the provider is unavailable. This ticket does not authorize deploying or provisioning external accounts.

## Comments

Published on 2026-10-14 after approval of the seven core tickets. Implementation remains paused; publication does not authorize implementation or deployment.

Implementation authorized on 2026-10-14 using Next.js, TypeScript, Vercel, and Groq, with Prettier and CRLF. Provider/stack confirmation is satisfied. Do not deploy.

Implemented on 2026-10-14. Real Groq integration uses the installed AI SDK 7 `generateText` and `Output.object` APIs with strict structured output (`openai/gpt-oss-20b` default; owner-configurable `GROQ_MODEL`). Provider/schema APIs were checked against installed version docs, Next.js bundled route-handler docs, and official Groq structured-output support. Server credentials remain server-only. The browser submits description, intent, and flags, never live test text. Generated results update the pattern, effective flags, and matching explanation descriptor while retaining playground text; failures and cancellation preserve the usable pattern. Split generator component/CSS/hook provide progress, duplicate prevention, cancellation, setup guidance, and safe errors.

Requests have an actual streamed 12,000-byte cap and a five-second body deadline; output structure, lengths, and JavaScript syntax are validated without executing generated regex server-side. Provider calls have a 20-second timeout, no automatic retries, and 2,200-token output cap. Basic in-memory safeguards allow 20 calls/minute and two concurrent calls shared across visitors of each running instance. These are not distributed quotas or billing caps; README explains restarts, Vercel scaling, provider quotas, current personal/non-commercial Hobby restrictions, Node 22+ (24 recommended), and environment setup. Only used environment variables remain in `.env.example`.

Validation: first route test was red for a missing handler, then green for missing setup; subsequent red-green slices covered real SDK transport generation, strict/oversized requests, provider quota errors, and instance budgets. Seven public-route tests use deterministic external-provider transport fixtures only in tests and cover syntax/output rejection, cancellation and concurrency release. Four browser workflow tests cover successful generation/privacy, preserved state on failure, real missing-configuration route guidance, and progress/duplicate prevention/cancellation. Full unit suite, TypeScript check, production build, Prettier check, and CRLF check passed.

External verification limit: no usable GROQ_API_KEY is configured in the workspace/environment, so a live real-provider smoke request could not be performed. Successful generation is verified through the production SDK/provider transport with test-only fixtures, not a live Groq account. README records the smoke-check procedure for the owner. No fake production fallback, account provisioning, or deployment was performed.
