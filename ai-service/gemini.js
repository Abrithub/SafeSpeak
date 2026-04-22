/**
 * SafeSpeak AI Pipeline
 * Priority: Python ML → OpenAI GPT → Keyword-NLP
 */

const { classify: keywordClassify, chat: keywordChat, buildAbuseResponse } = require('./engine');

const ML_SERVER = process.env.ML_SERVER_URL || 'http://localhost:5002';

// ── OpenAI init (lazy) ────────────────────────────────────────────────────────
let openaiClient = null;

const initOpenAI = () => {
  const key = process.env.OPENAI_API_KEY;
  if (!key || key === 'your_openai_api_key_here') return false;
  if (openaiClient) return true;
  try {
    const { OpenAI } = require('openai');
    openaiClient = new OpenAI({ apiKey: key });
    console.log('✅ OpenAI initialized');
    return true;
  } catch (e) {
    console.log('⚠️  OpenAI init failed:', e.message);
    return false;
  }
};

// ── Python ML classifier ──────────────────────────────────────────────────────
const mlClassify = async (description, isVictimSafe) => {
  const res = await fetch(`${ML_SERVER}/ml/classify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description, isVictimSafe }),
    signal: AbortSignal.timeout(3000),
  });
  if (!res.ok) throw new Error('ML server error');
  return await res.json();
};

// ── Main classify ─────────────────────────────────────────────────────────────
const classify = async (description, _abuseTypes = [], isVictimSafe = '') => {
  try {
    const r = await mlClassify(description, isVictimSafe);
    console.log(`🧠 ML: ${r.classification}`);
    return r;
  } catch (e) { console.log(`⚠️  ML unavailable: ${e.message}`); }
  console.log('📝 Keyword-NLP fallback');
  return keywordClassify(description, [], isVictimSafe);
};

// ── System prompt ─────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are SafeSpeak Mentor, a warm, patient, and knowledgeable AI support guide on SafeSpeak — an abuse reporting platform in Ethiopia.

Your role:
1. LISTEN AND VALIDATE — When someone shares something painful, acknowledge their feelings first. Use simple, empathetic language. Remind them: it is not their fault, they are brave, and they are not alone.

2. GUIDE REPORTING — When asked how to report, walk them through these exact steps:
   Step 1: Create a free account at /signup. Your identity is protected.
   Step 2: Click "Report Incident" from the menu or home page.
   Step 3: Describe what happened in your own words. You do NOT need to know the abuse type — our AI identifies it automatically.
   Step 4: Optionally upload photos, videos, or documents as evidence.
   Step 5: Choose to stay anonymous or provide contact details for updates.
   Step 6: Click "Submit Report". You will receive a Case ID — save it.
   Step 7: Use your Case ID + email at /track to check your case status anytime.

3. EXPLAIN WHAT HAPPENS NEXT — After reporting:
   - A trained support team reviews your case within 24–48 hours.
   - Urgent cases are escalated immediately.
   - You may receive messages or appointment notifications.
   - Track your case at /track anytime.

4. SAFETY PLANNING — If someone is in danger:
   - Ask if they are currently safe.
   - Suggest moving to a public area, contacting a trusted person, or calling emergency services.
   - Provide hotlines: SafeSpeak +251965485715, Crisis Support +251987240570.

5. ABUSE DISCLOSURE — When someone tells you they are being abused:
   - Start with empathy and validation. Do not rush to advice.
   - Explain what is happening is wrong and not their fault.
   - Tell them SafeSpeak can help them report safely and anonymously.
   - Offer to walk them through the reporting steps.
   - Provide relevant support contacts.

Rules:
- Match the user's language: English, Amharic (አማርኛ), or Afaan Oromoo.
- Give thorough, helpful responses — not one-liners. Be like a knowledgeable, caring friend.
- Use numbered steps when giving instructions.
- If there is an emergency, give hotlines first, then support.
- You are a guide and mentor, not a legal or medical professional.
- Emergency contacts: SafeSpeak +251965485715, Crisis +251987240570, WhatsApp +251960255733.`;

// ── Intent detection ──────────────────────────────────────────────────────────
const detectIntent = (message) => {
  const m = message.toLowerCase();
  if (/suicide|kill myself|want to die|end my life|እራሴን ልግደል/i.test(m)) return 'emergency';
  if (/danger|unsafe|threat|going to hurt|going to kill|help me now|what should i do|what do i do|now what/i.test(m)) return 'safety_plan';
  if (/how.*report|where.*report|steps.*report|how do i report/i.test(m)) return 'reporting_guide';
  if (/what happen|next step|after report|track.*case|already submitted/i.test(m)) return 'next_steps';
  if (/scared|afraid|don.t know|confused|alone|hopeless/i.test(m)) return 'emotional_support';
  if (/hit|beat|slap|punch|kick|abuse|assault|rape|harass|threaten|stalk|hurt|force/i.test(m)) return 'abuse_disclosure';
  return 'general';
};

// ── OpenAI chat ───────────────────────────────────────────────────────────────
const geminiChat = async (message, history = []) => {
  if (!initOpenAI()) {
    console.log('⚠️  OpenAI not available — using keyword engine');
    return keywordChat(message, history);
  }

  try {
    const intent = detectIntent(message);

    // Build messages array for OpenAI
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      // Include recent conversation history
      ...history.slice(-10).map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.text,
      })),
      { role: 'user', content: message },
    ];

    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      max_tokens: 600,
      temperature: 0.7,
    });

    const response = completion.choices[0].message.content;

    const isEmergency = intent === 'emergency';
    const resources = [];

    if (isEmergency || intent === 'safety_plan') {
      resources.push({ name: 'SafeSpeak Emergency Line', contact: '+251965485715', type: 'emergency' });
      resources.push({ name: 'Crisis Support', contact: '+251987240570', type: 'crisis' });
      resources.push({ name: 'WhatsApp Support', contact: '+251960255733', type: 'whatsapp' });
    } else if (intent === 'abuse_disclosure') {
      resources.push({ name: 'SafeSpeak Emergency Line', contact: '+251965485715', type: 'emergency' });
      resources.push({ name: 'Domestic Violence Support', contact: '+251909853958', type: 'crisis' });
      resources.push({ name: 'Report Anonymously', contact: '/report', type: 'link' });
    } else if (intent === 'reporting_guide') {
      resources.push({ name: 'Start a Report', contact: '/report', type: 'link' });
    } else if (intent === 'next_steps') {
      resources.push({ name: 'Track Your Case', contact: '/track', type: 'link' });
    } else {
      resources.push({ name: 'SafeSpeak Emergency Line', contact: '+251965485715', type: 'emergency' });
    }

    console.log(`🤖 OpenAI chat OK (intent: ${intent})`);
    return {
      response,
      urgency: isEmergency ? 'Critical' : intent === 'safety_plan' ? 'High' : 'Low',
      resources,
      isEmergency,
      intent,
      model: 'gpt-3.5-turbo',
    };
  } catch (e) {
    console.error(`⚠️  OpenAI chat error: ${e.message}`);
    return keywordChat(message, history);
  }
};

module.exports = { classify, geminiChat };
