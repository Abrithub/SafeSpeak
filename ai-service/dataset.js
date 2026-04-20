/**
 * SafeSpeak AI Dataset
 * 34 labeled training scenarios covering all abuse types.
 * Each entry: { keywords[], urgency, classification, response, resources[] }
 */

const RESOURCES = {
  emergency:        { name: "Emergency Services",            contact: "911",                    type: "emergency" },
  suicide:          { name: "Suicide Prevention Lifeline",   contact: "988",                    type: "crisis" },
  domesticViolence: { name: "National DV Hotline",           contact: "1-800-799-7233",         type: "support" },
  childAbuse:       { name: "Childhelp National Hotline",    contact: "1-800-422-4453",         type: "support" },
  crisisText:       { name: "Crisis Text Line",              contact: "Text HOME to 741741",    type: "crisis" },
  rainn:            { name: "RAINN Sexual Assault Hotline",  contact: "1-800-656-4673",         type: "support" },
  trafficking:      { name: "Human Trafficking Hotline",     contact: "1-888-373-7888",         type: "support" },
  elderAbuse:       { name: "Eldercare Locator",             contact: "1-800-677-1116",         type: "support" },
  trevor:           { name: "The Trevor Project (LGBTQ+)",   contact: "1-866-488-7386",         type: "support" },
  legalAid:         { name: "Legal Aid Society",             contact: "www.lawhelp.org",        type: "legal" },
  mentalHealth:     { name: "NAMI Mental Health Helpline",   contact: "1-800-950-6264",         type: "mental" },
  safehouse:        { name: "Local Safe House / Shelter",    contact: "Search: shelter near me",type: "shelter" },
};

