/**
 * SafeSpeak AI Classification Engine
 * ====================================
 * Primary: Naive Bayes ML model (trained on 100+ labeled sentences)
 * Fallback: Comprehensive keyword-NLP (20 categories, EN/AM/OM)
 */

const { RESOURCES } = require('./dataset');
const fs   = require('fs');
const path = require('path');

// ── Load trained Naive Bayes model ────────────────────────────────────────────
let nbModel = null;
const MODEL_PATH = path.join(__dirname, 'classifier_nb.json');

const loadModel = () => {
  try {
    if (fs.existsSync(MODEL_PATH)) {
      nbModel = JSON.parse(fs.readFileSync(MODEL_PATH, 'utf8'));
      console.log(`🧠 Naive Bayes model loaded (${nbModel.classes.length} classes)`);
      return true;
    }
  } catch (e) { console.log('⚠️  Could not load NB model:', e.message); }
  return false;
};
loadModel();

// ── Tokenizer ─────────────────────────────────────────────────────────────────
const tokenize = (text) =>
  text.toLowerCase().replace(/[^\w\u1200-\u137F\s]/g, ' ').split(/\s+/).filter(Boolean);

// ── Naive Bayes predict ───────────────────────────────────────────────────────
const nbPredict = (text) => {
  if (!nbModel) return null;
  const tokens = tokenize(text);
  const scores = {};

  nbModel.classes.forEach(c => {
    let score = nbModel.classLogProbs[c] || 0;
    tokens.forEach(word => {
      if (nbModel.wordLogProbs[c] && nbModel.wordLogProbs[c][word]) {
        score += nbModel.wordLogProbs[c][word];
      }
    });
    scores[c] = score;
  });

  const maxScore = Math.max(...Object.values(scores));
  const expScores = {};
  nbModel.classes.forEach(c => { expScores[c] = Math.exp(scores[c] - maxScore); });
  const totalExp = Object.values(expScores).reduce((a, b) => a + b, 0);
  const probs = {};
  nbModel.classes.forEach(c => { probs[c] = expScores[c] / totalExp; });

  const sorted = Object.entries(probs).sort((a, b) => b[1] - a[1]);
  return { label: sorted[0][0], confidence: sorted[0][1], top3: sorted.slice(0, 3) };
};

// ── Urgency map ───────────────────────────────────────────────────────────────
const URGENCY_MAP = {
  'Sexual Assault':    'High',
  'Domestic Violence': 'High',
  'Child Abuse':       'High',
  'Human Trafficking': 'High',
  'Physical Abuse':    'Medium',
  'Emotional Abuse':   'Medium',
  'Sexual Harassment': 'Medium',
  'Online Abuse':      'Medium',
  'Child Labor':       'High',
  'Neglect':           'Medium',
};

