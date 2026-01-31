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

# Chemin du modèle (relatif au script)
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(os.path.dirname(SCRIPT_DIR))
MODEL_PATH = os.path.join(PROJECT_ROOT, 'Ml', 'credit_scoring_lgbm.pkl')

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
        with open(MODEL_PATH, 'rb') as f:
            model = pickle.load(f)

        # Préparer les features dans l'ordre attendu
        row = {col: float(data.get(col, 0)) for col in FEATURE_COLS}
        df = pd.DataFrame([row])

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
