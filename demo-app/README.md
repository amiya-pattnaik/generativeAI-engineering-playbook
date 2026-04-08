# Demo: Generative AI QA Helper

Small Node.js web app that shows a generative workflow for engineering/QA/platform teams. It validates input, calls a generator (mock by default, OpenAI when configured), and returns structured JSON test cases.

The app supports two engines:
- `manual`: plain Node.js prompt builder with mock mode or direct OpenAI call.
- `langchain v2`: LangChain prompt + structured output path. This path requires `OPENAI_API_KEY`.

## Run locally

```bash
cd demo-app
cp .env.example .env
# optionally add OPENAI_API_KEY (and OPENAI_MODEL) to .env
npm install
npm run dev
# open http://localhost:3000
# use the scenario picker dropdown to load a scenario into the form, or type your own task/context
# use the engine dropdown to switch between manual and langchain v2
```

- **Mock mode**: If `OPENAI_API_KEY` is unset, the API returns deterministic mock test cases so you can demo offline.
- **Provider mode**: Set `OPENAI_API_KEY` (and optionally `OPENAI_MODEL`) to call OpenAI chat completions with JSON output.
- **LangChain v2**: Uses `ChatPromptTemplate` + `ChatOpenAI.withStructuredOutput(...)`. Without `OPENAI_API_KEY`, it returns a safe `provider_required` note.

## Run scenarios (CLI, mock or provider)

```bash
# from /demo-app
npm run demo:scenario      # runs scenarios/login-mfa.json -> reports/login-mfa.{json,md}
npm run demo:scenarios     # runs all scenarios/*.json
npm run demo:scenario:v2   # runs LangChain-backed v2 for scenarios/login-mfa.json
npm run demo:scenarios:v2  # runs LangChain-backed v2 for all scenarios/*.json
```

- Reports (JSON + Markdown) go to `demo-app/reports/` to mimic the agentic playbook style.
- Add more scenario JSON files in `demo-app/scenarios/` with `name`, `task`, `context`.
- Both CLI runners accept `login-mfa.json` and `scenarios/login-mfa.json` style inputs.

## How it works

- `src/server.js`: Express server, static UI, routing.
- `src/routes/generate.js`: Input validation, timing, responses, mode detection.
- `src/routes/generate-v2.js`: LangChain-backed route for framework comparison.
- `src/routes/scenarios.js`: Lists scenario files for the UI dropdown (`/api/scenarios`).
- `src/services/generator.js`: Builds prompts, chooses provider vs mock, parses/guards responses.
- `src/services/generator-langchain.js`: Uses LangChain prompt templates and schema-based structured output.
- `src/providers/openai.js`: Thin fetch-based client using `response_format: json_object` for structured output.
- `public/index.html`: Minimal UI with scenario picker and engine selector.
- `scripts/run-scenarios.js`: Manual-engine CLI runner that writes reports (JSON + Markdown).
- `scripts/run-scenarios-v2.js`: LangChain-engine CLI runner that writes reports (JSON + Markdown).
- `scenarios/*.json`: Reusable scenario inputs for demos/evals.
- `reports/`: Outputs from scenario runs.

## Extending quickly

- Add providers in `src/providers/` and switch selection logic in `src/services/generator.js`.
- Add new workflows by creating new routes (e.g., `/api/review`) and small front-end forms.
- Layer evals by scripting requests against `/api/generate` with a golden set and storing outputs.

## Engine comparison

- `manual` is useful for showing the core mechanics clearly: prompt construction, output parsing, and offline-safe mock mode.
- `langchain v2` is useful for showing framework adoption with structured output and a more standard LLM app abstraction.
- In interviews, demo both: first explain the manual path, then show how the same contract is preserved with LangChain.
