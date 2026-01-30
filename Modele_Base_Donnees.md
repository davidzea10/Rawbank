# Modèle de Base de Données - RawFinance Pro

## Vue d'ensemble

Ce document présente le schéma complet de la base de données pour la plateforme RawFinance Pro, incluant toutes les tables nécessaires pour le scoring et la détection de fraude.

---

## 1. Schéma Conceptuel (MCD)

### Entités Principales

1. **utilisateurs** - Utilisateurs de la plateforme
2. **profils_utilisateurs** - Profils détaillés (Particulier/Entrepreneur)
3. **transactions_mobile_money** - Transactions Mobile Money
4. **recharges_telephoniques** - Historique des recharges téléphoniques
5. **enregistrements_cdr** - Call Detail Records (données téléphoniques détaillées)
6. **credits** - Prêts accordés
7. **remboursements** - Remboursements effectués
8. **scores_credit** - Scores de crédit calculés
9. **facteurs_score** - Facteurs détaillés du score
10. **detections_fraude** - Détections de fraude
11. **demandes_credit** - Demandes de crédit
12. **comptes_mobile_money** - Comptes Mobile Money connectés
13. **details_entrepreneurs** - Détails spécifiques pour les entrepreneurs
14. **donnees_sociales** - Données sociales connectées

---

## 2. Tables Détaillées avec Relations

### 2.1 Table: `utilisateurs`

**Description** : Table principale des utilisateurs (intégrée avec Supabase Auth)

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, NOT NULL | Identifiant unique (Supabase Auth) |
| `email` | VARCHAR(255) | UNIQUE | Email de l'utilisateur |
| `numero_telephone` | VARCHAR(20) | UNIQUE, NOT NULL | Numéro de téléphone (+243...) |
| `date_creation` | TIMESTAMP | DEFAULT NOW() | Date de création |
| `date_mise_a_jour` | TIMESTAMP | DEFAULT NOW() | Date de mise à jour |
| `est_actif` | BOOLEAN | DEFAULT true | Compte actif ou désactivé |
| `derniere_connexion` | TIMESTAMP | NULL | Dernière connexion |

**Index** :
- `idx_utilisateurs_telephone` sur `numero_telephone`
- `idx_utilisateurs_email` sur `email`

**Relations** :
- Un utilisateur **possède** plusieurs profils utilisateurs (1:N)
- Un utilisateur **possède** plusieurs comptes mobile money (1:N)
- Un utilisateur **effectue** plusieurs transactions mobile money (1:N)
- Un utilisateur **effectue** plusieurs recharges téléphoniques (1:N)
- Un utilisateur **génère** plusieurs enregistrements CDR (1:N)
- Un utilisateur **obtient** plusieurs crédits (1:N)
- Un utilisateur **soumet** plusieurs demandes de crédit (1:N)
- Un utilisateur **possède** plusieurs scores de crédit (1:N)
- Un utilisateur **peut avoir** plusieurs détections de fraude (1:N)
- Un utilisateur **connecte** plusieurs données sociales (1:N)

---

### 2.2 Table: `profils_utilisateurs`

**Description** : Profils détaillés des utilisateurs (Particulier ou Entrepreneur)

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Identifiant unique |
| `id_utilisateur` | UUID | FOREIGN KEY → utilisateurs(id), NOT NULL, UNIQUE | Référence utilisateur |
| `type_profil` | VARCHAR(20) | NOT NULL, CHECK (type_profil IN ('particulier', 'entrepreneur')) | Type de profil |
| `prenom` | VARCHAR(100) | NOT NULL | Prénom |
| `nom` | VARCHAR(100) | NOT NULL | Nom |
| `numero_cni` | VARCHAR(50) | UNIQUE | Numéro CNI |
| `url_photo_cni` | TEXT | NULL | URL photo CNI |
| `url_selfie` | TEXT | NULL | URL selfie |
| `date_naissance` | DATE | NULL | Date de naissance |
| `adresse` | TEXT | NULL | Adresse |
| `ville` | VARCHAR(100) | NULL | Ville |
| `profil_detecte_par_ia` | BOOLEAN | DEFAULT false | Détecté automatiquement par IA |
| `confiance_ia` | DECIMAL(5,4) | NULL, CHECK (confiance_ia >= 0 AND confiance_ia <= 1) | Confiance IA (0-1) |
| `date_creation` | TIMESTAMP | DEFAULT NOW() | Date de création |
| `date_mise_a_jour` | TIMESTAMP | DEFAULT NOW() | Date de mise à jour |

