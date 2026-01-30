-- ============================================
-- RawFinance Pro - Création des 15 tables
-- 14 tables application + 1 table opérateurs
-- À exécuter dans Supabase SQL Editor
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. UTILISATEURS
-- ============================================
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

-- ============================================
-- 2. PROFILS UTILISATEURS
-- ============================================
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

-- ============================================
-- 3. DÉTAILS ENTREPRENEURS
-- ============================================
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

-- ============================================
-- 4. COMPTES MOBILE MONEY
-- ============================================
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

-- ============================================
-- 5. DONNÉES SOCIALES
-- ============================================
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

-- ============================================
-- 6. TRANSACTIONS MOBILE MONEY
-- ============================================
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

-- ============================================
-- 7. RECHARGES TÉLÉPHONIQUES
-- ============================================
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

-- ============================================
-- 8. ENREGISTREMENTS CDR
-- ============================================
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

-- ============================================
-- 9. DEMANDES CRÉDIT
-- ============================================
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

-- ============================================
-- 10. SCORES CRÉDIT
-- ============================================
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

-- ============================================
-- 11. CREDITS
-- ============================================
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

-- ============================================
-- 12. REMBOURSEMENTS
-- ============================================
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

-- ============================================
-- 13. FACTEURS SCORE
-- ============================================
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

-- ============================================
-- 14. DÉTECTIONS FRAUDE
-- ============================================
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

-- ============================================
-- 15. DONNÉES OPÉRATEURS (BDD simulée opérateurs)
-- Source : final_features.csv - Import ultérieur
-- ============================================
CREATE TABLE donnees_operateurs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero_telephone VARCHAR(20) NOT NULL UNIQUE,
  avg_transaction_amount DECIMAL(15,2) DEFAULT 0,
  transaction_amount_std DECIMAL(15,2) DEFAULT 0,
  avg_balance DECIMAL(15,2) DEFAULT 0,
  balance_volatility DECIMAL(15,2) DEFAULT 0,
  fee_ratio DECIMAL(15,2) DEFAULT 0,
  transaction_regularity DECIMAL(10,6) DEFAULT 0,
  recharge_frequency DECIMAL(10,4) DEFAULT 0,
  avg_recharge_amount DECIMAL(15,2) DEFAULT 0,
  small_recharge_ratio DECIMAL(10,6) DEFAULT 0,
  total_calls INTEGER DEFAULT 0,
  avg_call_duration DECIMAL(10,2) DEFAULT 0,
  total_data_mb DECIMAL(15,2) DEFAULT 0,
  total_sms INTEGER DEFAULT 0,
  call_failure_rate DECIMAL(10,6) DEFAULT 0,
  phone_activity_score DECIMAL(10,6) DEFAULT 0,
  date_creation TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_donnees_operateurs_numero ON donnees_operateurs(numero_telephone);
