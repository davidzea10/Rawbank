/**
 * Service de calcul des taux et pénalités RawFinance Pro
 * - Taux de base selon score : 900+ => 3%, 800-899 => 3.5%, 700-799 => 4%
 * - Réduction fidélité : crédits payés à temps => -0.5% ou -1% sur prochain crédit (plancher 3%)
 * - Pénalités retard : <7j => +1%, 7-30j => +2%+5000 CDF, >30j => +3%+10000 CDF
 */

const { supabase } = require('../config/supabase');

/** Taux mensuel de base selon le score (en %) */
function getTauxBase(score) {
  if (score >= 900) return 3;
  if (score >= 800) return 3.5;
  if (score >= 700) return 4;
  return null; // Non éligible
}

/** Réduction fidélité : crédits consécutifs entièrement remboursés à temps */
async function getReductionFidelite(idUtilisateur) {
  const { data: credits } = await supabase
    .from('credits')
    .select('id')
    .eq('id_utilisateur', idUtilisateur)
    .in('statut', ['completed'])
    .order('date_creation', { ascending: false });

  if (!credits?.length) return 0;

  let consecutifsATemps = 0;
  for (const c of credits) {
    const { data: remb } = await supabase
      .from('remboursements')
      .select('est_a_temps')
      .eq('id_credit', c.id)
      .eq('statut', 'completed');
    const tousATemps = remb?.length && remb.every((r) => r.est_a_temps !== false);
    if (tousATemps) consecutifsATemps++;
    else break; // stop à la première non à temps (ordre = plus récent d'abord)
  }

  if (consecutifsATemps >= 2) return 1; // -1% pour 2+ crédits consécutifs à temps
  if (consecutifsATemps >= 1) return 0.5; // -0.5% pour 1 crédit à temps
  return 0;
}

/** Taux final appliqué (base - réduction, plancher 3%) */
async function getTauxFinal(score, idUtilisateur) {
  const base = getTauxBase(score);
  if (base == null) return null;
  const reduction = await getReductionFidelite(idUtilisateur);
  return Math.max(3, base - reduction);
}

/** Calcul mensualité (formule amortissement) */
function calculMensualite(principal, tauxMensuelPct, dureeMois) {
  if (dureeMois === 1) {
    return Math.round(principal * (1 + tauxMensuelPct / 100));
  }
  const rate = tauxMensuelPct / 100;
  return Math.round(
    principal * (rate * Math.pow(1 + rate, dureeMois)) / (Math.pow(1 + rate, dureeMois) - 1)
  );
}

/** Simulation complète pour affichage */
async function simulate(idUtilisateur, amount, duration, scoreOverride = null) {
  const duree = Number(duration);
  if (![1, 3, 6].includes(duree)) return null;

  let score = scoreOverride;
  if (score == null && idUtilisateur) {
    const scoreSvc = require('./scoreService');
    const r = await scoreSvc.getScoreForUser(idUtilisateur);
    score = r.ok ? r.score : 700;
  }
  score = score ?? 700;

  const tauxBase = getTauxBase(score);
  if (tauxBase == null) {
    return { ok: false, message: 'Score insuffisant pour le crédit (min 700)' };
  }

  let reduction = 0;
  if (idUtilisateur) {
    reduction = await getReductionFidelite(idUtilisateur);
  }
  const tauxFinal = Math.max(3, tauxBase - reduction);

  const principal = Number(amount);
  const mensualite = calculMensualite(principal, tauxFinal, duree);
  const totalArembourser = mensualite * duree;
  const interets = totalArembourser - principal;

  return {
    ok: true,
    capital: principal,
    tauxBase,
    reductionFidelite: reduction,
    tauxFinal,
    dureeMois: duree,
    mensualite,
    totalArembourser,
    interets,
  };
}

/** Pénalité pour retard (CDF) */
function calculPenalite(joursRetard, capitalRestant) {
  if (joursRetard <= 0) return 0;
  if (joursRetard < 7) return Math.round(capitalRestant * 0.01);
  if (joursRetard <= 30) return Math.round(capitalRestant * 0.02) + 5000;
  return Math.round(capitalRestant * 0.03) + 10000;
}

module.exports = {
  getTauxBase,
  getReductionFidelite,
  getTauxFinal,
  calculMensualite,
  simulate,
  calculPenalite,
};