**Relations** :
- `id_utilisateur` → `utilisateurs.id` (1:1)
- Un profil utilisateur **appartient à** un utilisateur (N:1)
- Un profil utilisateur **peut avoir** des détails entrepreneur (1:1)

**Index** :
- `idx_profils_utilisateurs_id_utilisateur` sur `id_utilisateur`
- `idx_profils_utilisateurs_cni` sur `numero_cni`
- `idx_profils_utilisateurs_type` sur `type_profil`

---

### 2.3 Table: `details_entrepreneurs`

**Description** : Détails spécifiques pour les entrepreneurs

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Identifiant unique |
| `id_utilisateur` | UUID | FOREIGN KEY → utilisateurs(id), NOT NULL, UNIQUE | Référence utilisateur |
| `nom_entreprise` | VARCHAR(200) | NOT NULL | Nom de l'entreprise |
| `secteur_activite` | VARCHAR(100) | NULL | Secteur d'activité |
| `localisation` | VARCHAR(200) | NULL | Localisation |
| `date_enregistrement` | DATE | NULL | Date d'enregistrement |
| `description_activite` | TEXT | NULL | Description de l'activité |
| `date_creation` | TIMESTAMP | DEFAULT NOW() | Date de création |
| `date_mise_a_jour` | TIMESTAMP | DEFAULT NOW() | Date de mise à jour |

**Relations** :
- `id_utilisateur` → `utilisateurs.id` (1:1, uniquement si type_profil = 'entrepreneur')
- Les détails entrepreneur **appartiennent à** un utilisateur entrepreneur (N:1)

**Index** :
- `idx_details_entrepreneurs_id_utilisateur` sur `id_utilisateur`

---

### 2.4 Table: `comptes_mobile_money`

**Description** : Comptes Mobile Money connectés par les utilisateurs

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Identifiant unique |
| `id_utilisateur` | UUID | FOREIGN KEY → utilisateurs(id), NOT NULL | Référence utilisateur |
| `operateur` | VARCHAR(50) | NOT NULL | Opérateur (Orange Money, M-Pesa, Airtel Money) |
| `numero_compte` | VARCHAR(50) | NOT NULL | Numéro de compte Mobile Money |
| `est_verifie` | BOOLEAN | DEFAULT false | Compte vérifié |
| `est_principal` | BOOLEAN | DEFAULT false | Compte principal |
| `date_connexion` | TIMESTAMP | DEFAULT NOW() | Date de connexion |
| `derniere_synchronisation` | TIMESTAMP | NULL | Dernière synchronisation |
| `date_creation` | TIMESTAMP | DEFAULT NOW() | Date de création |

**Relations** :
- `id_utilisateur` → `utilisateurs.id` (N:1)
- Un compte mobile money **appartient à** un utilisateur (N:1)
- Un compte mobile money **contient** plusieurs transactions (1:N)

**Index** :
- `idx_comptes_mm_id_utilisateur` sur `id_utilisateur`
- `idx_comptes_mm_operateur` sur `operateur`

---

### 2.5 Table: `transactions_mobile_money`

**Description** : Historique des transactions Mobile Money

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Identifiant unique |
| `id_utilisateur` | UUID | FOREIGN KEY → utilisateurs(id), NOT NULL | Référence utilisateur |
| `id_compte` | UUID | FOREIGN KEY → comptes_mobile_money(id), NULL | Compte Mobile Money |
| `id_transaction` | VARCHAR(100) | UNIQUE | Identifiant transaction opérateur |
| `type_transaction` | VARCHAR(20) | NOT NULL, CHECK (type_transaction IN ('entree', 'sortie')) | Type (Entrée/Sortie) |
| `montant` | DECIMAL(15,2) | NOT NULL, CHECK (montant > 0) | Montant en CDF |
| `date` | TIMESTAMP | NOT NULL | Date de la transaction |
| `libelle` | VARCHAR(200) | NULL | Libellé (ex: "Achat Stock", "Famille", "Vente") |
| `description` | TEXT | NULL | Description détaillée |
| `contrepartie` | VARCHAR(100) | NULL | Contrepartie (numéro ou nom) |
| `solde_apres` | DECIMAL(15,2) | NULL | Solde après transaction |
| `date_creation` | TIMESTAMP | DEFAULT NOW() | Date d'import |

