import express from 'express';
import { generateTestPlanLangChain } from '../services/generator-langchain.js';

const router = express.Router();

const generatorMode = process.env.OPENAI_API_KEY ? 'provider mode' : 'provider required';

router.options('/', (req, res) => {
  res.set('X-Generator-Mode', generatorMode);
  res.sendStatus(200);
});

router.post('/', async (req, res) => {
  const { task, context } = req.body || {};

  if (!task || typeof task !== 'string') {
    return res.status(400).json({ error: 'task is required as a string' });
  }

  try {
    const start = Date.now();
    const result = await generateTestPlanLangChain({
      task: task.trim(),
      context: (context || '').trim()
    });

    res.json({
      runId: `run_${start}`,
      model: result.model,
      latency_ms: Date.now() - start,
      completion: result.completion,
      mode: result.mode || generatorMode,
      engine: 'langchain'
    });
  } catch (err) {
    console.error('LangChain generation error', err);
    res.status(500).json({ error: 'generation_failed', detail: err.message });
  }
});

export default router;
