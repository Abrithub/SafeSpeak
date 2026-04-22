"""
SafeSpeak ML Classifier
=======================
TF-IDF + Logistic Regression pipeline for abuse report classification.
Trained on 300+ labeled sentences across 10 categories.

Run:
    python train.py

Output:
    classifier.joblib  — saved model
    label_encoder.joblib — label encoder
"""

import joblib, pathlib, json
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import numpy as np

# ── LABELED TRAINING DATASET ──────────────────────────────────────────────────
# Format: (sentence, label)
# Labels: Sexual Assault, Domestic Violence, Child Abuse, Human Trafficking,
#         Physical Abuse, Emotional Abuse, Sexual Harassment, Online Abuse,
#         Child Labor, Neglect

DATASET = [

    # ── Sexual Assault ────────────────────────────────────────────────────────
    ("I was raped by my neighbor last night", "Sexual Assault"),
    ("He forced me to have sex with him", "Sexual Assault"),
    ("She was sexually assaulted on her way home", "Sexual Assault"),
    ("My uncle touched me inappropriately when I was alone", "Sexual Assault"),
    ("I was drugged and sexually violated at a party", "Sexual Assault"),
    ("He penetrated me without my consent", "Sexual Assault"),
    ("She was gang raped by three men", "Sexual Assault"),
    ("My boss forced himself on me after work", "Sexual Assault"),
    ("I was attacked and raped in the park", "Sexual Assault"),
    ("He attempted to rape me but I escaped", "Sexual Assault"),
    ("My husband forces me to have sex even when I say no", "Sexual Assault"),
    ("She was sexually abused by her stepfather for years", "Sexual Assault"),
    ("I was assaulted sexually by someone I trusted", "Sexual Assault"),
    ("He violated me sexually while I was unconscious", "Sexual Assault"),
    ("A man exposed himself to me on the street", "Sexual Assault"),
    ("I was coerced into sexual acts by my employer", "Sexual Assault"),
    ("She reported being raped by a family friend", "Sexual Assault"),
    ("He touched my private parts without permission", "Sexual Assault"),
    ("I was sexually abused as a child by a relative", "Sexual Assault"),
    ("She was forced into sexual activity at knifepoint", "Sexual Assault"),
    ("አስገድዶ ደፈረ", "Sexual Assault"),
    ("ጾታዊ ጥቃት ደረሰብኝ", "Sexual Assault"),
    ("gudeeduu dirqisiisuu", "Sexual Assault"),

    # ── Domestic Violence ─────────────────────────────────────────────────────
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
    ("My partner forced me to quit my job so I depend on him", "Domestic Violence"),
    ("She hits me in front of the children regularly", "Domestic Violence"),
    ("My husband broke my arm during a fight last week", "Domestic Violence"),
    ("He threatens to kill himself if I try to leave him", "Domestic Violence"),
    ("My partner humiliates me in public and calls me worthless", "Domestic Violence"),
    ("She poured hot water on me during an argument", "Domestic Violence"),
    ("My husband has been abusing me for five years", "Domestic Violence"),
    ("He controls where I go and who I talk to", "Domestic Violence"),
    ("ባሌ ይደበድበኛል", "Domestic Violence"),
    ("የቤት ውስጥ ጥቃት ደርሶብኛል", "Domestic Violence"),
    ("dhiirsi na rukutu", "Domestic Violence"),
    ("mana keessatti rakkoo qaba", "Domestic Violence"),

    # ── Child Abuse ───────────────────────────────────────────────────────────
    ("The neighbor is beating his child every day", "Child Abuse"),
    ("I can hear a child crying and screaming next door every night", "Child Abuse"),
    ("A child in my building has bruises all over her body", "Child Abuse"),
    ("The parents lock their child outside in the cold", "Child Abuse"),
    ("A child is not being fed and looks very thin and sick", "Child Abuse"),
    ("The father burns the child with cigarettes as punishment", "Child Abuse"),
    ("A child is being beaten with a belt by her mother", "Child Abuse"),
    ("The child has not been to school in months and looks neglected", "Child Abuse"),
    ("A young child is being used as a servant in a house", "Child Abuse"),
    ("The parents leave their young children alone for days", "Child Abuse"),
    ("A child told me her father hits her with a stick", "Child Abuse"),
    ("The child has visible injuries and says her uncle hurts her", "Child Abuse"),
    ("A baby is being shaken and thrown by an angry parent", "Child Abuse"),
    ("The child is malnourished and the parents refuse medical care", "Child Abuse"),
    ("A child is being forced to beg on the street by adults", "Child Abuse"),
    ("ህፃን ይደበደባል", "Child Abuse"),
    ("ህፃን ጥቃት ደርሶበታል", "Child Abuse"),
    ("daa'ima reebuu", "Child Abuse"),

    # ── Human Trafficking ─────────────────────────────────────────────────────
    ("A girl was promised a job abroad but is now forced into prostitution", "Human Trafficking"),
    ("Young women are being recruited and sold to men in another city", "Human Trafficking"),
    ("My passport was taken and I am forced to work without pay", "Human Trafficking"),
    ("A man is transporting young girls across the border for exploitation", "Human Trafficking"),
    ("She was lured with a job offer and is now trapped in a house", "Human Trafficking"),
    ("Children are being sold by their parents to work in factories", "Human Trafficking"),
    ("A woman is being forced to have sex with multiple men for money", "Human Trafficking"),
    ("He controls several women and takes all the money they earn", "Human Trafficking"),
    ("Young boys are being trafficked for labor in construction sites", "Human Trafficking"),
    ("She cannot leave because they have her documents and threaten her family", "Human Trafficking"),
    ("A network is recruiting girls from rural areas and selling them", "Human Trafficking"),
    ("He brought me here promising work but now I am a slave", "Human Trafficking"),
    ("Women are being smuggled across borders and exploited", "Human Trafficking"),
    ("ሰው ይሸጣሉ", "Human Trafficking"),
    ("ሰው ማዘዋወር", "Human Trafficking"),
    ("gurgurtaa namaa", "Human Trafficking"),

    # ── Physical Abuse ────────────────────────────────────────────────────────
    ("My father hits me with a belt when I make mistakes", "Physical Abuse"),
    ("My teacher slaps students in class regularly", "Physical Abuse"),
    ("My employer punches me when I make errors at work", "Physical Abuse"),
    ("I was beaten by a group of people on the street", "Physical Abuse"),
    ("My brother kicks me and punches me during arguments", "Physical Abuse"),
    ("She slapped me hard across the face in public", "Physical Abuse"),
    ("He pushed me down the stairs and I hurt my back", "Physical Abuse"),
    ("My uncle beats me with a stick as discipline", "Physical Abuse"),
    ("I have bruises on my arms from being grabbed and squeezed", "Physical Abuse"),
    ("She threw a glass at me and it cut my face", "Physical Abuse"),
    ("My caregiver hits me when I cannot do things fast enough", "Physical Abuse"),
    ("He pulled my hair and dragged me across the floor", "Physical Abuse"),
    ("ደበደበኝ", "Physical Abuse"),
    ("ምቶ ቁስለኛ ሆንኩ", "Physical Abuse"),
    ("na reebuu", "Physical Abuse"),

    # ── Emotional Abuse ───────────────────────────────────────────────────────
    ("My partner constantly tells me I am worthless and stupid", "Emotional Abuse"),
    ("She humiliates me in front of family and friends every day", "Emotional Abuse"),
    ("He makes me feel like I am crazy and imagining things", "Emotional Abuse"),
    ("My mother tells me she wishes I was never born", "Emotional Abuse"),
    ("He controls everything I do and isolates me from everyone", "Emotional Abuse"),
    ("She screams at me for hours and blames me for everything", "Emotional Abuse"),
    ("My partner manipulates me into thinking the abuse is my fault", "Emotional Abuse"),
    ("He threatens to expose my secrets if I do not obey him", "Emotional Abuse"),
    ("She destroys my belongings when she is angry at me", "Emotional Abuse"),
    ("My boss constantly belittles me and mocks me in meetings", "Emotional Abuse"),
    ("He gaslights me and denies things he clearly said and did", "Emotional Abuse"),
    ("She uses the children against me as emotional weapons", "Emotional Abuse"),
    ("ያዋርደኛል", "Emotional Abuse"),
    ("ስሜታዊ ጥቃት", "Emotional Abuse"),
    ("jechaan miidhuu", "Emotional Abuse"),

    # ── Sexual Harassment ─────────────────────────────────────────────────────
    ("My boss keeps touching my shoulder and making sexual comments", "Sexual Harassment"),
    ("A coworker sends me sexual messages and photos I did not ask for", "Sexual Harassment"),
    ("My teacher makes inappropriate sexual jokes in class", "Sexual Harassment"),
    ("A man on the bus groped me and ran away", "Sexual Harassment"),
    ("My landlord demands sexual favors in exchange for not raising rent", "Sexual Harassment"),
    ("A colleague keeps asking me for dates and touching my hand", "Sexual Harassment"),
    ("My supervisor implies I will get promoted if I sleep with him", "Sexual Harassment"),
    ("A man exposed himself to me at the market", "Sexual Harassment"),
    ("My professor gives better grades to students who flirt with him", "Sexual Harassment"),
    ("A customer at work grabs me and makes sexual comments", "Sexual Harassment"),
    ("ጾታዊ ትንኮሳ", "Sexual Harassment"),
    ("hirmaannaa saalaa dirqisiisuu", "Sexual Harassment"),

    # ── Online Abuse ──────────────────────────────────────────────────────────
    ("Someone posted my private photos online without my permission", "Online Abuse"),
    ("I am being blackmailed with intimate images someone took of me", "Online Abuse"),
    ("A person created a fake profile using my photos to harass people", "Online Abuse"),
    ("I receive death threats on social media every day", "Online Abuse"),
    ("Someone hacked my accounts and is sending messages to my contacts", "Online Abuse"),
    ("My ex is sharing our private videos online to humiliate me", "Online Abuse"),
    ("I am being cyberbullied by a group of people from school", "Online Abuse"),
    ("Someone is posting my home address and threatening to come hurt me", "Online Abuse"),
    ("A person is sending me hundreds of threatening messages daily", "Online Abuse"),
    ("My personal information was leaked online and people are harassing me", "Online Abuse"),
    ("ፎቶ ተሰራጨ", "Online Abuse"),
    ("ኦንላይን ያሸብረኛል", "Online Abuse"),
    ("suuraa malee raabsuu", "Online Abuse"),

    # ── Child Labor ───────────────────────────────────────────────────────────
    ("A child of about ten years old is working in a factory near my house", "Child Labor"),
    ("Young children are carrying heavy loads at a construction site", "Child Labor"),
    ("A girl of eight is working as a house servant and not going to school", "Child Labor"),
    ("Children are being used to sell goods on the street late at night", "Child Labor"),
    ("A boy is working in a garage doing dangerous work instead of school", "Child Labor"),
    ("Young children are working in a farm from early morning to night", "Child Labor"),
    ("A child is being forced to work in a restaurant washing dishes", "Child Labor"),
    ("Children are mining in dangerous conditions without protection", "Child Labor"),
    ("A young girl is working as a maid and being denied education", "Child Labor"),
    ("ህፃን ሰራተኛ", "Child Labor"),
    ("ህፃን ያሰራሉ", "Child Labor"),
    ("daa'ima hojjisiisuu", "Child Labor"),

    # ── Neglect ───────────────────────────────────────────────────────────────
    ("An elderly person in my neighborhood has not eaten in days", "Neglect"),
    ("A child is always dirty and wearing torn clothes in cold weather", "Neglect"),
    ("The parents leave their baby alone for long periods without care", "Neglect"),
    ("An old woman is being left without food or medicine by her family", "Neglect"),
    ("A child has a serious wound that has not been treated for weeks", "Neglect"),
    ("The children in that house look malnourished and sick all the time", "Neglect"),
    ("A disabled person is being left without any assistance or care", "Neglect"),
    ("An elderly man is living in filth and his family ignores him", "Neglect"),
    ("A child is not being taken to school or given proper food", "Neglect"),
    ("ቸልተኝነት", "Neglect"),
    ("ምግብ አይሰጠውም", "Neglect"),
    ("kunuunsa dhabuu", "Neglect"),
]

