import { callOpenAI } from '../providers/openai.js';

const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

function buildPrompt({ task, context }) {
  return {
    system: 'You are a QA assistant that generates concise, high-quality test cases. Return JSON only.',
    user: `Generate 3-5 test cases for the following task. Return JSON with fields: title, steps (array), expected_result, risk. Avoid guessing unknown details. If context is insufficient, set risk to "unknown".\nTask: ${task}\nContext: ${context || 'None provided'}`
  };
}

function mockGenerate({ task, context }) {
  const seeds = (context || task || 'demo').split(/\s+/).filter(Boolean).slice(0, 3);
  const base = seeds.length ? seeds.join('-').toLowerCase() : 'case';
  const makeCase = (i) => ({
    title: `Test ${i + 1} - ${base}`,
    steps: [
      'Set up preconditions from the spec',
      'Execute the described action',
      'Observe system response'
    ],
    expected_result: 'System behaves as specified without errors',
    risk: i === 0 ? 'high' : 'medium'
  });

  return {
    model: 'mock-generator',
    completion: {
      cases: Array.from({ length: 3 }, (_, i) => makeCase(i)),
      note: 'Mock mode; set OPENAI_API_KEY to use a real model.'
    }
  };
}

export async function generateTestPlan({ task, context }) {
  if (!process.env.OPENAI_API_KEY) {
    return mockGenerate({ task, context });
  }

  const { system, user } = buildPrompt({ task, context });
  const messages = [
    { role: 'system', content: system },
    { role: 'user', content: user }
  ];

  const raw = await callOpenAI({ messages, model: DEFAULT_MODEL });
  let completion;

  try {
    completion = JSON.parse(raw);
  } catch (err) {
    // Simple guardrail: if model drifts from JSON, wrap it
    completion = { note: 'Model did not return valid JSON; wrapping raw text.', raw };
  }

  return {
    model: DEFAULT_MODEL,
    completion
  };
}
