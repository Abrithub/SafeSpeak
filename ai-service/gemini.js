/**
 * SafeSpeak Gemini AI Engine
 * Uses Google Gemini API for real conversational AI.
 * Supports English, Amharic (አማርኛ), and Afaan Oromoo.
 * Falls back to dataset engine if Gemini is unavailable.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { classify: datasetClassify, chat: datasetChat } = require('./engine');
const { RESOURCES } = require('./dataset');

let genAI = null;
let model = null;

const initGemini = () => {
  if (!process.env.GEMINI_API_KEY) return false;
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 512,
      },
    });
    return true;
  } catch {
    return false;
  }
};

// ── System prompt — defines SafeSpeak AI persona ─────────────────────────────
const SYSTEM_PROMPT = `You are SafeSpeak AI, a compassionate and professional support assistant for a child and abuse reporting platform called SafeSpeak, used in Ethiopia.

YOUR ROLE:
- Provide empathetic, trauma-informed support to people reporting abuse or seeking help
- Help users understand how to report incidents through the SafeSpeak platform
- Detect emergency/crisis situations and provide immediate resources
- Answer questions about the reporting process, privacy, and case tracking

LANGUAGES:
- Detect the language of the user's message automatically
- Respond in the SAME language the user writes in
- Supported languages: English, Amharic (አማርኛ), Afaan Oromoo
- If unsure of language, respond in English

TONE:
- Warm, calm, and non-judgmental
- Never minimize or dismiss what the user shares
- Use simple, clear language — avoid jargon
- Always validate the user's feelings first before providing information

EMERGENCY DETECTION:
- If the user mentions suicide, self-harm, immediate danger, or being actively harmed RIGHT NOW, treat it as a CRITICAL emergency
- In emergencies, always provide: Emergency (911/112), Suicide Prevention (988), Crisis Text Line (Text HOME to 741741)
- For Ethiopia specifically: Emergency number is 911, Women & Children Affairs hotline

SAFESPEAK PLATFORM INFO:
- Users can report abuse anonymously at /report
- Reports are encrypted and confidential
- Users get a Case ID to track their report at /track
- The form takes 3-5 minutes to complete
- Most fields are optional to protect privacy
- AI automatically prioritizes urgent cases

IMPORTANT RULES:
- NEVER provide medical diagnoses
- NEVER tell users what to do legally — suggest they consult legal aid
- NEVER store or repeat personal information the user shares
- ALWAYS end responses with an offer to help further or a relevant resource
- Keep responses concise — 2-4 sentences max unless more detail is needed
- If asked about something outside your scope, gently redirect to SafeSpeak's purpose

RESOURCES TO MENTION WHEN RELEVANT:
- Emergency: 911 / 112
- Suicide Prevention: 988 (or Text HOME to 741741)
- Domestic Violence: 1-800-799-7233
- Child Abuse: 1-800-422-4453
- Sexual Assault (RAINN): 1-800-656-4673
- Human Trafficking: 1-888-373-7888`;

// ── Detect emergency from text ────────────────────────────────────────────────
const EMERGENCY_PATTERNS = [
  /suicid/i, /kill\s*(my)?self/i, /end\s*my\s*life/i, /want\s*to\s*die/i,
  /overdos/i, /hanging/i, /self.?harm/i, /cut\s*myself/i,
  // Amharic patterns
  /እራሴን\s*ልግደል/i, /መሞት\s*እፈልጋለሁ/i,
  // Oromo patterns
  /of\s*ajjeesuu/i, /du'uu\s*barbaada/i,
];

const isEmergency = (text) => EMERGENCY_PATTERNS.some(p => p.test(text));

// ── Extract resources from Gemini response text ───────────────────────────────
const extractResources = (text) => {
  const found = [];
  if (/988|suicide/i.test(text))           found.push(RESOURCES.suicide);
  if (/741741|crisis\s*text/i.test(text))  found.push(RESOURCES.crisisText);
  if (/911|emergency/i.test(text))         found.push(RESOURCES.emergency);
  if (/1-800-799|domestic/i.test(text))    found.push(RESOURCES.domesticViolence);
  if (/1-800-422|child\s*abuse/i.test(text)) found.push(RESOURCES.childAbuse);
  if (/rainn|1-800-656|sexual/i.test(text))  found.push(RESOURCES.rainn);
  if (/trafficking|1-888-373/i.test(text))   found.push(RESOURCES.trafficking);
  return [...new Map(found.map(r => [r.name, r])).values()]; // dedupe
};

// ── Build conversation history for Gemini ────────────────────────────────────
const buildHistory = (history) =>
  history.slice(-10).map(m => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.text }],
  }));

// ── Main chat function ────────────────────────────────────────────────────────
const geminiChat = async (message, history = []) => {
  // Always check for emergency first
  const emergency = isEmergency(message);

  if (!model && !initGemini()) {
    // Gemini not available — fall back to dataset engine
    const fallback = datasetChat(message, history);
    return { ...fallback, model: 'dataset-fallback' };
  }

  try {
    const chat = model.startChat({
      history: [
        // Inject system prompt as first exchange
        { role: 'user', parts: [{ text: 'Please confirm your role and how you will help.' }] },
        { role: 'model', parts: [{ text: SYSTEM_PROMPT }] },
        // Previous conversation
        ...buildHistory(history),
      ],
    });

    const result = await chat.sendMessage(message);
    const response = result.response.text();
    const resources = extractResources(response);

    // If emergency detected but Gemini didn't include resources, add them
    if (emergency && resources.length === 0) {
      resources.push(RESOURCES.suicide, RESOURCES.crisisText, RESOURCES.emergency);
    }

    return {
      response,
      urgency: emergency ? 'Critical' : 'Low',
      resources,
      isEmergency: emergency,
      model: 'gemini-1.5-flash',
    };
  } catch (err) {
    console.error('Gemini error:', err.message);
    // Fall back to dataset engine
    const fallback = datasetChat(message, history);
    return { ...fallback, model: 'dataset-fallback', error: err.message };
  }
};

// ── Classify with Gemini (for case reports) ───────────────────────────────────
const geminiClassify = async (description, abuseTypes, isVictimSafe) => {
  // Always use dataset classifier for case classification (fast + reliable)
  // Gemini is only used for the chat interface
  return datasetClassify(description, abuseTypes, isVictimSafe);
};

module.exports = { geminiChat, geminiClassify };
