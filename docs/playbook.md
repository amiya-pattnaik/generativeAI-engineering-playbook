# Generative AI Engineering Playbook (Node.js)

Practical guidance to ship reliable generative AI features for engineering/QA/platform teams. Optimized for Node.js stacks with swappable providers (OpenAI/Azure/Anthropic/Bedrock/local).

## 1) Product framing
- Define the **user job** (e.g., "generate test cases from specs", "summarize logs", "review PRs for risky changes").
- Choose **output contract** early: free-form text, JSON schema, table, code diff. Favor structured output for reliability.
- Set **quality bars**: latency budgets, allowed failure modes, safety boundaries, observability requirements.

## 2) Reference architecture (minimal)
- **Client**: thin UI; never stores secrets; sends task + context.
- **API** (Node/Express/Fastify): handles auth, validation, guardrails, and instrumentation.
- **Prompt/generator layer**: provider abstraction with pluggable backends; prefers JSON-mode or tool-use when available.
- **Context builders**: retrieve grounding data (docs, code, tests) via search/RAG; cache aggressively.
- **Guardrails**: input validation, safety filters, PII handling, content policy enforcement.
- **Observability**: structured logs, traces, prompt/response capture with PII stripping, eval metrics.
- **Storage**: vector DB optional; start with in-memory/indexed search for demos; persist runs for eval.

## 3) Workflow patterns (engineering/QA/platform)
- **Spec → Tests**: prompt to produce test cases; emit JSON schema; render in UI.
- **PR review helper**: summarize risks, list blocking issues, suggest tests.
- **Incident/log summarizer**: condense logs; highlight anomalies; propose next actions.
- **Checklist generator**: environment or release readiness; deterministic template with model-filled gaps.

## 4) Prompting & contracts
- Use **system + user + explicit instructions**; include style/format rules in a separate block.
- Prefer **structured output** with JSON schema; validate with `zod`/`ajv`; retry on schema drift.
- Keep prompts **short and declarative**; include constraints (no guessing, return "insufficient context" when unsure).
- Add **few-shot examples** only when needed; store examples separately for reuse.

## 5) Data & context
- Start with **deterministic inputs** (user text + config); add retrieval later.
- If using RAG: chunk docs by semantic units (headings/code blocks); re-rank; cap tokens; include citations.
- Cache retrieved context; log cache hits/misses; track context size vs. output quality.

## 6) Safety & trust
- **PII**: redact before sending to model; avoid logging secrets; encrypt transit/storage.
- **Policy**: block disallowed content categories; use provider safety settings where available.
- **Output filters**: validate JSON; check for hallucinated files/APIs; require citations for claims.
- **Fallbacks**: return friendly degradations (e.g., deterministic mock) instead of failing hard.

## 7) Evaluation & experimentation
- Create a **golden set** of prompts/contexts and expected qualities (accuracy, coverage, tone).
- Implement **offline evals**: run golden set through models; score with rubrics or LLM-as-judge (with bias checks).
- Track **regressions**: compare runs over time; store run IDs, prompts, responses, scores.
- Measure **latency & cost**; optimize via smaller models, prompt compression, and partial caching.

## 8) Delivery & operations
- **Configuration via env**: provider keys, model names, safety toggles; avoid hardcoding.
- **Secrets**: `.env` for local; secret manager in prod; never ship keys to client.
- **CI checks**: lint, type-check, schema validation of prompt templates; run eval smoke tests.
- **Monitoring**: logs/traces with request IDs; alert on elevated error rates or safety violations.
- **Rollouts**: gradual exposure (feature flags); capture human feedback loops for improvement.

## 9) Demo app (included)
- **Stack**: Node.js, Express, Vite-free static front-end; provider-agnostic generator with mock fallback.
- **Flow**: user submits a "Generate test cases" request → server validates → (mock or provider) generates structured JSON → server validates/guards → UI renders and logs.
- **Configs**: `OPENAI_API_KEY` optional; `OPENAI_MODEL` to change models; defaults to deterministic mock when unset.
- **Extend**: add providers under `demo-app/src/providers/`; add new workflows by extending `routes/generate.js` and front-end form.

## 10) Next improvements (pick per org)
- Add vector search + re-ranker; add tool calling for structured actions.
- Integrate tracing (OpenTelemetry) and prompt capturing with redaction.
- Expand evals with automatic scoring and bias detection.
- Add red-teaming scripts for safety and jailbreak resistance.

Use this playbook as a template: keep it small, observable, and resilient, and iterate with evals before broad release.
