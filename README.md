# Generative AI Engineering Playbook — Demo (Node.js)

Small, runnable demo that shows a generative AI workflow for engineering/QA/platform around a simple web app. Runs locally with a mock model or can call OpenAI if you add a key. Mirrors the style of `agentic-engineering-playbook` so you can demo both agentic and generative patterns side-by-side.

This repo now supports two paths:
- `manual`: plain Node.js prompt builder + direct provider call or mock mode.
- `langchain v2`: LangChain prompt + structured output path for framework-backed comparison.

## Concept Primer: What Is Generative AI?
Generative AI uses large language models to produce new content (for example test cases, summaries, plans) from prompts. In this repo, the model generates structured QA artifacts from a `task + context` input.

This pattern is best for accelerating knowledge work where humans still review and finalize outputs.

## Broader GenAI Use Cases
- Requirement/user-story drafting and refinement.
- PR/change summaries and release notes generation.
- Incident/postmortem draft creation.
- Knowledge article and support response drafting.
- Test strategy/checklist generation.

Demo scope in this repository:
- For clarity and repeatability, this demo focuses on **test case generation** from `task + context`.

## Concept Comparison (GenAI vs Agentic vs RAG)
```text
User Need
   |
   +--> Fast content draft from prompt/context
   |      -> Choose GENERATIVE AI
   |
   +--> Multi-step planning + tool orchestration
   |      -> Choose AGENTIC AI
   |
   +--> Answers grounded in source documents with citations
          -> Choose RAG

Rule of thumb:
- Generative: quickest single-shot assistant
- Agentic: coordinated multi-role workflow
- RAG: factual Q&A over your knowledge base
```

## When to Use This Pattern
Use it when:
- You need fast first-draft artifacts (test cases, checklists, summaries).
- You want a lightweight, low-integration AI workflow.
- You need offline-safe demos (mock mode) and optional provider mode.

Avoid or augment it when:
- You need strict factual grounding from source docs (prefer RAG).
- You need multi-step tool execution and planning (prefer agentic flow).
- You need high-stakes autonomous decisions without human review.

### How the generative flow works (no ML background needed)
- User provides a **task** and optional **context** (for example specs or constraints) from the web UI.
- The API validates input, chooses **mock mode** by default or **OpenAI provider** if a key is set, and uses a structured prompt that demands JSON.
- The generator returns **test cases** (title, steps, expected result, risk) in JSON; the server validates/parses and the UI renders them.
- You can swap in other providers or plug in retrieval/context builders without changing the UI.
- The UI includes a **scenario picker** that pulls tasks/contexts from `demo-app/scenarios/*.json` via `/api/scenarios`.
- The UI also includes an **engine selector** so you can switch between the manual implementation and the LangChain-backed v2 flow.

## ASCII Diagram
```text
User (UI)
   |
   v
POST /api/generate  --->  Validate Input
   |                         |
   |                         v
   |                   Build Structured Prompt
   |                         |
   |                         v
   |                +---------------------+
   |                | Model Selector      |
   |                | Mock | OpenAI       |
   |                +---------------------+
   |                         |
   |                         v
   |                   JSON Response
   |                         |
   v                         v
UI Render <--- Parse/Guard/Normalize Output
```

LangChain v2 path:
```text
User (UI)
   |
   v
POST /api/v2/generate  --->  Validate Input
   |                             |
   |                             v
   |                   ChatPromptTemplate
   |                             |
   |                             v
   |                ChatOpenAI.withStructuredOutput(...)
   |                             |
   |                             v
   |                     Structured JSON
   |                             |
   v                             v
UI Render <----------------- Normalized Response
```

## Prompt + Output Contract
- Prompt requires JSON output shape so downstream code can parse deterministically.
- Server validates and normalizes model output before returning to UI.
- If output is malformed, the API falls back safely rather than breaking the flow.

