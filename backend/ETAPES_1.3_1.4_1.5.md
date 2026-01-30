# Étapes 1.3, 1.4 et 1.5 – Détail

---

## 1.3 Créer les 14 tables dans Supabase

### Ordre à respecter

Créer les tables dans cet ordre (à cause des clés étrangères) :

1. `utilisateurs`
2. `profils_utilisateurs`, `details_entrepreneurs`, `comptes_mobile_money`, `donnees_sociales`
3. `transactions_mobile_money`, `recharges_telephoniques`, `enregistrements_cdr`
4. `demandes_credit`, `scores_credit`
5. `credits` (référence `demandes_credit`)
6. `remboursements` (référence `credits`)
7. `facteurs_score` (référence `scores_credit`)
8. `detections_fraude` (référence `demandes_credit`)

### Où exécuter le SQL

- Supabase → **SQL Editor** → **New query**
- Coller le bloc correspondant → **Run**

### 1. Extension UUID + table `utilisateurs`

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE utilisateurs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE,
  numero_telephone VARCHAR(20) UNIQUE NOT NULL,
  date_creation TIMESTAMPTZ DEFAULT NOW(),
  date_mise_a_jour TIMESTAMPTZ DEFAULT NOW(),
  est_actif BOOLEAN DEFAULT true,
  derniere_connexion TIMESTAMPTZ
);

CREATE INDEX idx_utilisateurs_telephone ON utilisateurs(numero_telephone);
CREATE INDEX idx_utilisateurs_email ON utilisateurs(email);
```

### 2. Tables `profils_utilisateurs`, `details_entrepreneurs`, `comptes_mobile_money`, `donnees_sociales`

```sql
CREATE TABLE profils_utilisateurs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_utilisateur UUID NOT NULL UNIQUE REFERENCES utilisateurs(id) ON DELETE CASCADE,
  type_profil VARCHAR(20) NOT NULL CHECK (type_profil IN ('particulier', 'entrepreneur')),
  prenom VARCHAR(100) NOT NULL,
  nom VARCHAR(100) NOT NULL,
  numero_cni VARCHAR(50) UNIQUE,
  url_photo_cni TEXT,
  url_selfie TEXT,
  date_naissance DATE,
  adresse TEXT,
  ville VARCHAR(100),
  profil_detecte_par_ia BOOLEAN DEFAULT false,
  confiance_ia DECIMAL(5,4) CHECK (confiance_ia >= 0 AND confiance_ia <= 1),
  date_creation TIMESTAMPTZ DEFAULT NOW(),
  date_mise_a_jour TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profils_utilisateurs_id_utilisateur ON profils_utilisateurs(id_utilisateur);
CREATE INDEX idx_profils_utilisateurs_cni ON profils_utilisateurs(numero_cni);
CREATE INDEX idx_profils_utilisateurs_type ON profils_utilisateurs(type_profil);

CREATE TABLE details_entrepreneurs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_utilisateur UUID NOT NULL UNIQUE REFERENCES utilisateurs(id) ON DELETE CASCADE,
  nom_entreprise VARCHAR(200) NOT NULL,
  secteur_activite VARCHAR(100),
  localisation VARCHAR(200),
  date_enregistrement DATE,
  description_activite TEXT,
  date_creation TIMESTAMPTZ DEFAULT NOW(),
  date_mise_a_jour TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_details_entrepreneurs_id_utilisateur ON details_entrepreneurs(id_utilisateur);

