import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const scenariosDir = path.join(__dirname, '../../scenarios');

router.get('/', (req, res) => {
  try {
    if (!fs.existsSync(scenariosDir)) {
      return res.json({ scenarios: [] });
    }

    const files = fs.readdirSync(scenariosDir).filter((f) => f.endsWith('.json'));
    const scenarios = files.map((file) => {
      const raw = fs.readFileSync(path.join(scenariosDir, file), 'utf-8');
      const data = JSON.parse(raw);
      return {
        name: data.name || file.replace(/\.json$/, ''),
        task: data.task || '',
        context: data.context || '',
        notes: data.notes || ''
      };
    });

    res.json({ scenarios });
  } catch (err) {
    console.error('Failed to list scenarios', err);
    res.status(500).json({ error: 'scenario_list_failed' });
  }
});

export default router;
