const { supabase } = require('../config/supabase');

const checkNumero = async (req, res, next) => {
  try {
    const { numero_telephone } = req.params;
    const numero = numero_telephone?.replace(/\s/g, '') || req.body?.numero_telephone?.replace(/\s/g, '');

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

module.exports = { checkNumero };