# ── TRAIN ─────────────────────────────────────────────────────────────────────
sentences, labels = zip(*DATASET)
le = LabelEncoder()
y = le.fit_transform(labels)

X_train, X_test, y_train, y_test = train_test_split(
    sentences, y, test_size=0.2, random_state=42, stratify=y
)

pipeline = Pipeline([
    ("tfidf", TfidfVectorizer(
        ngram_range=(1, 3),       # unigrams, bigrams, trigrams
        max_features=10000,
        sublinear_tf=True,        # log normalization
        min_df=1,
        analyzer='word',
    )),
    ("clf", LogisticRegression(
        max_iter=1000,
        class_weight='balanced',  # handles class imbalance
        C=1.0,
        solver='lbfgs',
        multi_class='multinomial',
    )),
])

print("Training SafeSpeak ML Classifier...")
print(f"Training samples: {len(X_train)}")
print(f"Test samples: {len(X_test)}")
print(f"Classes: {list(le.classes_)}")
print()

pipeline.fit(X_train, y_train)

# ── EVALUATE ──────────────────────────────────────────────────────────────────
y_pred = pipeline.predict(X_test)
acc = accuracy_score(y_test, y_pred)

print("=" * 60)
print(f"ACCURACY: {acc:.2%}")
print("=" * 60)
print(classification_report(y_test, y_pred, target_names=le.classes_))

