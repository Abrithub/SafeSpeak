/**
 * SafeSpeak AI Dataset
 * 34 labeled training scenarios covering all abuse types.
 * Each entry: { keywords[], urgency, classification, response, resources[] }
 */

const RESOURCES = {
  emergency:        { name: "SafeSpeak Emergency Line",       contact: "+251965485715",          type: "emergency" },
  suicide:          { name: "SafeSpeak Crisis Support",       contact: "+251987240570",          type: "crisis" },
  domesticViolence: { name: "Domestic Violence Support",      contact: "+251909853958",          type: "support" },
  childAbuse:       { name: "Child Protection Hotline",       contact: "+251909853958",          type: "support" },
  crisisText:       { name: "SafeSpeak WhatsApp Support",     contact: "+251960255733",          type: "crisis" },
  rainn:            { name: "Sexual Assault Support",         contact: "+251965485715",          type: "support" },
  trafficking:      { name: "Human Trafficking Hotline",      contact: "+251986197824",          type: "support" },
  elderAbuse:       { name: "Elder Protection Support",       contact: "+251987240570",          type: "support" },
  trevor:           { name: "Youth Support Line",             contact: "+251909853958",          type: "support" },
  legalAid:         { name: "Legal Aid Support",              contact: "+251986197824",          type: "legal" },
  mentalHealth:     { name: "Mental Health Support",          contact: "+251987240570",          type: "mental" },
  safehouse:        { name: "Safe House / Shelter",           contact: "+251965485715",          type: "shelter" },
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
    response: `What you are experiencing is domestic violence, and it is never your fault. You deserve to be safe.

Here is what you can do right now:

1. If you are in immediate danger, leave the house and go to a neighbor, public place, or call +251965485715 immediately.

2. Document the abuse — take photos of injuries, save threatening messages, write down dates and what happened. This evidence matters.

3. Tell someone you trust — a friend, family member, or community leader. You should not carry this alone.

4. Report it on SafeSpeak:
   • Go to "Report Incident"
   • Describe what is happening in your own words
   • You can stay completely anonymous
   • A trained support team will review your case within 24 hours

5. Consider a safety plan — decide in advance where you will go if things escalate, what you will take, and who you will call.

You are not alone. Many people have been in your situation and found safety and support. What would you like to do first?`,
    resources: [RESOURCES.domesticViolence, RESOURCES.emergency, RESOURCES.safehouse],
  },
  {
    id: 8, urgency: "High", classification: "Domestic Violence",
    keywords: ["being beaten", "partner violent", "afraid of partner", "scared of husband", "scared of wife", "abusive relationship", "hits me", "hit me", "my wife hits", "my husband hits"],
    response: `I hear you, and I want you to know — what is happening to you is wrong. Being hit or hurt by a partner is domestic violence, and it is a crime. This is not your fault.

Right now, here is what matters most:

Are you safe at this moment? If you are in immediate danger, please call +251965485715 or move to a safe location first.

If you are safe right now, here are your next steps:

1. You have the right to report this. SafeSpeak lets you report safely and anonymously. No one will know you reported unless you choose to tell them.

2. How to report:
   • Go to "Report Incident" on SafeSpeak
   • Describe what your partner has been doing to you
   • Our AI will classify it and route it to the right support team
   • You will get a Case ID to track your case

3. Document what is happening — photos of injuries, dates, what was said or done. This helps build your case.

4. Think about a safety plan — where can you go if it gets worse? Who can you call? What documents do you need to take?

5. You can also reach the Domestic Violence Support line at +251909853958 to talk to someone right now.

You deserve safety and respect. I am here to help you through every step. What do you want to do first?`,
    resources: [RESOURCES.domesticViolence, RESOURCES.emergency, RESOURCES.safehouse],
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
    response: `What happened to you is not your fault. Not in any way. You are incredibly brave for speaking about this.

Here is what you should know and what you can do:

1. Your safety first — if you are still in danger or near the person who hurt you, please move to a safe place and call +251965485715.

2. You do not have to face this alone. There are trained people ready to support you right now.

3. If the assault happened recently:
   • Try not to shower or change clothes yet if possible — this preserves evidence
   • Go to a hospital or health center — they can provide medical care and document injuries
   • You do not have to file a police report to get medical help

4. Report on SafeSpeak — you can do this anonymously. Describe what happened and our team will connect you with the right support, including legal aid and counseling.

5. Counseling is available — talking to a professional can help you process what happened. You deserve that support.

What happened to you was a crime. You have every right to seek justice and support. I am here with you. What do you need right now?`,
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
    keywords: ["need help", "don't know what to do", "scared", "confused", "lost", "no one to talk to", "don't know where to start"],
    response: `I'm really glad you reached out — that took courage, and you are not alone.

Here's what you can do right now, one step at a time:

1. Take a breath. You are in a safe space here. Nothing you share will be used against you.

2. Think about your immediate safety. Are you in a safe place right now? If someone is hurting you or threatening you, please move to a public area or a trusted neighbor's home.

3. Talk to someone you trust — a friend, family member, teacher, or community leader. You don't have to face this alone.

4. Report what's happening. SafeSpeak lets you report abuse safely and anonymously. Here's how:
   • Go to the "Report Incident" page
   • Describe what happened in your own words — you don't need to know the exact type of abuse
   • You can stay completely anonymous
   • You'll get a Case ID to track your case

5. If you are in immediate danger right now, call our emergency line immediately.

What is happening to you? Tell me more and I can give you more specific guidance.`,
    resources: [RESOURCES.crisisText, RESOURCES.mentalHealth, RESOURCES.emergency],
  },
  {
    id: 29, urgency: "Low", classification: "Information Request",
    keywords: ["how to report", "where to report", "report abuse", "how do i report", "what should i do", "steps to report"],
    response: `Reporting is a brave and important step. Here is exactly how to do it on SafeSpeak:

Step 1 — Create a free account at /signup
   Your identity is fully protected. It takes less than a minute.

Step 2 — Click "Report Incident"
   You'll find this button on the home page or in the menu.

Step 3 — Describe what happened in your own words
   You do NOT need to know the type of abuse — our AI identifies it automatically from your description.

Step 4 — Upload evidence (optional)
   Photos, videos, or documents can strengthen your case. This is optional.

Step 5 — Choose your privacy setting
   You can stay completely anonymous, or provide contact details to receive updates.

Step 6 — Submit your report
   You will receive a unique Case ID. Save this — you'll need it to track your case.

Step 7 — Track your case anytime
   Go to /track and enter your Case ID + email to see your case status and messages from the support team.

After you submit, a trained support team reviews your case within 24–48 hours. Urgent cases are escalated immediately.

Do you need help with any specific step?`,
    resources: [RESOURCES.crisisText, RESOURCES.legalAid],
  },
  {
    id: 30, urgency: "Low", classification: "Safety Planning",
    keywords: ["safety plan", "how to stay safe", "escape plan", "leave abuser", "how to leave", "want to leave"],
    response: `Creating a safety plan is one of the most important things you can do. Let's go through it together:

Immediate safety right now:
• If you are in danger at this moment, leave the area and go somewhere public or to a trusted person's home.
• Call our emergency line: +251965485715

If you are planning to leave a dangerous situation:
1. Choose a safe time — when the abuser is away or distracted.
2. Pack an emergency bag with: ID documents, phone charger, some cash, a change of clothes, any medications.
3. Tell one trusted person your plan — a friend, relative, or neighbor.
4. Know where you will go — a friend's home, a family member, or a shelter.
5. Save emergency numbers in your phone under a neutral name.

After you are safe:
• Report what happened on SafeSpeak so the support team can help you.
• You can stay completely anonymous.
• The team can connect you with shelters, legal aid, and counseling.

You deserve to be safe. What is your current situation? I can give you more specific guidance.`,
    resources: [RESOURCES.domesticViolence, RESOURCES.safehouse, RESOURCES.crisisText],
  },

  // ── STALKING / HARASSMENT ────────────────────────────────────────────────
  {
    id: 31, urgency: "High", classification: "Stalking",
    keywords: ["stalking", "being followed", "someone following me", "stalker", "watching me", "showing up everywhere"],
    response: `Being stalked is frightening, and you are right to take it seriously. Stalking is illegal and can escalate — your safety matters.

Here is what to do:

1. Document everything — keep a log of every incident: date, time, location, what happened, any witnesses. Save screenshots of messages or calls.

2. Do not engage with the stalker — do not respond to messages or confront them. This can make the situation more dangerous.

3. Tell people around you — let trusted friends, family, neighbors, or your workplace know what is happening so they can watch out for you.

4. Vary your routines — change the times and routes you travel if possible.

5. Secure your accounts — check your phone and social media for any tracking apps or shared location settings. Change your passwords.

6. Report it:
   • Report to SafeSpeak — describe the stalking behavior and our team will help you
   • You can also report to local police — your documentation will be very helpful
   • Legal protection orders (restraining orders) are available

7. If you feel you are in immediate danger right now, call +251965485715 immediately.

You deserve to feel safe. What is happening — is this someone you know?`,
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
