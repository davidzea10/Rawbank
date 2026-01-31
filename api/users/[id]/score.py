"""
Fonction serverless Vercel : GET /api/users/:id/score
Récupère les features depuis Supabase, charge le modèle et retourne le score.
"""
import json
import os
import sys
import warnings
from http.server import BaseHTTPRequestHandler

# Supprimer les warnings LightGBM
warnings.filterwarnings('ignore', category=UserWarning, module='lightgbm')
os.environ['LIGHTGBM_VERBOSE'] = '-1'

FEATURE_COLS = [
    'avg_transaction_amount', 'transaction_amount_std', 'avg_balance',
    'balance_volatility', 'fee_ratio', 'transaction_regularity',
    'recharge_frequency', 'avg_recharge_amount', 'small_recharge_ratio',
    'total_calls', 'avg_call_duration', 'total_data_mb', 'total_sms',
    'call_failure_rate', 'phone_activity_score'
]


def normalize_phone(s):
    if s is None or s == '':
        return ''
    return str(s).replace(' ', '').replace('+', '').strip()


def get_features_by_user_id(user_id):
    from supabase import create_client
    url = os.environ.get('SUPABASE_URL')
    key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
    if not url or not key:
        return None, 'SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requis'
    supabase = create_client(url, key)
    
    r = supabase.table('utilisateurs').select('numero_telephone').eq('id', user_id).maybe_single().execute()
    user = r.data
    if not user or not user.get('numero_telephone'):
        return None, 'Utilisateur ou numéro introuvable'
    
    numero = normalize_phone(user['numero_telephone'])
    r2 = supabase.table('donnees_operateurs').select('*').eq('numero_telephone', numero).maybe_single().execute()
    op = r2.data
    if not op:
        return None, f'Numéro {numero} non trouvé dans donnees_operateurs'
    
    return op, None


def predict_score(features):
    import pickle
    import pandas as pd
    
    # CWD sur Vercel = racine du projet
    model_path = os.path.join('Ml', 'credit_scoring_lgbm.pkl')
    if not os.path.exists(model_path):
        # Fallback : chemin relatif au fichier
        this_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.dirname(os.path.dirname(os.path.dirname(this_dir)))
        model_path = os.path.join(project_root, 'Ml', 'credit_scoring_lgbm.pkl')
    
    if not os.path.exists(model_path):
        raise FileNotFoundError(f'Modèle non trouvé: {model_path}')
    
    with open(model_path, 'rb') as f:
        model = pickle.load(f)
    
    row = {col: float(features.get(col, 0) if features.get(col) is not None else 0) for col in FEATURE_COLS}
    df = pd.DataFrame([row])
    score = model.predict(df)[0]
    return float(score.item() if hasattr(score, 'item') else score)


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            # Extraire l'id depuis le path /api/users/{id}/score
            path = self.path
            parts = path.rstrip('/').split('/')
            user_id = None
            for i, p in enumerate(parts):
                if p == 'users' and i + 1 < len(parts):
                    user_id = parts[i + 1]
                    break
            if not user_id:
                self.send_json(400, {'ok': False, 'message': 'ID utilisateur manquant'})
                return
            
            features, err = get_features_by_user_id(user_id)
            if err:
                self.send_json(404, {'ok': False, 'message': err})
                return
            
            score_raw = predict_score(features)
            score_display = round(score_raw * 1000)
            credit_limit = round((score_display / 1000) * 300000)
            
            self.send_json(200, {
                'ok': True,
                'score': score_display,
                'score_raw': score_raw,
                'creditLimit': credit_limit
            })
        except Exception as e:
            self.send_json(500, {'ok': False, 'message': str(e)})
    
    def send_json(self, status, data):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())
    
    def log_message(self, format, *args):
        pass