**Relations** :
- `id_utilisateur` → `utilisateurs.id` (N:1)
- `id_compte` → `comptes_mobile_money.id` (N:1)
- Une transaction mobile money **appartient à** un utilisateur (N:1)
- Une transaction mobile money **appartient à** un compte mobile money (N:1)

**Index** :
- `idx_transactions_mm_id_utilisateur` sur `id_utilisateur`
- `idx_transactions_mm_date` sur `date`
- `idx_transactions_mm_type` sur `type_transaction`
- `idx_transactions_mm_id_transaction` sur `id_transaction`

---

### 2.6 Table: `recharges_telephoniques`

**Description** : Historique des recharges téléphoniques

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Identifiant unique |
| `id_utilisateur` | UUID | FOREIGN KEY → utilisateurs(id), NOT NULL | Référence utilisateur |
| `numero_telephone` | VARCHAR(20) | NOT NULL | Numéro rechargé |
| `operateur` | VARCHAR(50) | NOT NULL | Opérateur (Orange, Vodacom, Airtel) |
| `montant` | DECIMAL(10,2) | NOT NULL, CHECK (montant > 0) | Montant de la recharge |
| `date_recharge` | TIMESTAMP | NOT NULL | Date de la recharge |
| `type_recharge` | VARCHAR(50) | NULL | Type (crédit, data, bundle) |
| `date_creation` | TIMESTAMP | DEFAULT NOW() | Date d'import |

**Relations** :
- `id_utilisateur` → `utilisateurs.id` (N:1)
- Une recharge téléphonique **appartient à** un utilisateur (N:1)

**Index** :
- `idx_recharges_id_utilisateur` sur `id_utilisateur`
- `idx_recharges_date` sur `date_recharge`
- `idx_recharges_telephone` sur `numero_telephone`

---

### 2.7 Table: `enregistrements_cdr`

**Description** : Call Detail Records - Données détaillées d'activité téléphonique

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Identifiant unique |
| `id_cdr` | VARCHAR(50) | UNIQUE, NOT NULL | Identifiant CDR (ex: CDR00000001) |
| `id_utilisateur` | UUID | FOREIGN KEY → utilisateurs(id), NULL | Référence utilisateur (si disponible) |
| `horodatage` | TIMESTAMP | NOT NULL | Date et heure de l'appel/transaction |
| `operateur` | VARCHAR(50) | NOT NULL | Opérateur (Airtel, Orange, Vodacom) |
| `numero_appelant` | VARCHAR(20) | NOT NULL | Numéro appelant (+234...) |
| `numero_appele` | VARCHAR(20) | NULL | Numéro appelé |
| `type_appel` | VARCHAR(50) | NOT NULL | Type (appel, sms, données) |
| `duree_secondes` | INTEGER | DEFAULT 0, CHECK (duree_secondes >= 0) | Durée en secondes (pour appels) |
| `volume_donnees_mb` | DECIMAL(10,2) | DEFAULT 0, CHECK (volume_donnees_mb >= 0) | Volume données en MB |
| `nombre_sms` | INTEGER | DEFAULT 0, CHECK (nombre_sms >= 0) | Nombre de SMS |
| `id_tour` | VARCHAR(50) | NULL | Identifiant de la tour cellulaire |
| `ville` | VARCHAR(100) | NULL | Ville |
| `type_reseau` | VARCHAR(20) | NULL | Type réseau (2G, 3G, 4G, 5G) |
| `statut_appel` | VARCHAR(50) | NULL | Statut (complété, échoué, annulé) |
| `date_creation` | TIMESTAMP | DEFAULT NOW() | Date d'import |

**Relations** :
- `id_utilisateur` → `utilisateurs.id` (N:1, nullable - peut être lié via numero_telephone)
- Un enregistrement CDR **appartient à** un utilisateur (N:1)

**Index** :
- `idx_cdr_id_cdr` sur `id_cdr`
- `idx_cdr_id_utilisateur` sur `id_utilisateur`
- `idx_cdr_horodatage` sur `horodatage`
- `idx_cdr_numero_appelant` sur `numero_appelant`
- `idx_cdr_operateur` sur `operateur`
- `idx_cdr_type_appel` sur `type_appel`

---

### 2.8 Table: `credits`

