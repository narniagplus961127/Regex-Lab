# 05: Generate a pattern from a description

**What to build:** A visitor writes a description, chooses matching intent and flags, and generates a pattern through a real server-side AI request. The returned pattern and explanation appear in the existing playground, ready for local inspection and copying.

**Blocked by:** 03 — Understand and copy the current pattern. The provider/stack proposal must be confirmed before implementation of the integration.

**Status:** ready-for-agent

- [ ] With the owner's server-side AI credential configured, a description produces a JavaScript pattern, effective flags, plain-language explanation, and relevant limitations through the real provider.
- [ ] Generation uses the chosen matching intent and supported flags, and the resulting pattern is locally testable and copyable.
- [ ] Returned structure and JavaScript syntax are validated before applying a result. Failed generation preserves the current usable pattern and test text.
- [ ] Visitors see generation progress and cannot accidentally submit duplicate concurrent requests through the interface.
- [ ] Missing configuration, provider errors, exhausted quotas, timeouts, invalid output, and connectivity failures produce useful feedback without exposing secrets or provider internals.
- [ ] Without AI configuration, owner setup guidance is available and local pattern testing remains functional.
- [ ] Request inspection proves playground text is excluded. Privacy wording accurately explains the submitted description and explicitly selected generation inputs.
- [ ] API credentials remain server-only and do not appear in responses, client bundles, or logs.
- [ ] Requests and outputs are bounded. Basic abuse limits apply; their scope is documented accurately, including per-instance limits if used.
- [ ] Setup documentation describes obtaining/configuring a credential, choosing a supported configurable model, local startup, and hosting/free-tier restrictions; visitors never need their own keys.
- [ ] Deterministic test-only provider responses exercise successful and failed flows. A real-provider smoke check is performed when credentials are available; any unverified external boundary is reported explicitly.
- [ ] No fallback fabricates AI generation when the provider is unavailable. This ticket does not authorize deploying or provisioning external accounts.

## Comments

Published on 2026-10-14 after approval of the seven core tickets. Implementation remains paused; publication does not authorize implementation or deployment.
