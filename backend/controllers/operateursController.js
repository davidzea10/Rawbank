const { supabase } = require('../config/supabase');
const { normalizePhone } = require('../utils/normalizePhone');

const checkNumero = async (req, res, next) => {
  try {
    const { numero_telephone } = req.params;
    const numero = normalizePhone(numero_telephone || req.body?.numero_telephone);

    if (!numero) {
      return res.status(400).json({
        ok: false,
        message: 'numero_telephone requis',
        existe: false,
      });
    }

    const { data, error } = await supabase
      .from('donnees_operateurs')
      .select('*')
      .eq('numero_telephone', numero)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.json({
        ok: true,
        existe: false,
        message: 'Numéro non trouvé dans la base opérateurs',
      });
    }

    res.json({
      ok: true,
      existe: true,
      message: 'Numéro trouvé, inscription autorisée',
      donnees: data,
    });
  } catch (err) {
    next(err);
  }
};

const getDonneesByUserId = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: utilisateur, error: errUser } = await supabase
      .from('utilisateurs')
      .select('numero_telephone')
      .eq('id', id)
      .single();

    if (errUser || !utilisateur) {
      return res.status(404).json({ ok: false, message: 'Utilisateur non trouvé' });
    }

    const numero = normalizePhone(utilisateur.numero_telephone);
    if (!numero) {
      return res.status(400).json({ ok: false, message: 'Numéro téléphone non renseigné' });
    }

    const { data, error } = await supabase
      .from('donnees_operateurs')
      .select('*')
      .eq('numero_telephone', numero)
      .maybeSingle();

    if (error) throw error;

    res.json({ ok: true, donnees_operateur: data });
  } catch (err) {
    next(err);
  }
};

module.exports = { checkNumero, getDonneesByUserId };
