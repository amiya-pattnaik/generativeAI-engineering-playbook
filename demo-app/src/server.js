import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import generateRouter from './routes/generate.js';
import generateV2Router from './routes/generate-v2.js';
import scenariosRouter from './routes/scenarios.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.use('/api/generate', generateRouter);
app.use('/api/v2/generate', generateV2Router);
app.use('/api/scenarios', scenariosRouter);

// Serve static front-end
const publicDir = path.join(__dirname, '../public');
app.use(express.static(publicDir));

app.listen(port, () => {
  console.log(`🚀 Demo app listening on http://localhost:${port}`);
  if (!process.env.OPENAI_API_KEY) {
    console.log('ℹ️  Running in mock mode (no OPENAI_API_KEY set).');
  }
});