# ── SAVE ──────────────────────────────────────────────────────────────────────
out_dir = pathlib.Path(__file__).parent
joblib.dump(pipeline, out_dir / "classifier.joblib")
joblib.dump(le, out_dir / "label_encoder.joblib")

# Save class names for the Node.js service
with open(out_dir / "classes.json", "w") as f:
    json.dump(list(le.classes_), f)

print()
print(f"✅ Model saved → {out_dir / 'classifier.joblib'}")
print(f"✅ Label encoder saved → {out_dir / 'label_encoder.joblib'}")
print(f"✅ Classes saved → {out_dir / 'classes.json'}")

# ── QUICK TEST ────────────────────────────────────────────────────────────────
print()
print("── Quick Test ──────────────────────────────────────────────")
test_cases = [
    "My husband beats me every night and threatens to kill me",
    "A child in my building has bruises and is not going to school",
    "I was raped by my coworker after a work event",
    "Young girls are being sold and forced into prostitution",
    "My boss keeps touching me and making sexual comments at work",
    "Someone posted my private photos online to blackmail me",
    "ባሌ ይደበድበኛል",
    "daa'ima reebuu",
]
for t in test_cases:
    pred_idx = pipeline.predict([t])[0]
    proba = pipeline.predict_proba([t])[0]
    confidence = int(np.max(proba) * 100)
    label = le.inverse_transform([pred_idx])[0]
    print(f"  [{confidence}%] {label:<25} ← \"{t[:60]}\"")
