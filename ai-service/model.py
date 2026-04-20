"""
SafeSpeak AI Classifier
-----------------------
Uses a TF-IDF + Logistic Regression pipeline to classify abuse reports
into urgency levels (High / Medium / Low) and abuse type.
Falls back to rule-based scoring if the model file is not found.
"""

import os, re, joblib, numpy as np
from pathlib import Path

MODEL_PATH = Path(__file__).parent / "classifier.joblib"

# ── Rule-based fallback (mirrors the Node.js logic) ──────────────────────────
KEYWORD_WEIGHTS = {
    "rape": 30, "assault": 25, "trafficking": 35, "sexual": 30,
    "child": 20, "minor": 20, "underage": 20, "labor": 25,
    "repeat": 15, "ongoing": 15, "hospital": 10, "injury": 10,
    "bruise": 10, "physical": 20, "digital": 15, "online": 10,
}

ABUSE_TYPE_SCORES = {
    "Sexual": 30, "Child labor": 25, "Human trafficking concerns": 35,
    "Physical": 20, "Online / Digital abuse": 15,
}

def rule_based_classify(text: str, abuse_types: list[str], is_victim_safe: str) -> dict:
    score = 30
    reason_parts = []

    for atype in abuse_types:
        if atype in ABUSE_TYPE_SCORES:
            score += ABUSE_TYPE_SCORES[atype]
            reason_parts.append(f"{atype} abuse reported.")

    words = re.findall(r"\w+", text.lower())
    for word in words:
        if word in KEYWORD_WEIGHTS:
            score += KEYWORD_WEIGHTS[word]

    if is_victim_safe and is_victim_safe.lower() == "no":
        score += 20
        reason_parts.append("Victim currently unsafe.")

    score = min(score, 99)
    urgency = "High" if score >= 75 else ("Medium" if score >= 50 else "Low")
    classification = abuse_types[0] if abuse_types else "Unclassified"
    reason = " ".join(reason_parts) if reason_parts else "Standard case — requires review."

    return {
        "aiScore": score,
        "urgency": urgency,
        "classification": classification,
        "aiReason": reason,
        "model": "rule-based",
    }


# ── ML model (loaded once at startup) ────────────────────────────────────────
_pipeline = None

def load_model():
    global _pipeline
    if MODEL_PATH.exists():
        _pipeline = joblib.load(MODEL_PATH)
    return _pipeline


def ml_classify(text: str, abuse_types: list[str], is_victim_safe: str) -> dict:
    """Try ML model first, fall back to rule-based."""
    pipe = _pipeline or load_model()

    # Build combined feature text
    combined = text + " " + " ".join(abuse_types)
    if is_victim_safe and is_victim_safe.lower() == "no":
        combined += " unsafe victim"

    if pipe is not None:
        try:
            urgency_pred = pipe.predict([combined])[0]
            proba = pipe.predict_proba([combined])[0]
            score = int(np.max(proba) * 99)
            classification = abuse_types[0] if abuse_types else "Unclassified"
            return {
                "aiScore": score,
                "urgency": urgency_pred,
                "classification": classification,
                "aiReason": f"ML model confidence: {int(np.max(proba)*100)}%.",
                "model": "ml",
            }
        except Exception:
            pass  # fall through to rule-based

    return rule_based_classify(text, abuse_types, is_victim_safe)
