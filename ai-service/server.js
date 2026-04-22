require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const { geminiChat, classify } = require('./gemini');

const app     = express();
const PORT    = process.env.AI_PORT || 5001;
const GEMINI_KEY = process.env.GEMINI_API_KEY;

app.use(cors());
app.use(express.json());

// ── Health ────────────────────────────────────────────────────────────────────
app.get('/health', (_, res) => res.json({
  status: 'ok',
  service: 'SafeSpeak AI',
  models: {
    primary:   'Python ML — TF-IDF + Logistic Regression (scikit-learn)',
    secondary: GEMINI_KEY ? 'Google Gemini 1.5 Flash' : 'not configured',
    fallback:  'Keyword-NLP Engine (always available)',
  },
  mlServer: process.env.ML_SERVER_URL || 'http://localhost:5002',
  port: PORT,
}));

// ── POST /classify — classify report description ──────────────────────────────
app.post('/classify', async (req, res) => {
  try {
    const { description = '', isVictimSafe = '' } = req.body;
    const result = await classify(description, [], isVictimSafe);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /chat — conversational AI support ────────────────────────────────────
app.post('/chat', async (req, res) => {
  try {
    const { message = '', history = [] } = req.body;
    if (!message.trim()) return res.status(400).json({ error: 'Message is required' });
    const result = await geminiChat(message, history);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /resources ────────────────────────────────────────────────────────────
app.get('/resources', (_, res) => {
  const { RESOURCES } = require('./dataset');
  res.json(Object.values(RESOURCES));
});

// ── GET /ml/info — proxy to Python ML server info ─────────────────────────────
app.get('/ml/info', async (_, res) => {
  try {
    const ML = process.env.ML_SERVER_URL || 'http://localhost:5002';
    const r = await fetch(`${ML}/ml/info`, { signal: AbortSignal.timeout(3000) });
    res.json(await r.json());
  } catch {
    res.json({ status: 'ML server offline', model: 'TF-IDF + Logistic Regression', framework: 'scikit-learn' });
  }
});

app.listen(PORT, async () => {
  console.log(`🤖 SafeSpeak AI Service → http://localhost:${PORT}`);
  console.log(`🧠 ML Server           → ${process.env.ML_SERVER_URL || 'http://localhost:5002'}`);
  console.log(`🔑 OpenAI              → ${process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here' ? '✅ configured' : '⚠️  not set'}`);
});
