const { supabase } = require('../config/supabase');

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ ok: false, message: 'Token manquant. En-tête: Authorization: Bearer <token>' });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ ok: false, message: 'Token invalide ou expiré' });
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { verifyToken };
