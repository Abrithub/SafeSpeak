"""
SafeSpeak ML API Server (No external dependencies)
Uses the Naive Bayes classifier trained by train_simple.py
Run: python ml_server_simple.py
"""
import json, pickle, pathlib, re
from http.server import HTTPServer, BaseHTTPRequestHandler

MODEL_DIR = pathlib.Path(__file__).parent
clf = None
classes = []

URGENCY_MAP = {
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
}

def load_model():
    global clf, classes
    pkl = MODEL_DIR / 'classifier_nb.pkl'
    cls = MODEL_DIR / 'classes.json'
    if not pkl.exists():
        return False
    with open(pkl, 'rb') as f:
        clf = pickle.load(f)
    with open(cls, encoding='utf-8') as f:
        classes = json.load(f)
    return True

class Handler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        pass  # suppress default logs

    def send_json(self, code, data):
        body = json.dumps(data).encode()
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Content-Length', len(body))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        if self.path == '/ml/health':
            self.send_json(200, {'status': 'ok', 'model': 'Naive Bayes', 'loaded': clf is not None})
        elif self.path == '/ml/info':
            self.send_json(200, {
                'model': 'Naive Bayes Classifier',
                'framework': 'Python standard library',
                'algorithm': 'Multinomial Naive Bayes with Laplace smoothing',
                'classes': classes,
                'training_samples': 90,
                'languages': ['English', 'Amharic', 'Afaan Oromoo'],
            })
        else:
            self.send_json(404, {'error': 'Not found'})

    def do_POST(self):
        if self.path == '/ml/classify':
            length = int(self.headers.get('Content-Length', 0))
            body = json.loads(self.rfile.read(length))
            description = body.get('description', '').strip()
            is_victim_safe = body.get('isVictimSafe', '')

            if not description or clf is None:
                self.send_json(200, {
                    'classification': 'Unclassified', 'urgency': 'Low',
                    'aiScore': 20, 'confidence': 0, 'model': 'naive-bayes',
                })
                return

            pred, conf, top3 = clf.predict(description)
            urgency = URGENCY_MAP.get(pred, 'Low')
            ai_score = min(int(conf * 80) + (10 if urgency == 'High' else 0), 99)

            if is_victim_safe.lower() == 'no':
                ai_score = min(ai_score + 15, 99)
                if urgency == 'Low': urgency = 'Medium'

            self.send_json(200, {
                'classification': pred,
                'urgency': urgency,
                'aiScore': ai_score,
                'aiReason': f"{pred} detected with {int(conf*100)}% confidence (Naive Bayes classifier).",
                'confidence': round(conf, 3),
                'top3': [{'label': c, 'confidence': round(p, 3)} for c, p in top3],
                'model': 'naive-bayes',
            })
        else:
            self.send_json(404, {'error': 'Not found'})

if __name__ == '__main__':
    if not load_model():
        print("❌ Model not found. Run: python train_simple.py")
        exit(1)

    port = 5002
    server = HTTPServer(('0.0.0.0', port), Handler)
    print(f"🧠 SafeSpeak ML Server (Naive Bayes) → http://localhost:{port}")
    print(f"   Classes: {classes}")
    print(f"   Press Ctrl+C to stop")
    server.serve_forever()
