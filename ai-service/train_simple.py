"""
SafeSpeak Simple ML Trainer
No external dependencies — uses only Python standard library.
Implements Naive Bayes classifier from scratch.
"""
import json, math, re, pathlib, pickle

# ── Training data ─────────────────────────────────────────────────────────────
DATASET = [
    ("I was raped by my neighbor last night", "Sexual Assault"),
    ("He forced me to have sex with him", "Sexual Assault"),
    ("She was sexually assaulted on her way home", "Sexual Assault"),
    ("My uncle touched me inappropriately", "Sexual Assault"),
    ("I was drugged and sexually violated", "Sexual Assault"),
    ("He penetrated me without my consent", "Sexual Assault"),
    ("She was gang raped by three men", "Sexual Assault"),
    ("My boss forced himself on me after work", "Sexual Assault"),
    ("I was attacked and raped in the park", "Sexual Assault"),
    ("He attempted to rape me but I escaped", "Sexual Assault"),
    ("My husband forces me to have sex when I say no", "Sexual Assault"),
    ("She was sexually abused by her stepfather for years", "Sexual Assault"),
    ("ጾታዊ ጥቃት ደረሰብኝ", "Sexual Assault"),
    ("gudeeduu dirqisiisuu", "Sexual Assault"),

    ("My husband beats me every night when he comes home drunk", "Domestic Violence"),
    ("My wife hits me with objects when she gets angry", "Domestic Violence"),
    ("My partner threatens to kill me if I leave", "Domestic Violence"),
    ("He chokes me during arguments and I am scared", "Domestic Violence"),
    ("My boyfriend punches me and then apologizes", "Domestic Violence"),
    ("She throws things at me and scratches my face", "Domestic Violence"),
    ("My husband controls all the money and I cannot buy food", "Domestic Violence"),
    ("He does not allow me to visit my family or friends", "Domestic Violence"),
    ("My partner monitors my phone and reads all my messages", "Domestic Violence"),
    ("He threatened to take the children if I report him", "Domestic Violence"),
    ("My wife burns me with cigarettes when she is angry", "Domestic Violence"),
    ("He locks me in the house and takes my phone", "Domestic Violence"),
    ("ባሌ ይደበድበኛል", "Domestic Violence"),
    ("dhiirsi na rukutu", "Domestic Violence"),

    ("The neighbor is beating his child every day", "Child Abuse"),
    ("I can hear a child crying and screaming next door every night", "Child Abuse"),
    ("A child in my building has bruises all over her body", "Child Abuse"),
    ("The parents lock their child outside in the cold", "Child Abuse"),
    ("A child is not being fed and looks very thin and sick", "Child Abuse"),
    ("The father burns the child with cigarettes as punishment", "Child Abuse"),
    ("A child is being beaten with a belt by her mother", "Child Abuse"),
    ("The child has not been to school in months and looks neglected", "Child Abuse"),
    ("A young child is being used as a servant in a house", "Child Abuse"),
    ("ህፃን ይደበደባል", "Child Abuse"),
    ("daa'ima reebuu", "Child Abuse"),

    ("A girl was promised a job abroad but is now forced into prostitution", "Human Trafficking"),
    ("Young women are being recruited and sold to men in another city", "Human Trafficking"),
    ("My passport was taken and I am forced to work without pay", "Human Trafficking"),
    ("A man is transporting young girls across the border for exploitation", "Human Trafficking"),
    ("She was lured with a job offer and is now trapped in a house", "Human Trafficking"),
    ("Children are being sold by their parents to work in factories", "Human Trafficking"),
    ("He controls several women and takes all the money they earn", "Human Trafficking"),
    ("ሰው ይሸጣሉ", "Human Trafficking"),
    ("gurgurtaa namaa", "Human Trafficking"),

    ("My father hits me with a belt when I make mistakes", "Physical Abuse"),
    ("My teacher slaps students in class regularly", "Physical Abuse"),
    ("I was beaten by a group of people on the street", "Physical Abuse"),
    ("My brother kicks me and punches me during arguments", "Physical Abuse"),
    ("She slapped me hard across the face in public", "Physical Abuse"),
    ("He pushed me down the stairs and I hurt my back", "Physical Abuse"),
    ("I have bruises on my arms from being grabbed", "Physical Abuse"),
    ("ደበደበኝ", "Physical Abuse"),
    ("na reebuu", "Physical Abuse"),

    ("My partner constantly tells me I am worthless and stupid", "Emotional Abuse"),
    ("She humiliates me in front of family and friends every day", "Emotional Abuse"),
    ("He makes me feel like I am crazy and imagining things", "Emotional Abuse"),
    ("My mother tells me she wishes I was never born", "Emotional Abuse"),
    ("He controls everything I do and isolates me from everyone", "Emotional Abuse"),
    ("She screams at me for hours and blames me for everything", "Emotional Abuse"),
    ("ያዋርደኛል", "Emotional Abuse"),
    ("jechaan miidhuu", "Emotional Abuse"),

    ("My boss keeps touching my shoulder and making sexual comments", "Sexual Harassment"),
    ("A coworker sends me sexual messages and photos I did not ask for", "Sexual Harassment"),
    ("My teacher makes inappropriate sexual jokes in class", "Sexual Harassment"),
    ("A man on the bus groped me and ran away", "Sexual Harassment"),
    ("My landlord demands sexual favors in exchange for not raising rent", "Sexual Harassment"),
    ("ጾታዊ ትንኮሳ", "Sexual Harassment"),
    ("hirmaannaa saalaa dirqisiisuu", "Sexual Harassment"),

    ("Someone posted my private photos online without my permission", "Online Abuse"),
    ("I am being blackmailed with intimate images someone took of me", "Online Abuse"),
    ("A person created a fake profile using my photos to harass people", "Online Abuse"),
    ("I receive death threats on social media every day", "Online Abuse"),
    ("My ex is sharing our private videos online to humiliate me", "Online Abuse"),
    ("ፎቶ ተሰራጨ", "Online Abuse"),
    ("suuraa malee raabsuu", "Online Abuse"),

    ("A child of about ten years old is working in a factory near my house", "Child Labor"),
    ("Young children are carrying heavy loads at a construction site", "Child Labor"),
    ("A girl of eight is working as a house servant and not going to school", "Child Labor"),
    ("Children are being used to sell goods on the street late at night", "Child Labor"),
    ("ህፃን ሰራተኛ", "Child Labor"),
    ("daa'ima hojjisiisuu", "Child Labor"),

    ("An elderly person in my neighborhood has not eaten in days", "Neglect"),
    ("A child is always dirty and wearing torn clothes in cold weather", "Neglect"),
    ("The parents leave their baby alone for long periods without care", "Neglect"),
    ("An old woman is being left without food or medicine by her family", "Neglect"),
    ("ቸልተኝነት", "Neglect"),
    ("kunuunsa dhabuu", "Neglect"),
]

