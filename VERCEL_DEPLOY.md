# Déploiement sur Vercel

## Structure

- **Frontend** : React/Vite → `frontend/dist`
- **API** : Express (Node) + fonction Python (score ML)
- **ML** : Modèle dans `Ml/credit_scoring_lgbm.pkl`

## Variables d'environnement (obligatoires)

À configurer dans **Vercel** → **Settings** → **Environment Variables** :

| Variable | Valeur | Description |
|----------|--------|-------------|
| `SUPABASE_URL` | https://xxx.supabase.co | URL du projet Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | eyJ... | Clé service_role Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | *(ou `SUPABASE_SERVICE_KEY`)* | Les deux noms sont acceptés |

## Étapes de déploiement

1. **Pousser sur GitHub** (avec le dossier `Ml/` et `api/`)

2. **Sur vercel.com** :
   - Add New → Project → Import le dépôt
   - **Root Directory** : `./` (racine)
   - **Framework Preset** : Other
   - **Build Command** : *(laisser vide ou `cd frontend && npm run build`)*
   - **Output Directory** : `frontend/dist`
   - **Install Command** : *(laisser vide, géré par vercel.json)*

3. **Variables** : Ajouter `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY`

4. **Deploy**

## Routes API

- `/api/auth/*` - Auth (Node)
- `/api/users/*` - Utilisateurs (Node)
- `/api/users/:id/score` - **Score ML** (Python)
- `/api/operateurs/*` - Opérateurs (Node)
- `/api/score/*` - Score alternatif (Node, fallback)

## Développement local

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

Le frontend utilise `http://localhost:3001` en dev. En production (Vercel), il utilise la même origine (`/api`).