### What it does
- Generates concise test cases for a web feature using structured output, showing contracts + guardrails.
- Works fully offline via mock mode; online mode calls OpenAI chat completions with `response_format: json_object`.
- Keeps prompts/config server-side; UI is static and secret-free.

### How it works (step by step)
1. Open `http://localhost:3000` and enter a task/context.
2. `POST /api/generate` validates the request and calls the generator (mock or provider).
3. Generator builds a prompt, asks for JSON, parses/guards the response.
4. Response includes timing, mode, and model; UI shows structured results.

## Quick start (demo)
```bash
# /generativeAI-engineering-playbook
cd demo-app
cp .env.example .env            # optional: add OPENAI_API_KEY to switch off mock
npm install
npm run dev                     # start API + static UI
# open http://localhost:3000
```

Manual vs framework path:
- `manual`: original prompt builder with mock mode, JSON guardrails, and direct provider integration.
- `langchain v2`: structured-output path using `ChatPromptTemplate` and `ChatOpenAI`.

Use OpenAI instead of mock (optional):
- Set `OPENAI_API_KEY` (and optionally `OPENAI_MODEL`) in `.env`.
- The server switches to provider mode and requests JSON-formatted completions.

Use LangChain v2 (optional):
- Set `OPENAI_API_KEY`.
- Select `langchain v2` in the browser engine dropdown.
- Or run `npm run demo:scenario:v2` / `npm run demo:scenarios:v2`.
- LangChain v2 is provider-backed only; if no key is set, it returns a safe `provider_required` note instead of mock content.

Other LLM providers:
- OpenAI is integrated out-of-the-box.
- You can connect Gemini, Claude, or other providers by adding an adapter in `demo-app/src/providers/` and wiring provider selection in `src/services/generator.js`.

Scenario picker:
- Add scenario files in `demo-app/scenarios/*.json` with `name`, `task`, and `context`.
- The UI dropdown loads them via `/api/scenarios`; selecting a scenario fills the form.

## Files
- `docs/playbook.md` — detailed generative AI engineering playbook (architecture, prompting, guardrails, evals, ops).
- `demo-app/src/server.js` — Express server, static UI, wiring.
- `demo-app/src/routes/generate.js` — input validation, timing, mode detection, responses.
- `demo-app/src/routes/generate-v2.js` — LangChain-backed generation route for framework comparison.
- `demo-app/src/routes/scenarios.js` — serves scenario metadata for the UI picker.
- `demo-app/src/services/generator.js` — prompt builder, provider vs mock selection, JSON parsing guardrail.
- `demo-app/src/services/generator-langchain.js` — LangChain prompt template + structured output path.
- `demo-app/src/providers/openai.js` — thin fetch client with `response_format: json_object`.
- `demo-app/public/index.html` — minimal UI with scenario picker and engine selector.
- `.env.example` — sample env vars; `.gitignore` keeps secrets and node_modules out.

## Extend quickly
- Add providers in `demo-app/src/providers/` and switch selection logic in `src/services/generator.js`.
- Add workflows (for example PR review helper, incident summarizer) as new routes + small UI forms.
- Layer evals by scripting golden prompts against `/api/generate` and storing outputs/scores.
- Add more scenarios to drive demos/evals; reports are generated via the CLI (see `demo-app/README.md`).

## Compare Manual vs LangChain v2
- `manual` is the best path to explain fundamentals: prompt shape, JSON guardrails, mock fallback, and thin provider integration.
- `langchain v2` is the better path to show framework usage: `ChatPromptTemplate`, `ChatOpenAI`, and schema-based structured output.
- Keeping both paths in one repo gives you a stronger interview story: fundamentals first, framework second.

## Limitations
- Outputs can still be plausible-but-wrong without external grounding.
- Prompt changes can shift behavior; keep regression scenarios.
- Not a replacement for deterministic test automation or human QA review.

## Notes
- Node 18+ recommended (uses built-in fetch).
- Offline mock mode is default for safe demos.
- Keep `.env` local; never ship keys to the client.
