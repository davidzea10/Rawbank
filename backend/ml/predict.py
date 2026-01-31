#!/usr/bin/env python3
"""
Script de prédiction du score de crédit.
Lit les features en JSON depuis stdin, charge le modèle pickle, retourne le score en JSON sur stdout.
"""
import json
import sys
import os
import warnings

# Supprimer les warnings LightGBM (sinon ils polluent stdout)
warnings.filterwarnings('ignore', category=UserWarning, module='lightgbm')
os.environ['LIGHTGBM_VERBOSE'] = '-1'

# Chemin du modèle : depuis backend/ml/predict.py -> projet/Ml/credit_scoring_lgbm.pkl
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(SCRIPT_DIR)  # backend/
PROJECT_ROOT = os.path.dirname(BACKEND_DIR)  # MicroScore/
MODEL_PATH = os.path.join(PROJECT_ROOT, 'Ml', 'credit_scoring_lgbm.pkl')
# Fallback si Ml/ à côté de backend/
if not os.path.exists(MODEL_PATH):
    MODEL_PATH = os.path.join(BACKEND_DIR, '..', 'Ml', 'credit_scoring_lgbm.pkl')
if not os.path.exists(MODEL_PATH):
    MODEL_PATH = os.path.join(PROJECT_ROOT, 'ML', 'credit_scoring_lgbm.pkl')  # ML majuscule

FEATURE_COLS = [
    'avg_transaction_amount', 'transaction_amount_std', 'avg_balance',
    'balance_volatility', 'fee_ratio', 'transaction_regularity',
    'recharge_frequency', 'avg_recharge_amount', 'small_recharge_ratio',
    'total_calls', 'avg_call_duration', 'total_data_mb', 'total_sms',
    'call_failure_rate', 'phone_activity_score'
]

def main():
    try:
        import pickle
        import pandas as pd

        # Lire les features depuis stdin
        input_str = sys.stdin.read()
        data = json.loads(input_str)

        # Charger le modèle
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(f'Modèle introuvable: {MODEL_PATH}')
        with open(MODEL_PATH, 'rb') as f:
            model = pickle.load(f)

        # Préparer les features dans l'ordre attendu (LightGBM exige le même ordre qu'à l'entraînement)
        row = [float(data.get(col) if data.get(col) is not None else 0) for col in FEATURE_COLS]
        df = pd.DataFrame([row], columns=FEATURE_COLS)

        # Prédiction
        score = model.predict(df)[0]
        if hasattr(score, 'item'):
            score = float(score.item())
        else:
            score = float(score)

        print(json.dumps({'ok': True, 'credit_scoring': score}))

    except Exception as e:
        print(json.dumps({'ok': False, 'error': str(e)}, default=str), file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