CREATE TABLE comptes_mobile_money (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_utilisateur UUID NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
  operateur VARCHAR(50) NOT NULL,
  numero_compte VARCHAR(50) NOT NULL,
  est_verifie BOOLEAN DEFAULT false,
  est_principal BOOLEAN DEFAULT false,
  date_connexion TIMESTAMPTZ DEFAULT NOW(),
  derniere_synchronisation TIMESTAMPTZ,
  date_creation TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comptes_mm_id_utilisateur ON comptes_mobile_money(id_utilisateur);
CREATE INDEX idx_comptes_mm_operateur ON comptes_mobile_money(operateur);

CREATE TABLE donnees_sociales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_utilisateur UUID NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
  plateforme VARCHAR(50) NOT NULL,
  id_utilisateur_plateforme VARCHAR(100),
  est_verifie BOOLEAN DEFAULT false,
  age_compte_jours INTEGER,
  nombre_followers INTEGER DEFAULT 0,
  nombre_connexions INTEGER DEFAULT 0,
  score_sentiment DECIMAL(5,4),
  consentement_donne BOOLEAN DEFAULT false,
  date_consentement TIMESTAMPTZ,
  derniere_synchronisation TIMESTAMPTZ,
  date_creation TIMESTAMPTZ DEFAULT NOW(),
  date_mise_a_jour TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_donnees_sociales_id_utilisateur ON donnees_sociales(id_utilisateur);
CREATE INDEX idx_donnees_sociales_plateforme ON donnees_sociales(plateforme);
```

### 3. Tables `transactions_mobile_money`, `recharges_telephoniques`, `enregistrements_cdr`

```sql
CREATE TABLE transactions_mobile_money (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_utilisateur UUID NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
  id_compte UUID REFERENCES comptes_mobile_money(id) ON DELETE SET NULL,
  id_transaction VARCHAR(100) UNIQUE,
  type_transaction VARCHAR(20) NOT NULL CHECK (type_transaction IN ('entree', 'sortie')),
  montant DECIMAL(15,2) NOT NULL CHECK (montant > 0),
  date TIMESTAMPTZ NOT NULL,
  libelle VARCHAR(200),
  description TEXT,
  contrepartie VARCHAR(100),
  solde_apres DECIMAL(15,2),
  date_creation TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transactions_mm_id_utilisateur ON transactions_mobile_money(id_utilisateur);
CREATE INDEX idx_transactions_mm_date ON transactions_mobile_money(date);
CREATE INDEX idx_transactions_mm_type ON transactions_mobile_money(type_transaction);
CREATE INDEX idx_transactions_mm_id_transaction ON transactions_mobile_money(id_transaction);

CREATE TABLE recharges_telephoniques (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_utilisateur UUID NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
  numero_telephone VARCHAR(20) NOT NULL,
  operateur VARCHAR(50) NOT NULL,
  montant DECIMAL(10,2) NOT NULL CHECK (montant > 0),
  date_recharge TIMESTAMPTZ NOT NULL,
  type_recharge VARCHAR(50),
  date_creation TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_recharges_id_utilisateur ON recharges_telephoniques(id_utilisateur);
CREATE INDEX idx_recharges_date ON recharges_telephoniques(date_recharge);
CREATE INDEX idx_recharges_telephone ON recharges_telephoniques(numero_telephone);

CREATE TABLE enregistrements_cdr (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_cdr VARCHAR(50) UNIQUE NOT NULL,
  id_utilisateur UUID REFERENCES utilisateurs(id) ON DELETE SET NULL,
  horodatage TIMESTAMPTZ NOT NULL,
  operateur VARCHAR(50) NOT NULL,
  numero_appelant VARCHAR(20) NOT NULL,
  numero_appele VARCHAR(20),
  type_appel VARCHAR(50) NOT NULL,
  duree_secondes INTEGER DEFAULT 0 CHECK (duree_secondes >= 0),
  volume_donnees_mb DECIMAL(10,2) DEFAULT 0 CHECK (volume_donnees_mb >= 0),
  nombre_sms INTEGER DEFAULT 0 CHECK (nombre_sms >= 0),
  id_tour VARCHAR(50),
  ville VARCHAR(100),
  type_reseau VARCHAR(20),
  statut_appel VARCHAR(50),
  date_creation TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cdr_id_cdr ON enregistrements_cdr(id_cdr);
CREATE INDEX idx_cdr_id_utilisateur ON enregistrements_cdr(id_utilisateur);
CREATE INDEX idx_cdr_horodatage ON enregistrements_cdr(horodatage);
CREATE INDEX idx_cdr_numero_appelant ON enregistrements_cdr(numero_appelant);
CREATE INDEX idx_cdr_operateur ON enregistrements_cdr(operateur);
CREATE INDEX idx_cdr_type_appel ON enregistrements_cdr(type_appel);
```

### 4. Tables `demandes_credit` et `scores_credit`

```sql
CREATE TABLE demandes_credit (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_utilisateur UUID NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
  type_credit VARCHAR(50) NOT NULL,
  montant_demande DECIMAL(15,2) NOT NULL CHECK (montant_demande > 0),
  duree_demandee_mois INTEGER NOT NULL,
  raison TEXT,
  score_actuel INTEGER CHECK (score_actuel >= 0 AND score_actuel <= 1000),
  score_risque_fraude DECIMAL(5,2) CHECK (score_risque_fraude >= 0 AND score_risque_fraude <= 100),
  statut VARCHAR(50) DEFAULT 'pending' CHECK (statut IN ('pending', 'approved', 'rejected', 'cancelled')),
  decision VARCHAR(50) CHECK (decision IN ('automatic', 'manual')),
  montant_approuve DECIMAL(15,2),
  raison_rejet TEXT,
  revu_par UUID REFERENCES utilisateurs(id) ON DELETE SET NULL,
  date_revue TIMESTAMPTZ,
  date_creation TIMESTAMPTZ DEFAULT NOW(),
  date_mise_a_jour TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_demandes_id_utilisateur ON demandes_credit(id_utilisateur);
CREATE INDEX idx_demandes_statut ON demandes_credit(statut);
CREATE INDEX idx_demandes_date_creation ON demandes_credit(date_creation);

CREATE TABLE scores_credit (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_utilisateur UUID NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 1000),
  type_score VARCHAR(50) NOT NULL CHECK (type_score IN ('alternatif', 'transactionnel')),
  montant_eligible DECIMAL(15,2),
  date_calcul TIMESTAMPTZ DEFAULT NOW(),
  version_modele VARCHAR(50),
  est_actuel BOOLEAN DEFAULT true,
  date_creation TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scores_id_utilisateur ON scores_credit(id_utilisateur);
CREATE INDEX idx_scores_date_calcul ON scores_credit(date_calcul);
CREATE UNIQUE INDEX idx_scores_actuel ON scores_credit(id_utilisateur) WHERE est_actuel = true;
```

### 5. Table `credits`

```sql
CREATE TABLE credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_utilisateur UUID NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
  id_demande UUID REFERENCES demandes_credit(id) ON DELETE SET NULL,
  type_credit VARCHAR(50) NOT NULL,
  montant DECIMAL(15,2) NOT NULL CHECK (montant > 0),
  taux_interet DECIMAL(5,2) NOT NULL CHECK (taux_interet >= 0),
  duree_mois INTEGER NOT NULL CHECK (duree_mois > 0),
  mensualite DECIMAL(15,2) NOT NULL,
  date_debut DATE NOT NULL,
  date_fin DATE NOT NULL,
  statut VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (statut IN ('pending', 'active', 'completed', 'defaulted', 'cancelled')),
  approuve_par UUID REFERENCES utilisateurs(id) ON DELETE SET NULL,
  date_approbation TIMESTAMPTZ,
  date_decaissement TIMESTAMPTZ,
  date_completion TIMESTAMPTZ,
  date_creation TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_credits_id_utilisateur ON credits(id_utilisateur);
CREATE INDEX idx_credits_statut ON credits(statut);
CREATE INDEX idx_credits_dates ON credits(date_debut, date_fin);
```

### 6. Table `remboursements`

```sql
CREATE TABLE remboursements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_credit UUID NOT NULL REFERENCES credits(id) ON DELETE CASCADE,
  id_utilisateur UUID NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
  montant DECIMAL(15,2) NOT NULL CHECK (montant > 0),
  date_paiement DATE NOT NULL,
  date_echeance DATE NOT NULL,
  est_a_temps BOOLEAN GENERATED ALWAYS AS (date_paiement <= date_echeance) STORED,
  methode_paiement VARCHAR(50),
  reference_transaction VARCHAR(100),
  statut VARCHAR(50) DEFAULT 'completed' CHECK (statut IN ('pending', 'completed', 'failed')),
  date_creation TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_remboursements_id_credit ON remboursements(id_credit);
CREATE INDEX idx_remboursements_id_utilisateur ON remboursements(id_utilisateur);
CREATE INDEX idx_remboursements_date_echeance ON remboursements(date_echeance);
CREATE INDEX idx_remboursements_date_paiement ON remboursements(date_paiement);
```

### 7. Table `facteurs_score`

```sql
CREATE TABLE facteurs_score (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_score_credit UUID NOT NULL REFERENCES scores_credit(id) ON DELETE CASCADE,
  id_utilisateur UUID NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
  nom_facteur VARCHAR(100) NOT NULL,
  valeur_facteur DECIMAL(10,4) NOT NULL,
  poids_facteur DECIMAL(5,4),
  contribution DECIMAL(10,2),
  categorie VARCHAR(50),
  date_creation TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_facteurs_id_score ON facteurs_score(id_score_credit);
CREATE INDEX idx_facteurs_id_utilisateur ON facteurs_score(id_utilisateur);
CREATE INDEX idx_facteurs_categorie ON facteurs_score(categorie);
```

### 8. Table `detections_fraude`

```sql
CREATE TABLE detections_fraude (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_utilisateur UUID REFERENCES utilisateurs(id) ON DELETE SET NULL,
  id_demande_credit UUID REFERENCES demandes_credit(id) ON DELETE SET NULL,
  score_risque DECIMAL(5,2) NOT NULL CHECK (score_risque >= 0 AND score_risque <= 100),
  niveau_risque VARCHAR(20) NOT NULL CHECK (niveau_risque IN ('low', 'medium', 'high', 'critical')),
  anomalies_detectees JSONB,
  drapeaux JSONB,
  version_modele VARCHAR(50),
  necessite_revue BOOLEAN DEFAULT false,
  revu_par UUID REFERENCES utilisateurs(id) ON DELETE SET NULL,
  date_revue TIMESTAMPTZ,
  notes_revue TEXT,
  date_creation TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fraude_id_utilisateur ON detections_fraude(id_utilisateur);
CREATE INDEX idx_fraude_id_demande ON detections_fraude(id_demande_credit);
CREATE INDEX idx_fraude_niveau_risque ON detections_fraude(niveau_risque);
CREATE INDEX idx_fraude_necessite_revue ON detections_fraude(necessite_revue);
```

### Vérification

- Supabase → **Table Editor** : les 14 tables doivent apparaître.
- Aucune erreur dans le **SQL Editor** après exécution des blocs.

---

## 1.4 Configurer .env et connexion Supabase

### 1. Créer le fichier `.env`

À la racine du dossier `backend`, crée un fichier nommé exactement `.env` (pas d’extension).

### 2. Contenu de `.env`

Remplacer les valeurs par celles de ton projet Supabase (étape 1.2) :

```env
PORT=3001
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

- `SUPABASE_URL` : **Project URL** (API)
- `SUPABASE_ANON_KEY` : **anon public**
- `SUPABASE_SERVICE_ROLE_KEY` : **service_role**

### 3. Vérifier `.gitignore`

Le fichier `backend/.gitignore` doit contenir au minimum :

```
node_modules/
.env
```

Pour ne jamais commiter `.env`.

### 4. Créer le module de connexion Supabase

Créer le fichier `backend/config/supabase.js` avec :

```javascript
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent être définis dans .env');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = { supabase };
```

- Ce client utilise la **service_role** pour le backend (accès complet).

### 5. Utilisation ailleurs dans le projet

Dans un contrôleur ou une route :

```javascript
const { supabase } = require('../config/supabase');
// puis supabase.from('utilisateurs').select('*') etc.
```

---

## 1.5 Vérifier la connexion + tests Postman

### 1. Route de test dans `server.js`

Modifier `server.js` pour :

- Charger le client Supabase.
- Exposer une route `GET /api/health` qui :
  - fait un `select` minimal sur une table (ex. `utilisateurs`) avec `.limit(1)`,
  - renvoie `{ "ok": true, "message": "API OK", "supabase": "connected" }` si tout va bien,
  - ou un JSON d’erreur avec le message en cas d’échec.

Exemple de structure (à adapter à ton `server.js` actuel) :

```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { supabase } = require('./config/supabase');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ ok: true, message: 'RawFinance Pro API', step: '1.5' });
});

app.get('/api/health', async (req, res) => {
  try {
    const { data, error } = await supabase.from('utilisateurs').select('id').limit(1);
    if (error) throw error;
    res.json({ ok: true, message: 'API OK', supabase: 'connected' });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message, supabase: 'error' });
  }
});

app.listen(PORT, () => {
  console.log(`Serveur sur http://localhost:${PORT}`);
});
```

### 2. Démarrer le serveur

```bash
cd backend
npm start
```

Vérifier qu’il n’y a pas d’erreur au démarrage (notamment `.env` et `config/supabase.js`).

### 3. Tests Postman

| Méthode | URL | Résultat attendu |
|--------|-----|-------------------|
| GET | `http://localhost:3001/` | `{ "ok": true, "message": "RawFinance Pro API", "step": "1.5" }` |
| GET | `http://localhost:3001/api/health` | `{ "ok": true, "message": "API OK", "supabase": "connected" }` |

- Si `GET /api/health` retourne `supabase: "connected"` → connexion Supabase OK.
- Si `supabase: "error"` → vérifier `.env`, les 14 tables et le projet Supabase.

### 4. En cas d’erreur

- **`SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` doivent être définis** : vérifier que `.env` existe dans `backend`, que les noms des variables sont exacts et qu’il n’y a pas d’espace autour de `=`.
- **401 / 404 sur une table** : vérifier que les tables ont bien été créées (étape 1.3) et que la **service_role** est utilisée (pas l’anon key pour ce test).
- **Erreur de connexion** : vérifier l’URL du projet et la clé **service_role** dans **Project Settings → API**.

---

Quand les deux requêtes Postman répondent correctement, les étapes 1.3, 1.4 et 1.5 sont terminées.
