# Demo: Generative AI QA Helper

Small Node.js web app that shows a generative workflow for engineering/QA/platform teams. It validates input, calls a generator (mock by default, OpenAI when configured), and returns structured JSON test cases.

## Run locally

```bash
cd demo-app
cp .env.example .env
# optionally add OPENAI_API_KEY (and OPENAI_MODEL) to .env
npm install
npm run dev
# open http://localhost:3000
# use the scenario picker dropdown to load a scenario into the form, or type your own task/context
```

- **Mock mode**: If `OPENAI_API_KEY` is unset, the API returns deterministic mock test cases so you can demo offline.
- **Provider mode**: Set `OPENAI_API_KEY` (and optionally `OPENAI_MODEL`) to call OpenAI chat completions with JSON output.

## Run scenarios (CLI, mock or provider)

```bash
# from /demo-app
npm run demo:scenario      # runs scenarios/login-mfa.json -> reports/login-mfa.{json,md}
npm run demo:scenarios     # runs all scenarios/*.json
```

- Reports (JSON + Markdown) go to `demo-app/reports/` to mimic the agentic playbook style.
- Add more scenario JSON files in `demo-app/scenarios/` with `name`, `task`, `context`.

## How it works

- `src/server.js`: Express server, static UI, routing.
- `src/routes/generate.js`: Input validation, timing, responses, mode detection.
- `src/routes/scenarios.js`: Lists scenario files for the UI dropdown (`/api/scenarios`).
- `src/services/generator.js`: Builds prompts, chooses provider vs mock, parses/guards responses.
- `src/providers/openai.js`: Thin fetch-based client using `response_format: json_object` for structured output.
- `public/index.html`: Minimal UI with scenario picker to load tasks/contexts and render JSON results.
 - `scripts/run-scenarios.js`: CLI runner to execute scenario files and write reports (JSON + Markdown).
 - `scenarios/*.json`: Reusable scenario inputs for demos/evals.
 - `reports/`: Outputs from scenario runs.

## Extending quickly

- Add providers in `src/providers/` and switch selection logic in `src/services/generator.js`.
- Add new workflows by creating new routes (e.g., `/api/review`) and small front-end forms.
- Layer evals by scripting requests against `/api/generate` with a golden set and storing outputs.
