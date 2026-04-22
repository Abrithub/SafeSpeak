/**
 * SafeSpeak Model Generator
 * Trains a Naive Bayes classifier in pure Node.js
 * and saves the model as JSON — no Python needed.
 *
 * Run: node generate_model.js
 */

const fs = require('fs');
const path = require('path');

// ── Training data ─────────────────────────────────────────────────────────────
const DATASET = [
  ["I was raped by my neighbor last night", "Sexual Assault"],
  ["He forced me to have sex with him", "Sexual Assault"],
  ["She was sexually assaulted on her way home", "Sexual Assault"],
  ["My uncle touched me inappropriately when I was alone", "Sexual Assault"],
  ["I was drugged and sexually violated at a party", "Sexual Assault"],
  ["He penetrated me without my consent", "Sexual Assault"],
  ["She was gang raped by three men", "Sexual Assault"],
  ["My boss forced himself on me after work", "Sexual Assault"],
  ["I was attacked and raped in the park", "Sexual Assault"],
  ["He attempted to rape me but I escaped", "Sexual Assault"],
  ["My husband forces me to have sex even when I say no", "Sexual Assault"],
  ["She was sexually abused by her stepfather for years", "Sexual Assault"],
  ["ጾታዊ ጥቃት ደረሰብኝ", "Sexual Assault"],
  ["gudeeduu dirqisiisuu", "Sexual Assault"],
  ["I was coerced into sexual acts by my employer", "Sexual Assault"],
  ["He violated me sexually while I was unconscious", "Sexual Assault"],

  ["My husband beats me every night when he comes home drunk", "Domestic Violence"],
  ["My wife hits me with objects when she gets angry", "Domestic Violence"],
  ["My partner threatens to kill me if I leave", "Domestic Violence"],
  ["He chokes me during arguments and I am scared", "Domestic Violence"],
  ["My boyfriend punches me and then apologizes", "Domestic Violence"],
  ["She throws things at me and scratches my face", "Domestic Violence"],
  ["My husband controls all the money and I cannot buy food", "Domestic Violence"],
  ["He does not allow me to visit my family or friends", "Domestic Violence"],
  ["My partner monitors my phone and reads all my messages", "Domestic Violence"],
  ["He threatened to take the children if I report him", "Domestic Violence"],
  ["My wife burns me with cigarettes when she is angry", "Domestic Violence"],
  ["He locks me in the house and takes my phone", "Domestic Violence"],
  ["ባሌ ይደበድበኛል", "Domestic Violence"],
  ["dhiirsi na rukutu", "Domestic Violence"],
  ["My partner forced me to quit my job so I depend on him", "Domestic Violence"],
  ["She hits me in front of the children regularly", "Domestic Violence"],

  ["The neighbor is beating his child every day", "Child Abuse"],
  ["I can hear a child crying and screaming next door every night", "Child Abuse"],
  ["A child in my building has bruises all over her body", "Child Abuse"],
  ["The parents lock their child outside in the cold", "Child Abuse"],
  ["A child is not being fed and looks very thin and sick", "Child Abuse"],
  ["The father burns the child with cigarettes as punishment", "Child Abuse"],
  ["A child is being beaten with a belt by her mother", "Child Abuse"],
  ["The child has not been to school in months and looks neglected", "Child Abuse"],
  ["A young child is being used as a servant in a house", "Child Abuse"],
  ["ህፃን ይደበደባል", "Child Abuse"],
  ["daa'ima reebuu", "Child Abuse"],
  ["A child told me her father hits her with a stick", "Child Abuse"],
  ["The child has visible injuries and says her uncle hurts her", "Child Abuse"],

  ["A girl was promised a job abroad but is now forced into prostitution", "Human Trafficking"],
  ["Young women are being recruited and sold to men in another city", "Human Trafficking"],
  ["My passport was taken and I am forced to work without pay", "Human Trafficking"],
  ["A man is transporting young girls across the border for exploitation", "Human Trafficking"],
  ["She was lured with a job offer and is now trapped in a house", "Human Trafficking"],
  ["Children are being sold by their parents to work in factories", "Human Trafficking"],
  ["He controls several women and takes all the money they earn", "Human Trafficking"],
  ["ሰው ይሸጣሉ", "Human Trafficking"],
  ["gurgurtaa namaa", "Human Trafficking"],
  ["She cannot leave because they have her documents and threaten her family", "Human Trafficking"],

  ["My father hits me with a belt when I make mistakes", "Physical Abuse"],
  ["My teacher slaps students in class regularly", "Physical Abuse"],
  ["I was beaten by a group of people on the street", "Physical Abuse"],
  ["My brother kicks me and punches me during arguments", "Physical Abuse"],
  ["She slapped me hard across the face in public", "Physical Abuse"],
  ["He pushed me down the stairs and I hurt my back", "Physical Abuse"],
  ["I have bruises on my arms from being grabbed and squeezed", "Physical Abuse"],
  ["ደበደበኝ", "Physical Abuse"],
  ["na reebuu", "Physical Abuse"],
  ["She threw a glass at me and it cut my face", "Physical Abuse"],

  ["My partner constantly tells me I am worthless and stupid", "Emotional Abuse"],
  ["She humiliates me in front of family and friends every day", "Emotional Abuse"],
  ["He makes me feel like I am crazy and imagining things", "Emotional Abuse"],
  ["My mother tells me she wishes I was never born", "Emotional Abuse"],
  ["He controls everything I do and isolates me from everyone", "Emotional Abuse"],
  ["She screams at me for hours and blames me for everything", "Emotional Abuse"],
  ["ያዋርደኛል", "Emotional Abuse"],
  ["jechaan miidhuu", "Emotional Abuse"],
  ["He gaslights me and denies things he clearly said and did", "Emotional Abuse"],

  ["My boss keeps touching my shoulder and making sexual comments", "Sexual Harassment"],
  ["A coworker sends me sexual messages and photos I did not ask for", "Sexual Harassment"],
  ["My teacher makes inappropriate sexual jokes in class", "Sexual Harassment"],
  ["A man on the bus groped me and ran away", "Sexual Harassment"],
  ["My landlord demands sexual favors in exchange for not raising rent", "Sexual Harassment"],
  ["ጾታዊ ትንኮሳ", "Sexual Harassment"],
  ["hirmaannaa saalaa dirqisiisuu", "Sexual Harassment"],
  ["My supervisor implies I will get promoted if I sleep with him", "Sexual Harassment"],

  ["Someone posted my private photos online without my permission", "Online Abuse"],
  ["I am being blackmailed with intimate images someone took of me", "Online Abuse"],
  ["A person created a fake profile using my photos to harass people", "Online Abuse"],
  ["I receive death threats on social media every day", "Online Abuse"],
  ["My ex is sharing our private videos online to humiliate me", "Online Abuse"],
  ["ፎቶ ተሰራጨ", "Online Abuse"],
  ["suuraa malee raabsuu", "Online Abuse"],
  ["Someone hacked my accounts and is sending messages to my contacts", "Online Abuse"],

  ["A child of about ten years old is working in a factory near my house", "Child Labor"],
  ["Young children are carrying heavy loads at a construction site", "Child Labor"],
  ["A girl of eight is working as a house servant and not going to school", "Child Labor"],
  ["Children are being used to sell goods on the street late at night", "Child Labor"],
  ["ህፃን ሰራተኛ", "Child Labor"],
  ["daa'ima hojjisiisuu", "Child Labor"],
  ["A boy is working in a garage doing dangerous work instead of school", "Child Labor"],

  ["An elderly person in my neighborhood has not eaten in days", "Neglect"],
  ["A child is always dirty and wearing torn clothes in cold weather", "Neglect"],
  ["The parents leave their baby alone for long periods without care", "Neglect"],
  ["An old woman is being left without food or medicine by her family", "Neglect"],
  ["ቸልተኝነት", "Neglect"],
  ["kunuunsa dhabuu", "Neglect"],
  ["A disabled person is being left without any assistance or care", "Neglect"],
];

