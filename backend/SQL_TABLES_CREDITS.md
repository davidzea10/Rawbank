# Tables pour les crédits

Si la section "Crédits en cours" reste vide, vérifiez que les tables existent dans Supabase.

## Requête : crédits pour les éligibles

Exécuter **`backend/SQL_INSERT_CREDITS_ELIGIBLES.sql`** dans Supabase > SQL Editor.

**Exécuter les 2 parties dans l'ordre :**

1. **Partie 1** : Crée les demandes pour chaque utilisateur dont le numéro est dans `donnees_operateurs` (score calculé à partir des features)
2. **Partie 2** : Crée les crédits pour les demandes approuvées (score ≥ 700)

**Si la table reste vide** : Vérifiez que des utilisateurs ont un `numero_telephone` qui existe dans `donnees_operateurs` (même format, sans espaces).

## 1. Créer les tables (Supabase SQL Editor)

Exécutez ce SQL dans **Supabase Dashboard > SQL Editor** :

```sql
-- Table demandes_credit
CREATE TABLE IF NOT EXISTS demandes_credit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_utilisateur UUID NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
  type_credit VARCHAR(50) NOT NULL,
  montant_demande DECIMAL(15,2) NOT NULL CHECK (montant_demande > 0),
  duree_demandee_mois INTEGER NOT NULL,
  raison TEXT,
  score_actuel INTEGER,
  statut VARCHAR(50) DEFAULT 'pending',
  decision VARCHAR(50),
  montant_approuve DECIMAL(15,2),
  raison_rejet TEXT,
  date_creation TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_demandes_id_utilisateur ON demandes_credit(id_utilisateur);

-- Table credits
CREATE TABLE IF NOT EXISTS credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_utilisateur UUID NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
  id_demande UUID REFERENCES demandes_credit(id) ON DELETE SET NULL,
  type_credit VARCHAR(50) NOT NULL,
  montant DECIMAL(15,2) NOT NULL,
  taux_interet DECIMAL(5,2) NOT NULL,
  duree_mois INTEGER NOT NULL,
  mensualite DECIMAL(15,2) NOT NULL,
  date_debut DATE NOT NULL,
  date_fin DATE NOT NULL,
  statut VARCHAR(50) DEFAULT 'active',
  date_creation TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credits_id_utilisateur ON credits(id_utilisateur);

-- Table remboursements
CREATE TABLE IF NOT EXISTS remboursements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_credit UUID NOT NULL REFERENCES credits(id) ON DELETE CASCADE,
  id_utilisateur UUID NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
  montant DECIMAL(15,2) NOT NULL,
  date_paiement DATE NOT NULL,
  date_echeance DATE NOT NULL,
  methode_paiement VARCHAR(50),
  statut VARCHAR(50) DEFAULT 'completed'
);

CREATE INDEX IF NOT EXISTS idx_remboursements_id_credit ON remboursements(id_credit);
```

## 2. Colonnes pénalités (remboursements)

Exécuter `backend/SQL_ALTER_REMBOURSEMENTS_PENALITES.sql` pour ajouter `jours_retard` et `montant_penalite`.

## 3. Insérer un crédit de test

**Option A - Script Node :**
```bash
cd backend
node scripts/insert-test-credit.js VOTRE_USER_ID
```
(Remplacer VOTRE_USER_ID par l'UUID de l'utilisateur, visible dans Supabase > utilisateurs)

**Option B - Demander un crédit** : Obtenir mon crédit > Demander via Mobile Money > soumettre.  
Si score ≥ 700, le crédit est créé automatiquement.