**Description** : Prêts accordés aux utilisateurs

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Identifiant unique |
| `id_utilisateur` | UUID | FOREIGN KEY → utilisateurs(id), NOT NULL | Référence utilisateur |
| `id_demande` | UUID | FOREIGN KEY → demandes_credit(id), NULL | Demande de crédit associée |
| `type_credit` | VARCHAR(50) | NOT NULL | Type (personnel, urgence, projet, trésorerie, investissement, saisonnier) |
| `montant` | DECIMAL(15,2) | NOT NULL, CHECK (montant > 0) | Montant du crédit en CDF |
| `taux_interet` | DECIMAL(5,2) | NOT NULL, CHECK (taux_interet >= 0) | Taux d'intérêt annuel (%) |
| `duree_mois` | INTEGER | NOT NULL, CHECK (duree_mois > 0) | Durée en mois |
| `mensualite` | DECIMAL(15,2) | NOT NULL | Mensualité calculée |
| `date_debut` | DATE | NOT NULL | Date de début |
| `date_fin` | DATE | NOT NULL | Date de fin prévue |
| `statut` | VARCHAR(50) | NOT NULL, DEFAULT 'active', CHECK (statut IN ('pending', 'active', 'completed', 'defaulted', 'cancelled')) | Statut du crédit |
| `approuve_par` | UUID | FOREIGN KEY → utilisateurs(id), NULL | Admin qui a approuvé |
| `date_approbation` | TIMESTAMP | NULL | Date d'approbation |
| `date_decaissement` | TIMESTAMP | NULL | Date de décaissement |
| `date_completion` | TIMESTAMP | NULL | Date de remboursement complet |
| `date_creation` | TIMESTAMP | DEFAULT NOW() | Date de création |

**Relations** :
- `id_utilisateur` → `utilisateurs.id` (N:1)
- `id_demande` → `demandes_credit.id` (N:1)
- `approuve_par` → `utilisateurs.id` (N:1, admin)
- Un crédit **appartient à** un utilisateur (N:1)
- Un crédit **provient de** une demande de crédit (N:1)
- Un crédit **est approuvé par** un utilisateur admin (N:1)
- Un crédit **a** plusieurs remboursements (1:N)

**Index** :
- `idx_credits_id_utilisateur` sur `id_utilisateur`
- `idx_credits_statut` sur `statut`
- `idx_credits_dates` sur `date_debut`, `date_fin`

---

### 2.9 Table: `remboursements`

**Description** : Remboursements effectués par les utilisateurs

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Identifiant unique |
| `id_credit` | UUID | FOREIGN KEY → credits(id), NOT NULL | Référence crédit |
| `id_utilisateur` | UUID | FOREIGN KEY → utilisateurs(id), NOT NULL | Référence utilisateur |
| `montant` | DECIMAL(15,2) | NOT NULL, CHECK (montant > 0) | Montant remboursé |
| `date_paiement` | DATE | NOT NULL | Date de paiement |
| `date_echeance` | DATE | NOT NULL | Date d'échéance |
| `est_a_temps` | BOOLEAN | GENERATED ALWAYS AS (date_paiement <= date_echeance) STORED | Paiement à temps |
| `methode_paiement` | VARCHAR(50) | NULL | Méthode (mobile_money, cash, bank_transfer) |
| `reference_transaction` | VARCHAR(100) | NULL | Référence transaction |
| `statut` | VARCHAR(50) | DEFAULT 'completed', CHECK (statut IN ('pending', 'completed', 'failed')) | Statut |
| `date_creation` | TIMESTAMP | DEFAULT NOW() | Date de création |

**Relations** :
- `id_credit` → `credits.id` (N:1)
- `id_utilisateur` → `utilisateurs.id` (N:1)
- Un remboursement **appartient à** un crédit (N:1)
- Un remboursement **est effectué par** un utilisateur (N:1)

**Index** :
- `idx_remboursements_id_credit` sur `id_credit`
- `idx_remboursements_id_utilisateur` sur `id_utilisateur`
- `idx_remboursements_date_echeance` sur `date_echeance`
- `idx_remboursements_date_paiement` sur `date_paiement`

---

### 2.10 Table: `demandes_credit`

