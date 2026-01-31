const { supabase } = require('../config/supabase');
const { normalizePhone } = require('../utils/normalizePhone');

const getTransactions = async (req, res, next) => {
  try {
    const { id } = req.params;
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);

    const { data, error } = await supabase
      .from('transactions_mobile_money')
      .select('*')
      .eq('id_utilisateur', id)
      .order('date', { ascending: false })
      .limit(limit);

    if (error) throw error;

    res.json({ ok: true, transactions: data || [] });
  } catch (err) {
    next(err);
  }
};

const getRecharges = async (req, res, next) => {
  try {
    const { id } = req.params;
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);

    const { data, error } = await supabase
      .from('recharges_telephoniques')
      .select('*')
      .eq('id_utilisateur', id)
      .order('date_recharge', { ascending: false })
      .limit(limit);

    if (error) throw error;

    res.json({ ok: true, recharges: data || [] });
  } catch (err) {
    next(err);
  }
};

const getComptesMobile = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('comptes_mobile_money')
      .select('*')
      .eq('id_utilisateur', id)
      .order('est_principal', { ascending: false });

    if (error) throw error;

    res.json({ ok: true, comptes: data || [] });
  } catch (err) {
    next(err);
  }
};

const getSolde = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: lastTransaction, error } = await supabase
      .from('transactions_mobile_money')
      .select('solde_apres, date')
      .eq('id_utilisateur', id)
      .not('solde_apres', 'is', null)
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    const solde = lastTransaction?.solde_apres ?? 0;

    res.json({ ok: true, solde, derniere_mise_a_jour: lastTransaction?.date || null });
  } catch (err) {
    next(err);
  }
};

const getStats = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: transactions } = await supabase
      .from('transactions_mobile_money')
      .select('montant, type_transaction, date')
      .eq('id_utilisateur', id);

    const { data: recharges } = await supabase
      .from('recharges_telephoniques')
      .select('id')
      .eq('id_utilisateur', id);

    const now = new Date();
    const debuitMois = new Date(now.getFullYear(), now.getMonth(), 1);

    const transacCeMois = (transactions || []).filter((t) => new Date(t.date) >= debuitMois);
    const rechargesCeMois = (recharges || []).length;

    const totalEntrees = (transactions || [])
      .filter((t) => t.type_transaction === 'entree')
      .reduce((s, t) => s + parseFloat(t.montant || 0), 0);
    const totalSorties = (transactions || [])
      .filter((t) => t.type_transaction === 'sortie')
      .reduce((s, t) => s + parseFloat(t.montant || 0), 0);
    const nbTransactions = (transactions || []).length;
    const moyenneMontant = nbTransactions > 0
      ? (totalEntrees + totalSorties) / nbTransactions
      : 0;

    res.json({
      ok: true,
      stats: {
        transactions_ce_mois: transacCeMois.length,
        recharges_ce_mois: rechargesCeMois,
        total_transactions: nbTransactions,
        total_recharges: (recharges || []).length,
        moyenne_montant: Math.round(moyenneMontant * 100) / 100,
      },
    });
  } catch (err) {
    next(err);
  }
};

const getAll = async (req, res, next) => {
  try {
    const { id } = req.params;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);

    const { data: utilisateur } = await supabase
      .from('utilisateurs')
      .select('numero_telephone')
      .eq('id', id)
      .single();

    const numero = normalizePhone(utilisateur?.numero_telephone);

    const [transactionsRes, rechargesRes, comptesRes, soldeRes, operateurRes] = await Promise.all([
      supabase.from('transactions_mobile_money').select('*').eq('id_utilisateur', id).order('date', { ascending: false }).limit(limit),
      supabase.from('recharges_telephoniques').select('*').eq('id_utilisateur', id).order('date_recharge', { ascending: false }).limit(limit),
      supabase.from('comptes_mobile_money').select('*').eq('id_utilisateur', id),
      supabase.from('transactions_mobile_money').select('solde_apres, date').eq('id_utilisateur', id).not('solde_apres', 'is', null).order('date', { ascending: false }).limit(1).maybeSingle(),
      numero ? supabase.from('donnees_operateurs').select('*').eq('numero_telephone', numero).maybeSingle() : Promise.resolve({ data: null }),
    ]);

    const transactions = transactionsRes.data || [];
    const recharges = rechargesRes.data || [];
    const donneesOperateur = operateurRes.data;
    const lastTx = soldeRes.data;
    const solde = lastTx?.solde_apres ?? donneesOperateur?.avg_balance ?? 0;

    const now = new Date();
    const debuitMois = new Date(now.getFullYear(), now.getMonth(), 1);
    const transacCeMois = transactions.filter((t) => new Date(t.date) >= debuitMois);
    const rechargesCeMois = recharges.filter((r) => new Date(r.date_recharge) >= debuitMois);

    res.json({
      ok: true,
      solde,
      stats: {
        solde,
        derniere_mise_a_jour: lastTx?.date || null,
        transactions_ce_mois: transacCeMois.length,
        recharges_ce_mois: rechargesCeMois.length,
        total_transactions: transactions.length,
        total_recharges: recharges.length,
      },
      comptes: comptesRes.data || [],
      transactions,
      recharges,
      donnees_operateur: donneesOperateur,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getTransactions,
  getRecharges,
  getComptesMobile,
  getSolde,
  getStats,
  getAll,
};
