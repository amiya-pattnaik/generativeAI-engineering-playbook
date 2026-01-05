import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateTestPlan } from '../src/services/generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mode = process.env.OPENAI_API_KEY ? 'provider' : 'mock';
const scenariosArg = process.argv.slice(2);
const scenariosDir = path.join(__dirname, '../scenarios');
const reportsDir = path.join(__dirname, '../reports');

fs.mkdirSync(reportsDir, { recursive: true });

function loadScenarios(paths) {
  if (paths.length === 0) {
    return fs.readdirSync(scenariosDir)
      .filter((f) => f.endsWith('.json'))
      .map((f) => path.join(scenariosDir, f));
  }
  return paths.map((p) => (p.endsWith('.json') ? p : `${p}.json`)).map((p) => (path.isAbsolute(p) ? p : path.join(scenariosDir, p)));
}

async function runScenario(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const scenario = JSON.parse(raw);
  const start = Date.now();
  const result = await generateTestPlan({ task: scenario.task, context: scenario.context });
  const latencyMs = Date.now() - start;

  const run = {
    scenario: scenario.name || path.basename(filePath, '.json'),
    model: result.model,
    mode,
    latency_ms: latencyMs,
    completion: result.completion,
    task: scenario.task,
    context: scenario.context,
    notes: scenario.notes
  };

  const baseName = run.scenario.replace(/\s+/g, '-').toLowerCase();
  fs.writeFileSync(path.join(reportsDir, `${baseName}.json`), JSON.stringify(run, null, 2));
  fs.writeFileSync(path.join(reportsDir, `${baseName}.md`), renderMarkdown(run));

  console.log(`✓ ${run.scenario} (${mode}) -> ${result.model} in ${latencyMs} ms`);
}

function renderMarkdown(run) {
  const header = `# Scenario: ${run.scenario}\n\n- Mode: ${run.mode}\n- Model: ${run.model}\n- Latency: ${run.latency_ms} ms\n- Task: ${run.task}\n- Context:\n\n${run.context}\n\n`;
  const completion = JSON.stringify(run.completion, null, 2);
  return `${header}## Completion\n\n\n\`\`\`json\n${completion}\n\`\`\``;
}

(async () => {
  const files = loadScenarios(scenariosArg);
  if (files.length === 0) {
    console.error('No scenarios found. Add .json files to demo-app/scenarios');
    process.exit(1);
  }

  for (const file of files) {
    await runScenario(file);
  }
})();