**Description** : Demandes de crédit soumises par les utilisateurs

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Identifiant unique |
| `id_utilisateur` | UUID | FOREIGN KEY → utilisateurs(id), NOT NULL | Référence utilisateur |
| `type_credit` | VARCHAR(50) | NOT NULL | Type demandé |
| `montant_demande` | DECIMAL(15,2) | NOT NULL, CHECK (montant_demande > 0) | Montant demandé |
| `duree_demandee_mois` | INTEGER | NOT NULL | Durée demandée |
| `raison` | TEXT | NULL | Raison du crédit |
| `score_actuel` | INTEGER | NULL, CHECK (score_actuel >= 0 AND score_actuel <= 1000) | Score au moment de la demande |
| `score_risque_fraude` | DECIMAL(5,2) | NULL, CHECK (score_risque_fraude >= 0 AND score_risque_fraude <= 100) | Score de risque fraude |
| `statut` | VARCHAR(50) | DEFAULT 'pending', CHECK (statut IN ('pending', 'approved', 'rejected', 'cancelled')) | Statut |
| `decision` | VARCHAR(50) | NULL, CHECK (decision IN ('automatic', 'manual')) | Type de décision |
| `montant_approuve` | DECIMAL(15,2) | NULL | Montant approuvé (peut différer) |
| `raison_rejet` | TEXT | NULL | Raison de rejet |
| `revu_par` | UUID | FOREIGN KEY → utilisateurs(id), NULL | Admin qui a revu |
| `date_revue` | TIMESTAMP | NULL | Date de revue |
| `date_creation` | TIMESTAMP | DEFAULT NOW() | Date de création |
| `date_mise_a_jour` | TIMESTAMP | DEFAULT NOW() | Date de mise à jour |

**Relations** :
- `id_utilisateur` → `utilisateurs.id` (N:1)
- `revu_par` → `utilisateurs.id` (N:1, admin)
- Une demande de crédit **est soumise par** un utilisateur (N:1)
- Une demande de crédit **est revue par** un utilisateur admin (N:1)
- Une demande de crédit **génère** un crédit (1:1)
- Une demande de crédit **peut avoir** une détection de fraude (1:1)

**Index** :
- `idx_demandes_id_utilisateur` sur `id_utilisateur`
- `idx_demandes_statut` sur `statut`
- `idx_demandes_date_creation` sur `date_creation`

---

### 2.11 Table: `scores_credit`

**Description** : Scores de crédit calculés pour les utilisateurs

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Identifiant unique |
| `id_utilisateur` | UUID | FOREIGN KEY → utilisateurs(id), NOT NULL | Référence utilisateur |
| `score` | INTEGER | NOT NULL, CHECK (score >= 0 AND score <= 1000) | Score total (0-1000) |
| `type_score` | VARCHAR(50) | NOT NULL, CHECK (type_score IN ('alternatif', 'transactionnel')) | Type de score |
| `montant_eligible` | DECIMAL(15,2) | NULL | Montant éligible calculé |
| `date_calcul` | TIMESTAMP | DEFAULT NOW() | Date de calcul |
| `version_modele` | VARCHAR(50) | NULL | Version du modèle IA utilisé |
| `est_actuel` | BOOLEAN | DEFAULT true | Score actuel (dernier calcul) |
| `date_creation` | TIMESTAMP | DEFAULT NOW() | Date de création |

**Relations** :
- `id_utilisateur` → `utilisateurs.id` (N:1)
- Un score de crédit **appartient à** un utilisateur (N:1)
- Un score de crédit **contient** plusieurs facteurs de score (1:N)

**Index** :
- `idx_scores_id_utilisateur` sur `id_utilisateur`
- `idx_scores_actuel` sur `id_utilisateur`, `est_actuel` WHERE `est_actuel = true`
- `idx_scores_date_calcul` sur `date_calcul`

---

### 2.12 Table: `facteurs_score`

**Description** : Facteurs détaillés du score (pour explication et analyse)

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Identifiant unique |
| `id_score_credit` | UUID | FOREIGN KEY → scores_credit(id), NOT NULL | Référence score |
| `id_utilisateur` | UUID | FOREIGN KEY → utilisateurs(id), NOT NULL | Référence utilisateur |
| `nom_facteur` | VARCHAR(100) | NOT NULL | Nom du facteur |
| `valeur_facteur` | DECIMAL(10,4) | NOT NULL | Valeur du facteur |
| `poids_facteur` | DECIMAL(5,4) | NULL | Poids du facteur (0-1) |
| `contribution` | DECIMAL(10,2) | NULL | Contribution au score total |
| `categorie` | VARCHAR(50) | NULL | Catégorie (mobile_money, phone, social, transactional, community, business) |
| `date_creation` | TIMESTAMP | DEFAULT NOW() | Date de création |

