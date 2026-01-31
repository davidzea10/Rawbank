-- Ajouter colonnes pénalités à remboursements
-- Exécuter dans Supabase > SQL Editor

ALTER TABLE remboursements
  ADD COLUMN IF NOT EXISTS jours_retard INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS montant_penalite DECIMAL(15,2) DEFAULT 0;
