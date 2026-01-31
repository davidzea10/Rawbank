const { supabase } = require('../config/supabase');
const scoreService = require('../services/scoreService');
const rateService = require('../services/rateService');

/**
 * POST /api/users/:id/credits/request
 * - Score 700-1000 : approbation automatique, crédit créé immédiatement
 * - Score 500-699 : validation manuelle (demande en attente, pas de crédit)
 * - Score < 500 : refusé
 * Taux : 900+ => 3%, 800-899 => 3.5%, 700-799 => 4%
 * Durées : 1, 3, 6 mois
 * Body: { amount, duration, purpose }
 */
async function createRequest(req, res, next) {
  try {
    const { id: idUtilisateur } = req.params;
    const { amount, duration, purpose } = req.body || {};

    if (!amount || amount < 10000) {
      return res.status(400).json({ ok: false, message: 'Montant invalide (min 10 000 CDF)' });
    }
    if (![1, 3, 6].includes(Number(duration))) {
      return res.status(400).json({ ok: false, message: 'Durée invalide (1, 3 ou 6 mois)' });
    }

    const scoreResult = await scoreService.getScoreForUser(idUtilisateur);
    if (!scoreResult.ok) {
      return res.status(400).json({ ok: false, message: scoreResult.message || 'Score non calculable' });
    }

    const { score, creditLimit } = scoreResult;
    if (score < 500) {
      return res.status(400).json({ ok: false, message: 'Score insuffisant (< 500)' });
    }
    const principal = Number(amount);
    const duree = Number(duration);
    let tauxInteret = null;
    let mensualite = 0;
    if (score >= 700) {
      tauxInteret = await rateService.getTauxFinal(score, idUtilisateur);
      if (tauxInteret == null) {
        return res.status(400).json({ ok: false, message: 'Score insuffisant pour approbation automatique' });
      }
      mensualite = rateService.calculMensualite(principal, tauxInteret, duree);
    }

    if (principal > creditLimit) {
      return res.status(400).json({
        ok: false,
        message: `Montant supérieur au plafond (${creditLimit.toLocaleString()} CDF)`,
      });
    }

    const dateDebut = new Date();
    const dateFin = new Date();
    dateFin.setMonth(dateFin.getMonth() + duree);

    const { data: demande, error: errDemande } = await supabase
      .from('demandes_credit')
      .insert({
        id_utilisateur: idUtilisateur,
        type_credit: 'microcredit',
        montant_demande: principal,
        duree_demandee_mois: duree,
        raison: purpose || null,
        score_actuel: score,
        statut: score >= 700 ? 'approved' : score >= 500 ? 'pending' : 'rejected',
        decision: score >= 700 ? 'automatic' : score >= 500 ? 'manual' : null,
        montant_approuve: score >= 700 ? principal : null,
        raison_rejet: score < 500 ? 'Score insuffisant (< 500)' : null,
      })
      .select('id')
      .single();

    if (errDemande) throw errDemande;

    let credit = null;
    if (score >= 700) {
      const { data: cr, error: errCredit } = await supabase
        .from('credits')
        .insert({
          id_utilisateur: idUtilisateur,
          id_demande: demande.id,
          type_credit: 'microcredit',
          montant: principal,
          taux_interet: tauxInteret,
          duree_mois: duree,
          mensualite,
          date_debut: dateDebut.toISOString().slice(0, 10),
          date_fin: dateFin.toISOString().slice(0, 10),
          statut: 'active',
          date_approbation: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (errCredit) throw errCredit;
      credit = cr;
    }

    res.status(201).json({
      ok: true,
      message:
        score >= 700
          ? 'Crédit accordé'
          : score >= 500
          ? 'Demande enregistrée, validation manuelle en cours'
          : 'Demande refusée (score insuffisant)',
      demandeId: demande.id,
      creditId: credit?.id || null,
      approved: score >= 700,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { createRequest };