**Relations** :
- `id_score_credit` → `scores_credit.id` (N:1)
- `id_utilisateur` → `utilisateurs.id` (N:1)
- Un facteur de score **appartient à** un score de crédit (N:1)
- Un facteur de score **appartient à** un utilisateur (N:1)

**Index** :
- `idx_facteurs_id_score` sur `id_score_credit`
- `idx_facteurs_id_utilisateur` sur `id_utilisateur`
- `idx_facteurs_categorie` sur `categorie`

**Facteurs possibles** :
- `avg_monthly_income` : Revenu moyen sur 6 mois
- `transaction_regularity` : Score de régularité (0-1)
- `recharge_frequency` : Fréquence de recharges par mois
- `business_pattern_score` : Score pattern business (0-1)
- `old_debt_ratio` : Ratio crédits remboursés à temps (0-1)
- `phone_activity_score` : Score activité téléphonique
- `social_presence_score` : Score présence sociale
- `stability_score` : Score de stabilité
- `growth_score` : Score de croissance (entrepreneurs)
- `seasonality_score` : Score saisonnalité (entrepreneurs)

---

### 2.13 Table: `fraud_detections`

**Description** : Détections de fraude et analyses de risque

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | ID unique |
| `user_id` | UUID | FOREIGN KEY → users(id), NULL | Référence utilisateur |
| `credit_application_id` | UUID | FOREIGN KEY → credit_applications(id), NULL | Demande de crédit associée |
| `risk_score` | DECIMAL(5,2) | NOT NULL, CHECK (risk_score >= 0 AND risk_score <= 100) | Score de risque (0-100) |
| `risk_level` | VARCHAR(20) | NOT NULL, CHECK (risk_level IN ('low', 'medium', 'high', 'critical')) | Niveau de risque |
| `detected_anomalies` | JSONB | NULL | Liste des anomalies détectées |
| `flags` | JSONB | NULL | Drapeaux de suspicion |
| `model_version` | VARCHAR(50) | NULL | Version du modèle utilisé |
| `requires_review` | BOOLEAN | DEFAULT false | Nécessite revue manuelle |
| `reviewed_by` | UUID | FOREIGN KEY → users(id), NULL | Admin qui a revu |
| `reviewed_at` | TIMESTAMP | NULL | Date de revue |
| `review_notes` | TEXT | NULL | Notes de revue |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Date de détection |

**Relations** :
- `user_id` → `users.id` (N:1)
- `credit_application_id` → `credit_applications.id` (N:1)
- `reviewed_by` → `users.id` (N:1, admin)

**Index** :
- `idx_fraud_user_id` sur `user_id`
- `idx_fraud_application_id` sur `credit_application_id`
- `idx_fraud_risk_level` sur `risk_level`
- `idx_fraud_requires_review` sur `requires_review`

**Exemples d'anomalies détectées** (dans JSONB) :
```json
{
  "circular_transactions": true,
  "suspicious_amounts": false,
  "unusual_patterns": true,
  "data_inconsistencies": ["score_social_elevated_but_transactions_low"],
  "timing_anomalies": true
}
```

---

### 2.14 Table: `donnees_sociales` (Optionnel)

**Description** : Données sociales connectées (avec consentement)

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Identifiant unique |
| `id_utilisateur` | UUID | FOREIGN KEY → utilisateurs(id), NOT NULL | Référence utilisateur |
| `plateforme` | VARCHAR(50) | NOT NULL | Plateforme (Facebook, LinkedIn, Twitter) |
| `id_utilisateur_plateforme` | VARCHAR(100) | NULL | Identifiant utilisateur sur la plateforme |
| `est_verifie` | BOOLEAN | DEFAULT false | Compte vérifié |
| `age_compte_jours` | INTEGER | NULL | Âge du compte en jours |
| `nombre_followers` | INTEGER | DEFAULT 0 | Nombre de followers |
| `nombre_connexions` | INTEGER | DEFAULT 0 | Nombre de connexions |
| `score_sentiment` | DECIMAL(5,4) | NULL | Score de sentiment (0-1) |
| `consentement_donne` | BOOLEAN | DEFAULT false | Consentement donné |
| `date_consentement` | TIMESTAMP | NULL | Date de consentement |
| `derniere_synchronisation` | TIMESTAMP | NULL | Dernière synchronisation |
| `date_creation` | TIMESTAMP | DEFAULT NOW() | Date de création |
| `date_mise_a_jour` | TIMESTAMP | DEFAULT NOW() | Date de mise à jour |

