import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateTestPlanLangChain } from '../src/services/generator-langchain.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

  return paths
    .map((p) => (p.endsWith('.json') ? p : `${p}.json`))
    .map((p) => {
      if (path.isAbsolute(p)) return p;
      if (p.startsWith('scenarios/')) return path.join(__dirname, '..', p);
      return path.join(scenariosDir, p);
    });
}

function renderMarkdown(run) {
  const header = [
    `# Scenario: ${run.scenario}`,
    '',
    `- Engine: ${run.engine}`,
    `- Mode: ${run.mode}`,
    `- Model: ${run.model}`,
    `- Latency: ${run.latency_ms} ms`,
    `- Task: ${run.task}`,
    '- Context:',
    '',
    run.context,
    ''
  ].join('\n');

  return `${header}## Completion\n\n\`\`\`json\n${JSON.stringify(run.completion, null, 2)}\n\`\`\`\n`;
}

async function runScenario(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const scenario = JSON.parse(raw);
  const start = Date.now();
  const result = await generateTestPlanLangChain({
    task: scenario.task,
    context: scenario.context
  });
  const latencyMs = Date.now() - start;

  const run = {
    scenario: `${scenario.name || path.basename(filePath, '.json')}-langchain-v2`,
    engine: 'langchain',
    model: result.model,
    mode: result.mode,
    latency_ms: latencyMs,
    completion: result.completion,
    task: scenario.task,
    context: scenario.context,
    notes: scenario.notes
  };

  const baseName = run.scenario.replace(/\s+/g, '-').toLowerCase();
  fs.writeFileSync(path.join(reportsDir, `${baseName}.json`), JSON.stringify(run, null, 2));
  fs.writeFileSync(path.join(reportsDir, `${baseName}.md`), renderMarkdown(run));

  console.log(`✓ ${run.scenario} (${run.mode}) -> ${run.model} in ${latencyMs} ms`);
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