// ── Urgency boosters ──────────────────────────────────────────────────────────
const BOOSTERS = [
  { pattern: /right now|happening now|currently|ongoing|still happening/i, boost: 15, reason: 'Incident is ongoing' },
  { pattern: /child|minor|underage|baby|infant|toddler|kid|\d+ years old/i, boost: 15, reason: 'Minor/child involved' },
  { pattern: /weapon|knife|gun|machete|threatened to kill|death threat/i,   boost: 15, reason: 'Weapon involved' },
  { pattern: /hospital|emergency|broken bone|unconscious|bleeding/i,        boost: 12, reason: 'Serious physical injury' },
  { pattern: /repeat|every day|every night|years|months|again and again/i,  boost: 10, reason: 'Repeated abuse' },
  { pattern: /pregnant|pregnancy/i,                                          boost: 12, reason: 'Pregnant victim' },
  { pattern: /not safe|unsafe|in danger|immediate danger|help me/i,         boost: 12, reason: 'Victim in immediate danger' },
  { pattern: /suicide|kill myself|want to die|end my life/i,                boost: 20, reason: 'Suicidal ideation' },
  { pattern: /አሁን|ህፃን|ቢላ|ጠመንጃ|ደም/i,                                       boost: 10, reason: 'Amharic urgency' },
  { pattern: /amma|daa'ima|qawwee|dhiiga/i,                                  boost: 10, reason: 'Oromo urgency' },
];

// ── Keyword-NLP fallback ──────────────────────────────────────────────────────
const KEYWORD_CLASSIFIERS = [
  { classification: 'Human Trafficking', weight: 10,
    keywords: ['trafficking','trafficked','sold','forced prostitution','passport taken','debt bondage','smuggled','lured with job'] },
  { classification: 'Child Sexual Abuse', weight: 10,
    keywords: ['child rape','child sexual','molesting child','minor sexual','underage sexual','child exploitation','grooming child'] },
  { classification: 'Sexual Assault', weight: 9,
    keywords: ['rape','raped','sexual assault','sexually assaulted','forced sex','non consensual','violated','sexual violence'] },
  { classification: 'Child Abuse', weight: 9,
    keywords: ['child abuse','abusing child','beating child','child beaten','child neglect','child abandoned','child starving'] },
  { classification: 'Domestic Violence', weight: 9,
    keywords: ['domestic violence','husband beating','wife beating','partner hitting','spouse abuse','partner violent','abusive husband'] },
  { classification: 'Physical Assault', weight: 8,
    keywords: ['stabbed','knife','gun','weapon','attacked','beaten','broken bone','bleeding badly','hospitalized'] },
  { classification: 'Child Labor', weight: 8,
    keywords: ['child labor','child working','forced child work','minor working','child factory','child servant'] },
  { classification: 'Physical Abuse', weight: 7,
    keywords: ['hit me','hitting','slapped','punched','kicked','beaten','bruises','physically abused'] },
  { classification: 'Emotional Abuse', weight: 6,
    keywords: ['emotional abuse','verbal abuse','humiliating','controlling','manipulating','gaslighting','worthless'] },
  { classification: 'Sexual Harassment', weight: 6,
    keywords: ['sexual harassment','harassed','unwanted touching','groping','sexual comments','sexual pressure'] },
  { classification: 'Online Abuse', weight: 6,
    keywords: ['cyberbullying','online harassment','revenge porn','intimate images','sextortion','hacked','fake profile'] },
  { classification: 'Elder Abuse', weight: 7,
    keywords: ['elder abuse','elderly abuse','old person abuse','senior abuse','stealing from elderly'] },
  { classification: 'Neglect', weight: 5,
    keywords: ['neglect','neglected','no food','no care','abandoned','left alone','not cared for'] },
  { classification: 'Harassment', weight: 4,
    keywords: ['harassment','harassing','threatening messages','intimidation','bullying'] },
];

const keywordClassify = (text) => {
  const tokens = tokenize(text);
  const lower = text.toLowerCase();
  let best = null;
  let bestScore = 0;
  KEYWORD_CLASSIFIERS.forEach(cls => {
    let score = 0;
    cls.keywords.forEach(kw => {
      if (lower.includes(kw)) score += cls.weight * 2;
      else if (tokenize(kw).some(w => tokens.includes(w) && w.length > 4)) score += cls.weight * 0.5;
    });
    if (score > bestScore) { bestScore = score; best = cls; }
  });
  if (!best) return null;
  return { classification: best.classification, baseScore: Math.min(20 + bestScore * 2, 80) };
};

/**
 * classify(description, _ignored, isVictimSafe)
 */
const classify = (description = '', _abuseTypes = [], isVictimSafe = '') => {
  if (!description.trim()) {
    return { urgency: 'Low', classification: 'Unclassified', aiScore: 20,
      aiReason: 'No description provided.', model: 'none' };
  }

  let classification = 'Unclassified';
  let baseScore = 20;
  let modelUsed = 'keyword-nlp';
  let confidence = 0;

  // Try Naive Bayes first
  const nbResult = nbPredict(description);
  if (nbResult && nbResult.confidence > 0.3) {
    classification = nbResult.label;
    baseScore = Math.min(20 + Math.round(nbResult.confidence * 65), 85);
    confidence = nbResult.confidence;
    modelUsed = 'naive-bayes';
  } else {
    const kwResult = keywordClassify(description);
    if (kwResult) {
      classification = kwResult.classification;
      baseScore = kwResult.baseScore;
    }
  }

  let urgency = URGENCY_MAP[classification] || 'Low';

  let boostTotal = 0;
  const reasons = [];
  BOOSTERS.forEach(b => {
    if (b.pattern.test(description)) { boostTotal += b.boost; reasons.push(b.reason); }
  });

  if (isVictimSafe && isVictimSafe.toLowerCase() === 'no') {
    boostTotal += 15;
    reasons.push('Victim currently unsafe');
    if (urgency === 'Low') urgency = 'Medium';
  }

  let aiScore = Math.min(baseScore + boostTotal, 99);
  if (aiScore >= 75) urgency = 'High';
  else if (aiScore >= 50 && urgency === 'Low') urgency = 'Medium';

  const uniqueReasons = [...new Set(reasons)];
  const confStr = confidence > 0 ? ` (${Math.round(confidence * 100)}% confidence)` : '';
  const aiReason = `${classification} identified${confStr}. ${uniqueReasons.slice(0, 3).join('. ')}`.trim();

  return { urgency, classification, aiScore, aiReason, model: modelUsed };
};

const INTENT_RESPONSES = {
  safety_plan: {
    response: `I hear you — your safety is the most important thing right now. Let's go through this step by step.

First: Are you in the same location as the person who is threatening you right now?

Here is what to do immediately:

1. If you are in immediate physical danger — leave now. Go to a neighbor, a public place, or anywhere away from the threat. Do not wait.

2. Call for help:
   • Emergency: +251965485715 (SafeSpeak Emergency Line)
   • Police: Your local emergency number
   • A trusted person: friend, family member, neighbor

3. If you cannot call out loud — you can text or WhatsApp +251960255733 silently.

4. Get to a safe room if you cannot leave — one with a lock, away from the threat.

5. Once you are safe — report what is happening on SafeSpeak. You can do this anonymously and our team will respond within 24 hours.

You are not alone. Tell me — are you able to leave right now, or are you stuck somewhere?`,
    urgency: 'High',
    resources: [RESOURCES.emergency, RESOURCES.crisisText, RESOURCES.domesticViolence],
    isEmergency: true,
  },
  emotional_support: {
    response: `I'm really glad you reached out. Whatever you are going through, you don't have to face it alone.

Let's take this one step at a time:

1. First — take a breath. You are in a safe space here. Nothing you share will be used against you.

2. You are not alone. Many people have been in situations that felt impossible, and found a way through with the right support.

3. Can you tell me a little more about what is happening? For example:
   • Is someone hurting you or threatening you?
   • Are you in danger right now?
   • Has something happened that you want to report?

The more you share, the better I can guide you. Everything here is confidential.

What is going on?`,
    urgency: 'Low',
    resources: [RESOURCES.crisisText, RESOURCES.mentalHealth, RESOURCES.emergency],
    isEmergency: false,
  },
  reporting_guide: {
    response: `Reporting is a brave and important step. Here is exactly how to do it on SafeSpeak:

Step 1 — Create a free account at /signup
   Your identity is fully protected. Takes less than 1 minute.

Step 2 — Click "Report Incident"
   Find this on the home page or in the menu.

Step 3 — Describe what happened in your own words
   You do NOT need to know the type of abuse — our AI identifies it automatically.

Step 4 — Upload evidence (optional)
   Photos, videos, or documents. This is optional but helps your case.

Step 5 — Choose your privacy setting
   Stay completely anonymous, or provide contact details for updates.

Step 6 — Submit your report
   You will receive a unique Case ID. Save it.

Step 7 — Track your case anytime
   Go to /track, enter your Case ID + email to see status and messages.

After submitting, a trained support team reviews your case within 24–48 hours. Urgent cases are escalated immediately.

Do you need help with any specific step?`,
    urgency: 'Low',
    resources: [{ name: 'Start a Report', contact: '/report', type: 'link' }],
    isEmergency: false,
  },
  next_steps: {
    response: `After you submit a report on SafeSpeak, here is exactly what happens:

1. Immediate — your case is received and assigned a unique Case ID. Save this.

2. Within 24–48 hours — a trained support team reviews your case. Urgent or high-risk cases are escalated immediately, often within hours.

3. You may receive:
   • A secure message from the support team asking for more details
   • An appointment notification for an in-person meeting
   • A referral to police, court, or a specialist organization

4. Track your case anytime:
   • Go to /track
   • Enter your Case ID + the email you used when reporting
   • You can see your case status, messages, and appointment details

5. You can reply to messages from the support team directly through the platform.

Is there something specific about your case you want to understand?`,
    urgency: 'Low',
    resources: [{ name: 'Track Your Case', contact: '/track', type: 'link' }],
    isEmergency: false,
  },
};

// Detect intent from message text
const detectChatIntent = (message) => {
  const m = message.toLowerCase();
  if (/suicide|kill myself|want to die|end my life/i.test(m)) return 'emergency';
  if (/danger|unsafe|threat|going to hurt|going to kill|help me now|what should i do|what do i do|okay what|now what/i.test(m)) return 'safety_plan';
  if (/how.*report|where.*report|steps.*report|how do i/i.test(m)) return 'reporting_guide';
  if (/what happen|next step|after report|track.*case|already submitted/i.test(m)) return 'next_steps';
  if (/scared|afraid|don.t know|confused|lost|no one|alone|hopeless/i.test(m)) return 'emotional_support';
  if (/hit|beat|slap|punch|kick|abuse|assault|rape|harass|threaten|stalk|hurt|force/i.test(m)) return 'abuse_disclosure';
  return null;
};

const scoreEntry = (entry, tokens) => {
  let matches = 0;
  entry.keywords.forEach(kw => {
    const kwTokens = tokenize(kw);
    if (kwTokens.every(w => tokens.includes(w))) matches++;
    else if (kwTokens.some(w => tokens.includes(w))) matches += 0.3;
  });
  return matches;
};

const chat = (message = '', history = []) => {
  const { DATASET } = require('./dataset');
  const tokens = tokenize(message);
  const lower = message.toLowerCase();

  // 1. Emergency check
  const criticalWords = ['suicide','kill myself','end my life','want to die','overdose','እራሴን ልግደል','of ajjeesuu'];
  if (criticalWords.some(w => lower.includes(w))) {
    const entry = DATASET.find(e => e.id === 1);
    return { response: entry.response, urgency: 'Critical', resources: entry.resources, isEmergency: true };
  }

  // 2. Intent detection — gives rich structured responses
  const intent = detectChatIntent(message);
  if (intent && intent !== 'abuse_disclosure' && INTENT_RESPONSES[intent]) {
    return INTENT_RESPONSES[intent];
  }

  // 3. Check conversation context — if bot asked "what is happening", treat reply as abuse disclosure
  const lastBotMsg = history.filter(m => m.role === 'ai').slice(-1)[0];
  const wasAskingForDetails = lastBotMsg && /what is happening|what happened|tell me more|what is going on/i.test(lastBotMsg.text);

  // 4. Keyword dataset matching
  const scored = DATASET.map(entry => ({ entry, score: scoreEntry(entry, tokens) }))
    .filter(x => x.score > 0).sort((a, b) => b.score - a.score);

  if (scored.length > 0 && !wasAskingForDetails) {
    const best = scored[0].entry;
    return { response: best.response, urgency: best.urgency, resources: best.resources,
      isEmergency: best.urgency === 'Critical' };
  }

  // 5. Abuse classifier — for direct disclosures like "my wife hits me"
  const classified = keywordClassify(lower);
  if (classified || wasAskingForDetails) {
    const abuseType = classified?.classification || 'abuse';
    return buildAbuseResponse(abuseType, lower);
  }

  // 6. Final fallback
  return {
    response: `Thank you for reaching out. I want to make sure I understand what you're going through so I can help you properly.\n\nCan you tell me a bit more about what is happening?\n• Is someone hurting you physically or emotionally?\n• Are you in danger right now?\n• Do you need help reporting something?\n\nEverything you share here is confidential.`,
    urgency: 'Low',
    resources: [RESOURCES.crisisText, RESOURCES.emergency],
    isEmergency: false,
  };
};

const buildAbuseResponse = (abuseType, lower) => {
  const isPhysical = /domestic|physical|hit|beat|punch|slap|kick/i.test(abuseType + lower);
  const isSexual   = /sexual|rape|assault|harass/i.test(abuseType + lower);
  const isChild    = /child|minor|kid/i.test(abuseType + lower);
  const isTraffick = /traffick/i.test(abuseType + lower);

  let response = `I hear you, and I want you to know — what is happening to you is not okay and it is not your fault.\n\n`;

  if (isPhysical) {
    response += `What you are describing is domestic violence or physical abuse. Here is what you should do:\n\n`;
    response += `1. Safety first — if you are in immediate danger right now, leave and call +251965485715.\n`;
    response += `2. Get to a safe place — a neighbor, public area, or trusted friend's home.\n`;
    response += `3. Document the abuse — take photos of injuries, save threatening messages, write down dates.\n`;
    response += `4. Tell someone you trust — a friend, family member, or community leader.\n`;
    response += `5. Report it on SafeSpeak — you can stay completely anonymous:\n   • Click "Report Incident"\n   • Describe what is happening in your own words\n   • A support team reviews your case within 24 hours\n`;
    response += `6. Consider a safety plan — decide where you will go if it escalates, what to take, who to call.\n\n`;
    response += `You deserve to be safe. Are you in a safe place right now?`;
  } else if (isSexual) {
    response += `What happened to you is a crime, and you are incredibly brave for speaking about it.\n\n`;
    response += `1. If it happened recently — try not to shower yet if possible, go to a hospital for medical care and documentation.\n`;
    response += `2. You do not have to file a police report to get medical help.\n`;
    response += `3. Report on SafeSpeak anonymously — describe what happened and our team will connect you with legal aid and counseling.\n`;
    response += `4. Counseling is available — you deserve professional support to process this.\n\n`;
    response += `What do you need most right now — medical help, someone to talk to, or help reporting?`;
  } else if (isChild) {
    response += `A child's safety is the highest priority. Here is what to do immediately:\n\n`;
    response += `1. If the child is in immediate danger, call +251965485715 right now.\n`;
    response += `2. Report on SafeSpeak — describe what you have seen or know. Our team escalates child cases immediately.\n`;
    response += `3. Document what you have observed — dates, injuries, behavior changes.\n`;
    response += `4. Do not confront the abuser directly — this can put the child at greater risk.\n\n`;
    response += `Is the child safe right now?`;
  } else if (isTraffick) {
    response += `This is a critical emergency. Human trafficking requires immediate action.\n\n`;
    response += `1. Call +251965485715 immediately if someone is in immediate danger.\n`;
    response += `2. Do not confront the traffickers — this is dangerous.\n`;
    response += `3. Report on SafeSpeak with as many details as possible — location, descriptions, vehicle details.\n`;
    response += `4. Our team escalates trafficking cases to specialized authorities immediately.\n\n`;
    response += `Are you safe right now?`;
  } else {
    response += `What you are going through sounds like ${abuseType.toLowerCase()}, and you deserve support.\n\n`;
    response += `Here is what you can do:\n\n`;
    response += `1. Make sure you are in a safe place. If in immediate danger, call +251965485715.\n`;
    response += `2. Report it on SafeSpeak — safely and anonymously:\n   • Click "Report Incident"\n   • Describe what is happening in your own words\n   • A trained team reviews your case within 24 hours\n`;
    response += `3. Document what is happening — dates, what was said or done.\n`;
    response += `4. Tell someone you trust — you should not carry this alone.\n\n`;
    response += `What would you like to do first?`;
  }

  return {
    response,
    urgency: 'High',
    resources: [RESOURCES.emergency, RESOURCES.domesticViolence, RESOURCES.crisisText],
    isEmergency: false,
  };
};

module.exports = { classify, chat, loadModel, buildAbuseResponse };