**Relations** :
- `id_utilisateur` → `utilisateurs.id` (N:1)
- Une donnée sociale **appartient à** un utilisateur (N:1)

**Index** :
- `idx_donnees_sociales_id_utilisateur` sur `id_utilisateur`
- `idx_donnees_sociales_plateforme` sur `plateforme`

---

## 3. Diagramme des Relations

```
utilisateurs (1) ──< (N) profils_utilisateurs
  └─> possède

utilisateurs (1) ──< (N) comptes_mobile_money
  └─> possède

utilisateurs (1) ──< (N) transactions_mobile_money
  └─> effectue

utilisateurs (1) ──< (N) recharges_telephoniques
  └─> effectue

utilisateurs (1) ──< (N) enregistrements_cdr
  └─> génère

utilisateurs (1) ──< (N) credits
  └─> obtient

utilisateurs (1) ──< (N) demandes_credit
  └─> soumet

utilisateurs (1) ──< (N) scores_credit
  └─> possède

utilisateurs (1) ──< (N) detections_fraude
  └─> peut avoir

utilisateurs (1) ──< (N) donnees_sociales
  └─> connecte

profils_utilisateurs (1) ──< (1) details_entrepreneurs
  └─> peut avoir [si type_profil = 'entrepreneur']

comptes_mobile_money (1) ──< (N) transactions_mobile_money
  └─> contient

credits (1) ──< (N) remboursements
  └─> a

demandes_credit (1) ──< (1) credits
  └─> génère

demandes_credit (1) ──< (1) detections_fraude
  └─> peut avoir

scores_credit (1) ──< (N) facteurs_score
  └─> contient
```

---

## 4. Features Calculées pour l'IA

Ces features seront calculées à partir des tables ci-dessus pour alimenter les modèles de scoring :

### 4.1 Features pour Scoring Alternatif (Particuliers)

| Feature | Source | Calcul |
|---------|--------|--------|
| `avg_monthly_income` | `transactions_mobile_money` | Moyenne des montants "entree" sur 6 derniers mois |
| `transaction_regularity` | `transactions_mobile_money` | Score 0-1 basé sur fréquence quotidienne |
| `recharge_frequency` | `recharges_telephoniques` | Nombre de recharges par mois (moyenne) |
| `phone_activity_score` | `enregistrements_cdr` | Score basé sur durée, volume données, régularité |
| `social_presence_score` | `donnees_sociales` | Score basé sur vérification, âge compte, réseau |
| `old_debt_ratio` | `remboursements` | Pourcentage de remboursements à temps |
| `account_age_months` | `comptes_mobile_money` | Ancienneté du compte Mobile Money |

### 4.2 Features pour Scoring Transactionnel (Entrepreneurs)

| Feature | Source | Calcul |
|---------|--------|--------|
| `avg_monthly_revenue` | `transactions_mobile_money` | Moyenne ventes (entree) sur 6 mois |
| `revenue_growth_rate` | `transactions_mobile_money` | Taux de croissance mensuel |
| `transaction_frequency` | `transactions_mobile_money` | Nombre de transactions par jour |
| `business_pattern_score` | `transactions_mobile_money.libelle` | Score IA sur mots-clés business |
| `stability_score` | `transactions_mobile_money` | Score basé sur régularité et ancienneté |
| `seasonality_detected` | `transactions_mobile_money` | Détection cycles saisonniers |
| `supplier_regularity` | `transactions_mobile_money` | Régularité des achats (sortie) |
| `investment_frequency` | `transactions_mobile_money` | Fréquence investissements |

### 4.3 Features pour Détection de Fraude

| Feature | Source | Calcul |
|---------|--------|--------|
| `circular_transaction_flag` | `transactions_mobile_money` | Transactions circulaires détectées |
| `amount_consistency` | `transactions_mobile_money` | Cohérence des montants |
| `timing_anomalies` | `transactions_mobile_money`, `enregistrements_cdr` | Anomalies temporelles |
| `data_inconsistencies` | Multiples tables | Incohérences entre données |
| `pattern_anomalies` | `transactions_mobile_money` | Patterns suspects |

---

## 5. Vues Utiles (Views SQL)

### 5.1 Vue: `user_scoring_features`

Vue agrégée pour faciliter le calcul des features de scoring :

