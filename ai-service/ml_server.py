"""
SafeSpeak ML API Server
=======================
Flask server that serves the trained scikit-learn classifier.
Runs on port 5002 alongside the Node.js AI service.

Run:
    python ml_server.py

Endpoints:
    POST /ml/classify   — classify a description
    GET  /ml/health     — health check
    GET  /ml/info       — model info
"""

import os, json, pathlib
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

MODEL_DIR = pathlib.Path(__file__).parent
pipeline = None
label_encoder = None
classes = []

# ── Urgency mapping ───────────────────────────────────────────────────────────
URGENCY_MAP = {
    'Sexual Assault':      'High',
    'Domestic Violence':   'High',
    'Child Abuse':         'High',
    'Human Trafficking':   'High',
    'Physical Abuse':      'Medium',
    'Emotional Abuse':     'Medium',
    'Sexual Harassment':   'Medium',
    'Online Abuse':        'Medium',
    'Child Labor':         'High',
    'Neglect':             'Medium',
}

def load_model():
    global pipeline, label_encoder, classes
    clf_path = MODEL_DIR / "classifier.joblib"
    le_path  = MODEL_DIR / "label_encoder.joblib"
    cls_path = MODEL_DIR / "classes.json"

    if not clf_path.exists():
        return False, "Model not trained yet. Run: python train.py"

    import joblib
    pipeline      = joblib.load(clf_path)
    label_encoder = joblib.load(le_path)
    with open(cls_path) as f:
        classes = json.load(f)
    return True, "OK"

# Load on startup
ok, msg = load_model()
if ok:
    print(f"✅ ML model loaded — {len(classes)} classes")
else:
    print(f"⚠️  {msg}")

# ── Routes ────────────────────────────────────────────────────────────────────

@app.route('/ml/health')
def health():
    return jsonify({
        'status': 'ok',
        'model_loaded': pipeline is not None,
        'classes': len(classes),
    })

@app.route('/ml/info')
def info():
    return jsonify({
        'model': 'TF-IDF + Logistic Regression',
        'framework': 'scikit-learn',
        'classes': classes,
        'features': 'TF-IDF ngram(1,3) max_features=10000',
        'training_samples': 300,
        'languages': ['English', 'Amharic', 'Afaan Oromoo'],
    })

@app.route('/ml/classify', methods=['POST'])
def classify():
    if pipeline is None:
        return jsonify({'error': 'Model not loaded. Run: python train.py'}), 503

    data = request.get_json()
    description = data.get('description', '').strip()
    is_victim_safe = data.get('isVictimSafe', '')

    if not description:
        return jsonify({
            'classification': 'Unclassified',
            'urgency': 'Low',
            'aiScore': 20,
            'aiReason': 'No description provided.',
            'confidence': 0,
            'model': 'sklearn-lr',
        })

    # Predict
    proba    = pipeline.predict_proba([description])[0]
    pred_idx = int(np.argmax(proba))
    confidence = float(np.max(proba))
    classification = label_encoder.inverse_transform([pred_idx])[0]

    # Top 3 predictions
    top3_idx = np.argsort(proba)[::-1][:3]
    top3 = [
        {'label': label_encoder.inverse_transform([i])[0], 'confidence': round(float(proba[i]), 3)}
        for i in top3_idx
    ]

    # Urgency from classification
    urgency = URGENCY_MAP.get(classification, 'Low')

    # AI score (0-99)
    ai_score = int(confidence * 80)  # base from confidence

    # Boost for victim safety
    if is_victim_safe.lower() == 'no':
        ai_score = min(ai_score + 15, 99)
        if urgency == 'Low':
            urgency = 'Medium'

    # Boost for high-urgency categories
    if urgency == 'High':
        ai_score = min(ai_score + 10, 99)

    ai_reason = (
        f"{classification} detected with {int(confidence * 100)}% confidence "
        f"(ML model: TF-IDF + Logistic Regression). "
        f"Urgency: {urgency}."
    )

    return jsonify({
        'classification': classification,
        'urgency': urgency,
        'aiScore': ai_score,
        'aiReason': ai_reason,
        'confidence': round(confidence, 3),
        'top3': top3,
        'model': 'sklearn-lr',
    })

if __name__ == '__main__':
    port = int(os.environ.get('ML_PORT', 5002))
    print(f"🧠 SafeSpeak ML Server running on http://localhost:{port}")
    app.run(host='0.0.0.0', port=port, debug=False)
