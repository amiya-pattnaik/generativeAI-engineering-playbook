import express from 'express';
import { generateTestPlan } from '../services/generator.js';

const router = express.Router();

const generatorMode = process.env.OPENAI_API_KEY ? 'provider mode' : 'mock mode';

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
    const result = await generateTestPlan({ task: task.trim(), context: (context || '').trim() });

    res.json({
      runId: `run_${start}`,
      model: result.model,
      latency_ms: Date.now() - start,
      completion: result.completion,
      mode: generatorMode
    });
  } catch (err) {
    console.error('Generation error', err);
    res.status(500).json({ error: 'generation_failed', detail: err.message });
  }
});

export default router;
