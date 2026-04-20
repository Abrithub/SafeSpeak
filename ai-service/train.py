"""
Train the SafeSpeak urgency classifier.
Run:  python train.py
Saves classifier.joblib next to this file.
"""

from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import joblib, pathlib

# ── Labeled training data ─────────────────────────────────────────────────────
# Format: (text_features, urgency_label)
SAMPLES = [
    # High urgency
    ("child sexual abuse rape assault victim unsafe ongoing", "High"),
    ("human trafficking minor underage forced labor unsafe", "High"),
    ("sexual abuse child hospital injury bruise victim unsafe", "High"),
    ("rape assault ongoing repeat victim not safe physical", "High"),
    ("trafficking child labor sexual abuse unsafe hospital", "High"),
    ("minor victim sexual assault ongoing unsafe injury", "High"),
    ("child abuse physical sexual repeat unsafe bruise", "High"),
    ("human trafficking sexual exploitation unsafe ongoing", "High"),

    # Medium urgency
    ("physical abuse domestic violence repeat bruise", "Medium"),
    ("online digital abuse harassment ongoing child", "Medium"),
    ("physical assault injury hospital domestic", "Medium"),
    ("child labor exploitation ongoing physical", "Medium"),
    ("digital abuse online harassment repeat victim", "Medium"),
    ("domestic violence physical injury repeat", "Medium"),
    ("emotional abuse ongoing child school", "Medium"),
    ("physical abuse workplace ongoing harassment", "Medium"),

    # Low urgency
    ("verbal abuse argument dispute neighbor", "Low"),
    ("online harassment social media comment", "Low"),
    ("workplace dispute verbal conflict", "Low"),
    ("minor disagreement verbal altercation", "Low"),
    ("online bullying social media post", "Low"),
    ("verbal threat no physical contact", "Low"),
    ("property dispute neighbor argument", "Low"),
    ("cyberbullying online comment school", "Low"),
]

texts, labels = zip(*SAMPLES)

X_train, X_test, y_train, y_test = train_test_split(
    texts, labels, test_size=0.2, random_state=42, stratify=labels
)

pipeline = Pipeline([
    ("tfidf", TfidfVectorizer(ngram_range=(1, 2), max_features=5000)),
    ("clf",   LogisticRegression(max_iter=1000, class_weight="balanced")),
])

pipeline.fit(X_train, y_train)

print("── Evaluation ──────────────────────────────")
print(classification_report(y_test, pipeline.predict(X_test)))

out = pathlib.Path(__file__).parent / "classifier.joblib"
joblib.dump(pipeline, out)
print(f"✅ Model saved → {out}")