# ── Tokenizer ─────────────────────────────────────────────────────────────────
def tokenize(text):
    text = text.lower()
    tokens = re.findall(r'[\w\u1200-\u137F]+', text)
    return tokens

# ── Naive Bayes Classifier ────────────────────────────────────────────────────
class NaiveBayesClassifier:
    def __init__(self):
        self.class_probs = {}
        self.word_probs = {}
        self.classes = []
        self.vocab = set()

    def train(self, sentences, labels):
        self.classes = list(set(labels))
        class_counts = {c: 0 for c in self.classes}
        word_counts = {c: {} for c in self.classes}

        for sentence, label in zip(sentences, labels):
            class_counts[label] += 1
            for word in tokenize(sentence):
                self.vocab.add(word)
                word_counts[label][word] = word_counts[label].get(word, 0) + 1

        total = len(labels)
        self.class_probs = {c: math.log(class_counts[c] / total) for c in self.classes}

        # Laplace smoothing
        vocab_size = len(self.vocab)
        self.word_probs = {}
        for c in self.classes:
            total_words = sum(word_counts[c].values()) + vocab_size
            self.word_probs[c] = {}
            for word in self.vocab:
                count = word_counts[c].get(word, 0) + 1
                self.word_probs[c][word] = math.log(count / total_words)

    def predict(self, sentence):
        tokens = tokenize(sentence)
        scores = {}
        for c in self.classes:
            score = self.class_probs[c]
            for word in tokens:
                if word in self.word_probs[c]:
                    score += self.word_probs[c][word]
            scores[c] = score

        # Softmax-like normalization for confidence
        max_score = max(scores.values())
        exp_scores = {c: math.exp(scores[c] - max_score) for c in self.classes}
        total_exp = sum(exp_scores.values())
        probs = {c: exp_scores[c] / total_exp for c in self.classes}

        best_class = max(probs, key=probs.get)
        return best_class, probs[best_class], sorted(probs.items(), key=lambda x: -x[1])[:3]

# ── Train ─────────────────────────────────────────────────────────────────────
print("Training SafeSpeak Naive Bayes Classifier...")
sentences, labels = zip(*DATASET)
clf = NaiveBayesClassifier()
clf.train(sentences, labels)
print(f"Trained on {len(sentences)} sentences")
print(f"Classes: {clf.classes}")
print(f"Vocabulary size: {len(clf.vocab)}")

# ── Evaluate on held-out examples ─────────────────────────────────────────────
test_cases = [
    ("My husband beats me every night and threatens to kill me", "Domestic Violence"),
    ("A child in my building has bruises and is not going to school", "Child Abuse"),
    ("I was raped by my coworker after a work event", "Sexual Assault"),
    ("Young girls are being sold and forced into prostitution", "Human Trafficking"),
    ("My boss keeps touching me and making sexual comments at work", "Sexual Harassment"),
    ("Someone posted my private photos online to blackmail me", "Online Abuse"),
]

correct = 0
print("\n── Test Results ─────────────────────────────────────────────")
for text, expected in test_cases:
    pred, conf, top3 = clf.predict(text)
    ok = "✅" if pred == expected else "❌"
    print(f"  {ok} [{int(conf*100)}%] {pred:<25} ← \"{text[:55]}\"")
    if pred == expected:
        correct += 1

print(f"\nAccuracy: {correct}/{len(test_cases)} = {int(correct/len(test_cases)*100)}%")

# ── Save model ────────────────────────────────────────────────────────────────
out_dir = pathlib.Path(__file__).parent
model_data = {
    'class_probs': clf.class_probs,
    'word_probs': clf.word_probs,
    'classes': clf.classes,
    'vocab': list(clf.vocab),
}

with open(out_dir / 'classifier_nb.pkl', 'wb') as f:
    pickle.dump(clf, f)

with open(out_dir / 'classes.json', 'w', encoding='utf-8') as f:
    json.dump(clf.classes, f)

print(f"\n✅ Model saved → classifier_nb.pkl")
print(f"✅ Classes saved → classes.json")
print("\nDone! Run ml_server_simple.py to start the API.")
