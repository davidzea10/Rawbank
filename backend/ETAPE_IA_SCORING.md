# Intégration IA - Prédiction de score

## Étape 1 : Backend (prédiction)

### Prérequis
- Python 3.8+
- Dépendances : `pip install pandas lightgbm`

### Fichiers créés
- `backend/ml/predict.py` — Script Python qui charge le modèle et prédit
- `backend/ml/requirements.txt` — pandas, lightgbm
- `backend/services/scoreService.js` — Récupère les features, appelle Python, retourne score × 1000
- `backend/controllers/scoreController.js`
- `backend/routes/scoreRoutes.js`

### API
**GET** `/api/score/:id`

Réponse :
```json
{ "ok": true, "score": 566, "score_raw": 0.565785 }
```
Le `score` est multiplié par 1000 pour affichage (0–1000).

### Test Postman
```
GET http://localhost:3001/api/score/VOTRE_USER_ID
```

### Flux
1. Récupère `numero_telephone` de l'utilisateur
2. Charge les features depuis `donnees_operateurs`
3. Lance le script Python avec les features en JSON
4. Python charge `Ml/credit_scoring_lgbm.pkl` et prédit
5. Retourne score × 1000
