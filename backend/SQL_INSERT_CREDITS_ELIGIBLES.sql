-- =============================================================================
-- Insertion des crédits pour les utilisateurs éligibles
-- Exécuter dans Supabase > SQL Editor (partie 1 puis partie 2)
--
-- Partie 1 : Demandes
-- Partie 2 : Crédits (score >= 700)
-- =============================================================================

-- PARTIE 1 : Créer les demandes pour chaque utilisateur dont le numéro est dans donnees_operateurs
WITH scores AS (
  SELECT 
    u.id AS id_utilisateur,
    LEAST(1000, GREATEST(500,
      COALESCE(o.transaction_regularity, 0) * 350 +
      LEAST(1, COALESCE(o.avg_balance, 0) / 100000) * 350 +
      LEAST(1, COALESCE(o.avg_transaction_amount, 0) / 50000) * 200 +
      COALESCE(o.phone_activity_score, 0) * 100
    ))::INTEGER AS score_proxy
  FROM utilisateurs u
  JOIN donnees_operateurs o ON replace(replace(trim(coalesce(u.numero_telephone, '')), '+', ''), ' ', '') = replace(replace(trim(coalesce(o.numero_telephone, '')), '+', ''), ' ', '')
  WHERE NOT EXISTS (SELECT 1 FROM demandes_credit d WHERE d.id_utilisateur = u.id)
)
INSERT INTO demandes_credit (
  id_utilisateur,
  type_credit,
  montant_demande,
  duree_demandee_mois,
  score_actuel,
  statut,
  decision,
  montant_approuve
)
SELECT 
  id_utilisateur,
  'microcredit',
  ROUND((score_proxy::numeric / 1000) * 300000),
  3,
  score_proxy,
  CASE WHEN score_proxy >= 700 THEN 'approved' ELSE 'pending' END,
  CASE WHEN score_proxy >= 700 THEN 'automatic' ELSE 'manual' END,
  CASE WHEN score_proxy >= 700 THEN ROUND((score_proxy::numeric / 1000) * 300000) ELSE NULL END
FROM scores;

-- PARTIE 2 : Créer les crédits pour les demandes approuvées (score >= 700)
-- Taux : 900+ => 3%, 800-899 => 3.5%, 700-799 => 4%
WITH credits_insert AS (
  SELECT 
    d.id_utilisateur,
    d.id AS id_demande,
    d.montant_approuve,
    d.score_actuel,
    CASE 
      WHEN d.score_actuel >= 900 THEN 3
      WHEN d.score_actuel >= 800 THEN 3.5
      ELSE 4
    END AS taux,
    3 AS duree
  FROM demandes_credit d
  WHERE d.statut = 'approved' 
    AND d.score_actuel >= 700
    AND d.montant_approuve IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM credits c WHERE c.id_demande = d.id)
)
INSERT INTO credits (
  id_utilisateur, id_demande, type_credit, montant, taux_interet, duree_mois,
  mensualite, date_debut, date_fin, statut
)
SELECT 
  id_utilisateur, id_demande, 'microcredit', montant_approuve, taux, duree,
  ROUND(montant_approuve * ((taux/100) * power(1 + taux/100, duree)) / (power(1 + taux/100, duree) - 1))::integer,
  CURRENT_DATE, CURRENT_DATE + INTERVAL '3 months', 'active'
FROM credits_insert;
