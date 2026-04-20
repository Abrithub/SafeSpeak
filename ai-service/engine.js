/**
 * SafeSpeak AI Engine
 * Dataset-powered classifier + chat engine.
 * No external ML dependencies — runs instantly.
 */

const { DATASET, RESOURCES } = require('./dataset');

// ── Tokenize text into lowercase words ───────────────────────────────────────
const tokenize = (text) =>
  text.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter(Boolean);

// ── Score a dataset entry against input text ─────────────────────────────────
const scoreEntry = (entry, tokens) => {
  let matches = 0;
  for (const kw of entry.keywords) {
    const kwTokens = tokenize(kw);
    // Check if all words of the keyword phrase appear in tokens
    if (kwTokens.every(w => tokens.includes(w))) matches++;
    // Partial: any single keyword word match (lower weight)
    else if (kwTokens.some(w => tokens.includes(w))) matches += 0.3;
  }
  return matches;
};

// ── Urgency numeric weight for sorting ───────────────────────────────────────
const URGENCY_WEIGHT = { Critical: 4, High: 3, Medium: 2, Low: 1 };

/**
 * classify(text, abuseTypes, isVictimSafe)
 * Returns { urgency, classification, aiScore, aiReason, resources, response }
 */
const classify = (text = '', abuseTypes = [], isVictimSafe = '') => {
  const combined = [text, ...abuseTypes].join(' ');
  if (isVictimSafe.toLowerCase() === 'no') combined + ' unsafe victim';
  const tokens = tokenize(combined);

  // Score every dataset entry
  const scored = DATASET.map(entry => ({
    entry,
    score: scoreEntry(entry, tokens),
  })).filter(x => x.score > 0)
    .sort((a, b) =>
      b.score - a.score ||
      URGENCY_WEIGHT[b.entry.urgency] - URGENCY_WEIGHT[a.entry.urgency]
    );

  if (scored.length === 0) {
    // No match — return safe default
    return {
      urgency: 'Low',
      classification: abuseTypes[0] || 'Unclassified',
      aiScore: 30,
      aiReason: 'Standard case — requires review.',
      resources: [RESOURCES.crisisText],
      response: 'Thank you for reaching out. Your report has been received and will be reviewed.',
      model: 'dataset',
    };
  }

  const best = scored[0].entry;
  const confidence = Math.min(Math.round((scored[0].score / best.keywords.length) * 100), 99);

  // Boost score if victim is unsafe
  let aiScore = confidence;
  if (isVictimSafe.toLowerCase() === 'no') aiScore = Math.min(aiScore + 15, 99);

  return {
    urgency: best.urgency === 'Critical' ? 'High' : best.urgency, // map Critical→High for DB enum
    isCritical: best.urgency === 'Critical',
    classification: best.classification,
    aiScore,
    aiReason: `${best.classification} detected with ${confidence}% confidence. ${best.urgency === 'Critical' ? 'CRITICAL — immediate action required.' : ''}`.trim(),
    resources: best.resources,
    response: best.response,
    model: 'dataset',
  };
};

/**
 * chat(message, history)
 * Conversational AI — matches message to dataset and returns empathetic response.
 * history: [{ role: 'user'|'ai', text: string }]
 */
const chat = (message = '', history = []) => {
  const tokens = tokenize(message);

  // Emergency shortcut — check critical keywords first
  const criticalWords = ['suicide', 'kill myself', 'end my life', 'want to die', 'overdose', 'hanging'];
  if (criticalWords.some(w => message.toLowerCase().includes(w))) {
    const entry = DATASET.find(e => e.id === 1);
    return {
      response: entry.response,
      urgency: 'Critical',
      resources: entry.resources,
      isEmergency: true,
    };
  }

  const scored = DATASET.map(entry => ({
    entry,
    score: scoreEntry(entry, tokens),
  })).filter(x => x.score > 0)
    .sort((a, b) =>
      b.score - a.score ||
      URGENCY_WEIGHT[b.entry.urgency] - URGENCY_WEIGHT[a.entry.urgency]
    );

  if (scored.length === 0) {
    return {
      response: "I'm here to listen and help. Could you tell me more about what's happening? You're safe here.",
      urgency: 'Low',
      resources: [RESOURCES.crisisText],
      isEmergency: false,
    };
  }

  const best = scored[0].entry;
  return {
    response: best.response,
    urgency: best.urgency,
    resources: best.resources,
    isEmergency: best.urgency === 'Critical',
  };
};

module.exports = { classify, chat };
