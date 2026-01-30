const { supabase } = require('../config/supabase');

const getHealth = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('utilisateurs').select('id').limit(1);
    if (error) throw error;
    res.json({ ok: true, message: 'API OK', supabase: 'connected' });
  } catch (err) {
    next(err);
  }
};

const getRoot = (req, res) => {
  res.json({ ok: true, message: 'RawFinance Pro API', step: '2.5' });
};

module.exports = { getHealth, getRoot };
