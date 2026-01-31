-- =============================================================================
-- Insérer UN crédit de test pour un utilisateur spécifique
-- À exécuter dans Supabase > SQL Editor
-- Remplacez 'fddcf649-fe96-4ef0-9707-6524ad50f288' par votre ID si besoin
-- =============================================================================

DO $$
DECLARE
  v_user_id UUID := 'fddcf649-fe96-4ef0-9707-6524ad50f288';
  v_demande_id UUID;
  v_montant DECIMAL := 150000;
  v_duree INT := 3;
  v_mensualite DECIMAL;
  v_date_debut DATE := CURRENT_DATE;
  v_date_fin DATE := CURRENT_DATE + INTERVAL '3 months';
BEGIN
  -- Vérifier que l'utilisateur existe
  IF NOT EXISTS (SELECT 1 FROM utilisateurs WHERE id = v_user_id) THEN
    RAISE EXCEPTION 'Utilisateur % introuvable dans la table utilisateurs', v_user_id;
  END IF;

  -- Mensualité (taux 4%/mois, 3 mois - score 700-799)
  v_mensualite := ROUND(v_montant * (0.04 * power(1.04, v_duree)) / (power(1.04, v_duree) - 1));

  -- 1. Créer la demande
  INSERT INTO demandes_credit (
    id_utilisateur, type_credit, montant_demande, duree_demandee_mois,
    score_actuel, statut, decision, montant_approuve
  ) VALUES (
    v_user_id, 'microcredit', v_montant, v_duree,
    827, 'approved', 'automatic', v_montant
  )
  RETURNING id INTO v_demande_id;

  -- 2. Créer le crédit
  INSERT INTO credits (
    id_utilisateur, id_demande, type_credit, montant, taux_interet,
    duree_mois, mensualite, date_debut, date_fin, statut
  )   VALUES (
    v_user_id, v_demande_id, 'microcredit', v_montant, 4,
    v_duree, v_mensualite, v_date_debut, v_date_fin, 'active'
  );

  RAISE NOTICE 'Crédit de test créé : montant %, mensualité %, statut active', v_montant, v_mensualite;
END $$;