```sql
CREATE VIEW user_scoring_features AS
SELECT 
    u.id as user_id,
    up.profile_type,
    -- Features Mobile Money
    AVG(CASE WHEN mmt.type_transaction = 'entree' THEN mmt.montant ELSE 0 END) 
        FILTER (WHERE mmt.date >= NOW() - INTERVAL '6 months') as avg_monthly_income,
    -- Features régularité
    COUNT(DISTINCT DATE(mmt.date))::DECIMAL / 
        NULLIF(EXTRACT(EPOCH FROM (NOW() - MIN(mmt.date))) / 86400, 0) as transaction_regularity,
    -- Features recharges
    COUNT(pr.id)::DECIMAL / 
        NULLIF(EXTRACT(EPOCH FROM (NOW() - MIN(pr.recharge_date))) / 2592000, 0) as recharge_frequency,
    -- Features CDR
    AVG(cdr.duration_seconds) as avg_call_duration,
    SUM(cdr.data_volume_mb) as total_data_volume,
    -- Features crédits
    COUNT(DISTINCT c.id) as total_credits,
    AVG(CASE WHEN r.is_on_time THEN 1.0 ELSE 0.0 END) as old_debt_ratio
FROM utilisateurs u
LEFT JOIN profils_utilisateurs up ON u.id = up.id_utilisateur
LEFT JOIN transactions_mobile_money mmt ON u.id = mmt.id_utilisateur
LEFT JOIN recharges_telephoniques pr ON u.id = pr.id_utilisateur
LEFT JOIN credits c ON u.id = c.id_utilisateur
LEFT JOIN remboursements r ON c.id = r.id_credit
LEFT JOIN enregistrements_cdr cdr ON u.numero_telephone = cdr.numero_appelant
GROUP BY u.id, up.profile_type;
```

---

## 6. Contraintes et Règles Métier

### 6.1 Règles de Validation

1. **Un utilisateur ne peut avoir qu'un seul profil actif** : Contrainte UNIQUE sur `profils_utilisateurs.id_utilisateur`
2. **Un utilisateur entrepreneur doit avoir des détails entrepreneur** : Contrainte logique (vérification applicative)
3. **Les transactions doivent avoir un montant positif** : CHECK constraint
4. **Les scores doivent être entre 0 et 1000** : CHECK constraint
5. **Les dates de remboursement doivent être après la date de crédit** : Contrainte applicative

### 6.2 Triggers Recommandés

1. **Mise à jour automatique de `updated_at`** : Trigger sur toutes les tables
2. **Recalcul automatique du score** : Trigger après nouvelles transactions
3. **Mise à jour `est_actuel` dans scores_credit** : Trigger pour désactiver anciens scores

---

## 7. Index de Performance

### Index Critiques

```sql
-- Pour requêtes de scoring fréquentes
CREATE INDEX idx_transactions_mm_utilisateur_date ON transactions_mobile_money(id_utilisateur, date DESC);
CREATE INDEX idx_cdr_utilisateur_horodatage ON enregistrements_cdr(id_utilisateur, horodatage DESC);
CREATE INDEX idx_recharges_utilisateur_date ON recharges_telephoniques(id_utilisateur, date_recharge DESC);

-- Pour requêtes de fraude
CREATE INDEX idx_fraude_score_risque ON detections_fraude(score_risque DESC);
CREATE INDEX idx_demandes_fraude ON demandes_credit(score_risque_fraude DESC);

-- Pour requêtes de crédits
CREATE INDEX idx_credits_utilisateur_statut ON credits(id_utilisateur, statut);
CREATE INDEX idx_remboursements_credit_statut ON remboursements(id_credit, statut);
```

---

## 8. Notes d'Implémentation

1. **Enregistrements CDR** : Les CDR peuvent être importés en masse et liés aux utilisateurs via `numero_telephone` ou `numero_appelant`
2. **Calcul des Features** : Les features seront calculées via des fonctions SQL ou scripts Python avant l'entraînement des modèles
3. **Historique des Scores** : La table `scores_credit` garde l'historique avec `est_actuel` pour tracer l'évolution
4. **Détection de Fraude** : Les résultats sont stockés dans `detections_fraude` avec détails JSONB pour flexibilité
5. **Simulation** : Pour le hackathon, toutes les données seront simulées dans Supabase

---

## 9. Prochaines Étapes

1. Créer les tables dans Supabase selon ce schéma
2. Créer les migrations SQL
3. Créer les scripts de seed pour données de test
4. Implémenter les fonctions de calcul de features
5. Créer les vues SQL pour faciliter les requêtes
6. Configurer les triggers et contraintes
