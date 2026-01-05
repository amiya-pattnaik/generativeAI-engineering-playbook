# Generative AI Engineering Playbook — QA Demo (Node.js)

Small, runnable demo that shows a generative AI workflow for engineering/QA/platform around a simple web app. Runs locally with a mock model or can call OpenAI if you add a key. Mirrors the style of `agentic-engineering-playbook` so you can demo both agentic and generative patterns side-by-side.

### How the generative flow works (no ML background needed)
- User provides a **task** and optional **context** (e.g., specs or constraints) from the web UI.
- The API validates input, chooses **mock mode** by default or **OpenAI provider** if a key is set, and uses a structured prompt that demands JSON.
- The generator returns **test cases** (title, steps, expected result, risk) in JSON; the server validates/parses and the UI renders them.
- You can swap in other providers or plug in retrieval/context builders without changing the UI.
- The UI now includes a **scenario picker** that pulls tasks/contexts from `demo-app/scenarios/*.json` via `/api/scenarios`.

### What it does
- Generates concise test cases for a web feature using structured output, showing contracts + guardrails.
- Works fully offline via mock mode; online mode calls OpenAI chat completions with `response_format: json_object`.
- Keeps prompts/config server-side; UI is static and secret-free.

### How it works (step by step)
1) Open http://localhost:3000 and enter a task/context (defaults to a login + MFA scenario).
2) POST `/api/generate` validates the request and calls the generator (mock or provider).
3) Generator builds a prompt, asks for JSON, parses/guards the response.
4) Response includes timing, mode, and model; UI shows structured results.

### Quick start (demo)
```bash
# /generativeAI-engineering-playbook
cd demo-app
cp .env.example .env            # optional: add OPENAI_API_KEY to switch off mock
npm install
npm run dev                     # start API + static UI
# open http://localhost:3000
```

Use OpenAI instead of mock (optional):
- Set `OPENAI_API_KEY` (and optionally `OPENAI_MODEL`) in `.env`.
- The server switches to provider mode and requests JSON-formatted completions.

Scenario picker:
- Add scenario files in `demo-app/scenarios/*.json` with `name`, `task`, and `context`.
- The UI dropdown loads them via `/api/scenarios`; selecting a scenario fills the form.

### Files
- `docs/playbook.md` — detailed generative AI engineering playbook (architecture, prompting, guardrails, evals, ops).
- `demo-app/src/server.js` — Express server, static UI, wiring.
- `demo-app/src/routes/generate.js` — input validation, timing, mode detection, responses.
- `demo-app/src/routes/scenarios.js` — serves scenario metadata for the UI picker.
- `demo-app/src/services/generator.js` — prompt builder, provider vs mock selection, JSON parsing guardrail.
- `demo-app/src/providers/openai.js` — thin fetch client with `response_format: json_object`.
- `demo-app/public/index.html` — minimal UI to submit task/context and render structured JSON.
- `.env.example` — sample env vars; `.gitignore` keeps secrets and node_modules out.

### Extend quickly
- Add providers in `demo-app/src/providers/` and switch selection logic in `src/services/generator.js`.
- Add workflows (e.g., PR review helper, incident summarizer) as new routes + small UI forms.
- Layer evals by scripting golden prompts against `/api/generate` and storing outputs/scores.
- Add more scenarios to drive demos/evals; reports are generated via the CLI (see `demo-app/README.md`).

### Notes
- Node 18+ recommended (uses built-in fetch). Offline mock mode is default for safe demos.
- Keep `.env` local; never ship keys to the client. Read the detailed guidance in `docs/playbook.md`.