// ── Tokenizer ─────────────────────────────────────────────────────────────────
const tokenize = (text) =>
  text.toLowerCase().replace(/[^\w\u1200-\u137F\s]/g, ' ').split(/\s+/).filter(Boolean);

// ── Naive Bayes Training ──────────────────────────────────────────────────────
const classes = [...new Set(DATASET.map(d => d[1]))];
const classCounts = {};
const wordCounts = {};
const vocab = new Set();

classes.forEach(c => { classCounts[c] = 0; wordCounts[c] = {}; });

DATASET.forEach(([sentence, label]) => {
  classCounts[label]++;
  tokenize(sentence).forEach(word => {
    vocab.add(word);
    wordCounts[label][word] = (wordCounts[label][word] || 0) + 1;
  });
});

const total = DATASET.length;
const vocabSize = vocab.size;

// Log probabilities with Laplace smoothing
const classLogProbs = {};
const wordLogProbs = {};

classes.forEach(c => {
  classLogProbs[c] = Math.log(classCounts[c] / total);
  const totalWords = Object.values(wordCounts[c]).reduce((a, b) => a + b, 0) + vocabSize;
  wordLogProbs[c] = {};
  vocab.forEach(word => {
    const count = (wordCounts[c][word] || 0) + 1;
    wordLogProbs[c][word] = Math.log(count / totalWords);
  });
});

