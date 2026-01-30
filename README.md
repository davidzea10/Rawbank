# Rawbank

RawFinance Pro - Plateforme de microcrédit intelligent pour particuliers et entrepreneurs.

Hackathon Rawbank - UPC Criagi - BrainSoft

## Stack

- **Backend** : Node.js, Express, Supabase
- **Base de données** : Supabase (PostgreSQL)
- **Auth** : Supabase Auth (JWT)

## Installation

```bash
cd backend
npm install
cp .env.example .env  # Configurer les variables Supabase
npm start
```

## API

- `GET /` - Santé API
- `GET /api/health` - Vérification connexion Supabase
- `GET /api/operateurs/check/:numero_telephone` - Vérifier si numéro existe (base opérateurs)
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Profil utilisateur (protégé)
