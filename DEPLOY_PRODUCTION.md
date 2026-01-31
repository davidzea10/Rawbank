# Déploiement en production (Express + frontend + Python ML)

## Architecture

- **Backend** : Express (Node.js) sert l’API et le frontend compilé
- **Frontend** : React/Vite, build copié dans `backend/public`
- **ML** : `child_process` lance le script Python (`backend/ml/predict.py`)

## Commandes

### 1. Build du frontend et copie vers backend/public

```powershell
cd "c:\Users\DEBUZE DAVID\Documents\Hackathon\MicroScore"
npm run build
```

### 2. Démarrage du serveur

```powershell
cd backend
npm start
```

Ou depuis la racine :

```powershell
npm start
```

Le serveur écoute sur `http://localhost:3001` et sert :
- l’API sous `/api/*`
- le frontend sur `/` (SPA)

## URLs en production

- **Dev** : frontend `localhost:3000`, API `localhost:3001`
- **Prod** : tout sur le même serveur, API à `/api/*`, URLs relatives (sans localhost)

## Hébergement (Render, Railway, etc.)

1. **Build Command** : `npm run build`
2. **Start Command** : `cd backend && npm start`
3. **Variables d’environnement** : `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

## Prérequis

- Node.js
- Python 3 avec `pandas`, `lightgbm` pour le scoring
- Dossier `Ml/credit_scoring_lgbm.pkl` à la racine du projet