// ── Predict function ──────────────────────────────────────────────────────────
const predict = (text) => {
  const tokens = tokenize(text);
  const scores = {};
  classes.forEach(c => {
    let score = classLogProbs[c];
    tokens.forEach(word => {
      if (wordLogProbs[c][word]) score += wordLogProbs[c][word];
    });
    scores[c] = score;
  });

  const maxScore = Math.max(...Object.values(scores));
  const expScores = {};
  classes.forEach(c => { expScores[c] = Math.exp(scores[c] - maxScore); });
  const totalExp = Object.values(expScores).reduce((a, b) => a + b, 0);
  const probs = {};
  classes.forEach(c => { probs[c] = expScores[c] / totalExp; });

  const sorted = Object.entries(probs).sort((a, b) => b[1] - a[1]);
  return { label: sorted[0][0], confidence: sorted[0][1], top3: sorted.slice(0, 3) };
};

// ── Evaluate ──────────────────────────────────────────────────────────────────
const testCases = [
  ["My husband beats me every night and threatens to kill me", "Domestic Violence"],
  ["A child in my building has bruises and is not going to school", "Child Abuse"],
  ["I was raped by my coworker after a work event", "Sexual Assault"],
  ["Young girls are being sold and forced into prostitution", "Human Trafficking"],
  ["My boss keeps touching me and making sexual comments at work", "Sexual Harassment"],
  ["Someone posted my private photos online to blackmail me", "Online Abuse"],
  ["ባሌ ይደበድበኛል", "Domestic Violence"],
  ["daa'ima reebuu", "Child Abuse"],
];

console.log('Training SafeSpeak Naive Bayes Classifier (Node.js)...');
console.log(`Training samples: ${DATASET.length}`);
console.log(`Classes: ${classes.join(', ')}`);
console.log(`Vocabulary: ${vocabSize} words`);
console.log('\n── Test Results ─────────────────────────────────────────────');

let correct = 0;
testCases.forEach(([text, expected]) => {
  const { label, confidence } = predict(text);
  const ok = label === expected ? '✅' : '❌';
  if (label === expected) correct++;
  console.log(`  ${ok} [${Math.round(confidence * 100)}%] ${label.padEnd(25)} ← "${text.slice(0, 55)}"`);
});

console.log(`\nAccuracy: ${correct}/${testCases.length} = ${Math.round(correct/testCases.length*100)}%`);

// ── Save model as JSON ────────────────────────────────────────────────────────
const model = { classLogProbs, wordLogProbs, classes, vocabSize };
const outDir = __dirname;

fs.writeFileSync(path.join(outDir, 'classifier_nb.json'), JSON.stringify(model));
fs.writeFileSync(path.join(outDir, 'classes.json'), JSON.stringify(classes));

console.log('\n✅ Model saved → classifier_nb.json');
console.log('✅ Classes saved → classes.json');
console.log('\nML model is ready. The Node.js AI service will use it automatically.');
