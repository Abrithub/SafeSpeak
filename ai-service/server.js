require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const { geminiChat, geminiClassify } = require('./gemini');

const app  = express();
const PORT = process.env.AI_PORT || 5001;

app.use(cors());
app.use(express.json());

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_, res) => res.json({
  status: 'ok',
  service: 'SafeSpeak AI (Gemini)',
  gemini: !!process.env.GEMINI_API_KEY,
  port: PORT,
}));

// ── POST /chat  — Gemini conversational AI ────────────────────────────────────
// Body: { message, history[], lang? }
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

// ── POST /classify  — case report classification ──────────────────────────────
app.post('/classify', async (req, res) => {
  try {
    const { description = '', abuseTypes = [], isVictimSafe = '' } = req.body;
    const result = await geminiClassify(description, abuseTypes, isVictimSafe);
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

app.listen(PORT, () => {
  console.log(`🤖 SafeSpeak AI (Gemini) running on http://localhost:${PORT}`);
  console.log(`🔑 Gemini API: ${process.env.GEMINI_API_KEY ? '✅ configured' : '⚠️  missing — using dataset fallback'}`);
});
