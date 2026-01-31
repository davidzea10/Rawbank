const scoreService = require('../services/scoreService');
const { supabase } = require('../config/supabase');

async function getScore(req, res, next) {
  try {
    const { id } = req.params;
    const result = await scoreService.getScoreForUser(id);

    if (!result.ok) {
      return res.status(404).json(result);
    }

    res.json({
      ok: true,
      score: result.score,
      score_raw: result.score_raw,
      creditLimit: result.creditLimit,
    });
  } catch (err) {
    next(err);
  }
}

/** Diagnostic : vérifie si un user et son numéro sont trouvés */
async function diagnose(req, res, next) {
  try {
    const { id } = req.params;
    const { data: user } = await supabase
      .from('utilisateurs')
      .select('id, numero_telephone')
      .eq('id', id)
      .maybeSingle();

    let operateur = null;
    if (user?.numero_telephone) {
      const num = String(user.numero_telephone).replace(/\s/g, '').replace(/^\+/, '');
      const { data } = await supabase
        .from('donnees_operateurs')
        .select('numero_telephone')
        .eq('numero_telephone', num)
        .maybeSingle();
      operateur = data;
    }

    res.json({
      utilisateur: user ? { id: user.id, numero_telephone: user.numero_telephone } : null,
      dans_operateurs: !!operateur,
      numero_normalise: user ? String(user.numero_telephone).replace(/\s/g, '').replace(/^\+/, '') : null,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getScore, diagnose };