const DATASET = [
  // ── CRITICAL / SUICIDAL ──────────────────────────────────────────────────
  {
    id: 1, urgency: "Critical", classification: "Suicidal Ideation",
    keywords: ["suicide", "kill myself", "end my life", "want to die", "no reason to live", "better off dead"],
    response: "I hear you, and I'm deeply concerned about your safety right now. You matter, and there are people who want to help. Please reach out immediately.",
    resources: [RESOURCES.suicide, RESOURCES.crisisText, RESOURCES.emergency],
  },
  {
    id: 2, urgency: "Critical", classification: "Suicidal Ideation",
    keywords: ["suicidal", "overdose", "hanging", "self harm", "cutting myself", "hurt myself"],
    response: "Your life has value. What you're feeling is real, but there is help available right now. Please contact a crisis line immediately.",
    resources: [RESOURCES.suicide, RESOURCES.crisisText, RESOURCES.mentalHealth],
  },

  // ── CHILD ABUSE ──────────────────────────────────────────────────────────
  {
    id: 3, urgency: "High", classification: "Child Abuse",
    keywords: ["child abuse", "abusing child", "hurting child", "child being beaten", "child neglect"],
    response: "Child abuse is a serious crime. This child needs immediate protection. Please report this right away.",
    resources: [RESOURCES.childAbuse, RESOURCES.emergency],
  },
  {
    id: 4, urgency: "High", classification: "Child Sexual Abuse",
    keywords: ["child sexual", "molesting child", "child rape", "minor sexual", "underage sexual", "child exploitation"],
    response: "Child sexual abuse is a critical emergency. This requires immediate action to protect the child.",
    resources: [RESOURCES.childAbuse, RESOURCES.emergency, RESOURCES.rainn],
  },
  {
    id: 5, urgency: "High", classification: "Child Labor",
    keywords: ["child labor", "child working", "forced child", "minor working", "child forced to work"],
    response: "Child labor is illegal and harmful. This child deserves protection and education, not exploitation.",
    resources: [RESOURCES.childAbuse, RESOURCES.emergency, RESOURCES.legalAid],
  },
  {
    id: 6, urgency: "Medium", classification: "Child Neglect",
    keywords: ["child neglect", "child alone", "child hungry", "child no food", "child abandoned"],
    response: "Child neglect can be just as harmful as physical abuse. This child needs support and care.",
    resources: [RESOURCES.childAbuse, RESOURCES.emergency],
  },

  // ── DOMESTIC VIOLENCE ────────────────────────────────────────────────────
  {
    id: 7, urgency: "High", classification: "Domestic Violence",
    keywords: ["domestic violence", "partner hitting", "spouse beating", "husband hitting", "wife beating", "partner abuse"],
    response: "Domestic violence is never acceptable. Your safety is the priority. There is help available right now.",
    resources: [RESOURCES.domesticViolence, RESOURCES.emergency, RESOURCES.safehouse],
  },
  {
    id: 8, urgency: "High", classification: "Domestic Violence",
    keywords: ["being beaten", "partner violent", "afraid of partner", "scared of husband", "scared of wife", "abusive relationship"],
    response: "You are not alone, and this is not your fault. Please reach out for help — you deserve to be safe.",
    resources: [RESOURCES.domesticViolence, RESOURCES.crisisText, RESOURCES.safehouse],
  },
  {
    id: 9, urgency: "Medium", classification: "Emotional Abuse",
    keywords: ["emotional abuse", "verbal abuse", "controlling partner", "manipulation", "gaslighting", "psychological abuse"],
    response: "Emotional abuse is real abuse. It can be just as damaging as physical violence. You deserve respect and safety.",
    resources: [RESOURCES.domesticViolence, RESOURCES.mentalHealth, RESOURCES.crisisText],
  },

  // ── SEXUAL ASSAULT ───────────────────────────────────────────────────────
  {
    id: 10, urgency: "High", classification: "Sexual Assault",
    keywords: ["rape", "sexual assault", "sexually assaulted", "raped", "forced sex", "non-consensual"],
    response: "What happened to you is not your fault. You are brave for speaking up. Please seek help — you don't have to go through this alone.",
    resources: [RESOURCES.rainn, RESOURCES.emergency, RESOURCES.crisisText],
  },
  {
    id: 11, urgency: "High", classification: "Sexual Harassment",
    keywords: ["sexual harassment", "harassed sexually", "unwanted touching", "groping", "sexual coercion"],
    response: "Sexual harassment is unacceptable and illegal. You have the right to feel safe. Support is available.",
    resources: [RESOURCES.rainn, RESOURCES.legalAid, RESOURCES.crisisText],
  },

  // ── HUMAN TRAFFICKING ────────────────────────────────────────────────────
  {
    id: 12, urgency: "Critical", classification: "Human Trafficking",
    keywords: ["trafficking", "human trafficking", "sex trafficking", "forced prostitution", "sold", "bought person"],
    response: "Human trafficking is a critical emergency. This person needs immediate rescue and support.",
    resources: [RESOURCES.trafficking, RESOURCES.emergency, RESOURCES.childAbuse],
  },
  {
    id: 13, urgency: "High", classification: "Labor Trafficking",
    keywords: ["labor trafficking", "forced labor", "slavery", "forced to work", "debt bondage", "passport taken"],
    response: "Labor trafficking is modern slavery. This person deserves freedom and protection.",
    resources: [RESOURCES.trafficking, RESOURCES.emergency, RESOURCES.legalAid],
  },

  // ── PHYSICAL ABUSE ───────────────────────────────────────────────────────
  {
    id: 14, urgency: "High", classification: "Physical Abuse",
    keywords: ["physical abuse", "being hit", "punched", "kicked", "beaten", "bruises", "physical violence"],
    response: "Physical abuse is a crime. Your safety matters. Please reach out for help immediately.",
    resources: [RESOURCES.domesticViolence, RESOURCES.emergency, RESOURCES.crisisText],
  },
  {
    id: 15, urgency: "High", classification: "Physical Assault",
    keywords: ["assault", "attacked", "stabbed", "weapon", "threatened with weapon", "gun", "knife"],
    response: "This is a dangerous situation. Please contact emergency services immediately if you are in immediate danger.",
    resources: [RESOURCES.emergency, RESOURCES.domesticViolence, RESOURCES.crisisText],
  },

  // ── ELDER ABUSE ──────────────────────────────────────────────────────────
  {
    id: 16, urgency: "High", classification: "Elder Abuse",
    keywords: ["elder abuse", "elderly abuse", "abusing elderly", "old person abuse", "senior abuse", "nursing home abuse"],
    response: "Elder abuse is a serious crime. Older adults deserve dignity, respect, and safety.",
    resources: [RESOURCES.elderAbuse, RESOURCES.emergency, RESOURCES.legalAid],
  },
  {
    id: 17, urgency: "Medium", classification: "Elder Financial Abuse",
    keywords: ["elder financial", "stealing from elderly", "scamming elderly", "elder fraud", "taking money from elderly"],
    response: "Financial exploitation of elders is illegal. There are resources to help protect and recover.",
    resources: [RESOURCES.elderAbuse, RESOURCES.legalAid, RESOURCES.emergency],
  },

  // ── ONLINE / DIGITAL ABUSE ───────────────────────────────────────────────
  {
    id: 18, urgency: "Medium", classification: "Cyberbullying",
    keywords: ["cyberbullying", "online bullying", "bullied online", "harassment online", "social media harassment"],
    response: "Online harassment is real and harmful. You don't have to face this alone — support is available.",
    resources: [RESOURCES.crisisText, RESOURCES.mentalHealth, RESOURCES.legalAid],
  },
  {
    id: 19, urgency: "High", classification: "Non-Consensual Images",
    keywords: ["revenge porn", "non-consensual images", "intimate images shared", "photos shared without consent", "sextortion"],
    response: "Sharing intimate images without consent is illegal in most places. You have rights and there is help.",
    resources: [RESOURCES.rainn, RESOURCES.legalAid, RESOURCES.crisisText],
  },
  {
    id: 20, urgency: "Medium", classification: "Online Stalking",
    keywords: ["online stalking", "being stalked online", "cyberstalking", "tracking online", "monitoring my accounts"],
    response: "Online stalking is a serious violation of your privacy and safety. Please document everything and seek help.",
    resources: [RESOURCES.domesticViolence, RESOURCES.legalAid, RESOURCES.emergency],
  },

  // ── MENTAL HEALTH ────────────────────────────────────────────────────────
  {
    id: 21, urgency: "High", classification: "Mental Health Crisis",
    keywords: ["mental breakdown", "panic attack", "can't cope", "losing my mind", "mental crisis", "breakdown"],
    response: "What you're experiencing is real and valid. Mental health crises are medical emergencies. Please reach out for support.",
    resources: [RESOURCES.mentalHealth, RESOURCES.crisisText, RESOURCES.suicide],
  },
  {
    id: 22, urgency: "Medium", classification: "Depression",
    keywords: ["depressed", "depression", "hopeless", "worthless", "no hope", "empty inside", "nothing matters"],
    response: "Depression is a real illness, not a weakness. You deserve support and care. Help is available.",
    resources: [RESOURCES.mentalHealth, RESOURCES.crisisText, RESOURCES.suicide],
  },
  {
    id: 23, urgency: "Medium", classification: "Anxiety",
    keywords: ["anxiety", "anxious", "panic", "fear", "terrified", "constant worry", "can't stop worrying"],
    response: "Anxiety can feel overwhelming, but you don't have to manage it alone. Support is available.",
    resources: [RESOURCES.mentalHealth, RESOURCES.crisisText],
  },

  // ── LGBTQ+ SPECIFIC ──────────────────────────────────────────────────────
  {
    id: 24, urgency: "High", classification: "LGBTQ+ Abuse",
    keywords: ["lgbtq abuse", "gay abuse", "trans abuse", "homophobic attack", "transphobic", "hate crime lgbtq"],
    response: "LGBTQ+ individuals deserve safety and respect. Hate-based abuse is a crime. Support is here for you.",
    resources: [RESOURCES.trevor, RESOURCES.emergency, RESOURCES.crisisText],
  },
  {
    id: 25, urgency: "High", classification: "LGBTQ+ Youth Crisis",
    keywords: ["kicked out gay", "homeless lgbtq", "family rejected", "disowned lgbtq", "conversion therapy"],
    response: "You are valid and loved. Being rejected for who you are is deeply painful. Specialized support is available.",
    resources: [RESOURCES.trevor, RESOURCES.crisisText, RESOURCES.safehouse],
  },

  // ── WORKPLACE ABUSE ──────────────────────────────────────────────────────
  {
    id: 26, urgency: "Medium", classification: "Workplace Harassment",
    keywords: ["workplace harassment", "boss harassing", "coworker harassment", "work abuse", "hostile work environment"],
    response: "Workplace harassment is illegal. You have rights and there are legal protections available to you.",
    resources: [RESOURCES.legalAid, RESOURCES.crisisText, RESOURCES.mentalHealth],
  },
  {
    id: 27, urgency: "Medium", classification: "Workplace Discrimination",
    keywords: ["work discrimination", "fired unfairly", "racial discrimination work", "gender discrimination", "disability discrimination"],
    response: "Workplace discrimination is illegal. You have the right to a fair and safe work environment.",
    resources: [RESOURCES.legalAid, RESOURCES.crisisText],
  },

  // ── GENERAL SUPPORT ──────────────────────────────────────────────────────
  {
    id: 28, urgency: "Low", classification: "General Support",
    keywords: ["need help", "don't know what to do", "scared", "confused", "lost", "no one to talk to"],
    response: "Reaching out takes courage. You are not alone. Let's figure out the best way to support you.",
    resources: [RESOURCES.crisisText, RESOURCES.mentalHealth],
  },
  {
    id: 29, urgency: "Low", classification: "Information Request",
    keywords: ["how to report", "where to report", "report abuse", "how do i report", "what should i do"],
    response: "Reporting abuse is an important step. I can guide you through the process and connect you with the right resources.",
    resources: [RESOURCES.crisisText, RESOURCES.legalAid],
  },
  {
    id: 30, urgency: "Low", classification: "Safety Planning",
    keywords: ["safety plan", "how to stay safe", "escape plan", "leave abuser", "how to leave"],
    response: "Creating a safety plan is a smart and brave step. Let's work through this together to keep you safe.",
    resources: [RESOURCES.domesticViolence, RESOURCES.safehouse, RESOURCES.crisisText],
  },

  // ── STALKING / HARASSMENT ────────────────────────────────────────────────
  {
    id: 31, urgency: "High", classification: "Stalking",
    keywords: ["stalking", "being followed", "someone following me", "stalker", "watching me", "showing up everywhere"],
    response: "Stalking is dangerous and illegal. Please document all incidents and contact authorities.",
    resources: [RESOURCES.emergency, RESOURCES.domesticViolence, RESOURCES.legalAid],
  },
  {
    id: 32, urgency: "Medium", classification: "Harassment",
    keywords: ["harassment", "being harassed", "threatening messages", "threatening calls", "intimidation"],
    response: "Harassment is illegal. You have the right to feel safe. Document everything and seek help.",
    resources: [RESOURCES.legalAid, RESOURCES.emergency, RESOURCES.crisisText],
  },

  // ── SUBSTANCE ABUSE RELATED ──────────────────────────────────────────────
  {
    id: 33, urgency: "Medium", classification: "Substance Abuse",
    keywords: ["drug abuse", "alcohol abuse", "addiction", "substance abuse", "overdose risk", "drug problem"],
    response: "Substance abuse affects many people and recovery is possible. Reaching out is the first step.",
    resources: [RESOURCES.mentalHealth, RESOURCES.crisisText, RESOURCES.emergency],
  },

  // ── HOUSING / HOMELESSNESS ───────────────────────────────────────────────
  {
    id: 34, urgency: "Medium", classification: "Housing Crisis",
    keywords: ["homeless", "no shelter", "kicked out", "evicted", "nowhere to go", "no place to stay"],
    response: "Everyone deserves a safe place to stay. There are shelters and resources that can help you right now.",
    resources: [RESOURCES.safehouse, RESOURCES.crisisText, RESOURCES.legalAid],
  },
];

module.exports = { DATASET, RESOURCES };
