const { supabase } = require('../config/supabase');

const register = async (req, res, next) => {
  try {
    const { email, password, numero_telephone } = req.body;

    if (!email || !password || !numero_telephone) {
      return res.status(400).json({
        ok: false,
        message: 'email, password et numero_telephone sont requis',
      });
    }

    const numero = numero_telephone.replace(/\s/g, '');

    const { data: donneesOperateur, error: errOperateur } = await supabase
      .from('donnees_operateurs')
      .select('numero_telephone')
      .eq('numero_telephone', numero)
      .maybeSingle();

    if (errOperateur) throw errOperateur;
    if (!donneesOperateur) {
      return res.status(403).json({
        ok: false,
        message: 'Numéro non autorisé. Votre numéro doit exister dans la base des opérateurs.',
      });
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { numero_telephone: numero },
      },
    });

    if (authError) {
      if (authError.message?.includes('already registered')) {
        return res.status(400).json({ ok: false, message: 'Cet email est déjà utilisé' });
      }
      throw authError;
    }

    if (!authData.user) {
      return res.status(500).json({ ok: false, message: 'Erreur lors de la création du compte' });
    }

    const { error: insertError } = await supabase.from('utilisateurs').insert({
      id: authData.user.id,
      email: authData.user.email,
      numero_telephone: numero,
    });

    if (insertError) {
      if (insertError.code === '23505') {
        return res.status(400).json({ ok: false, message: 'Ce numéro ou email est déjà enregistré' });
      }
      throw insertError;
    }

    res.status(201).json({
      ok: true,
      message: 'Inscription réussie',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        numero_telephone: numero,
      },
      session: authData.session
        ? {
            access_token: authData.session.access_token,
            refresh_token: authData.session.refresh_token,
            expires_in: authData.session.expires_in,
          }
        : null,
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        ok: false,
        message: 'email et password sont requis',
      });
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      if (error.message?.includes('Invalid login')) {
        return res.status(401).json({ ok: false, message: 'Email ou mot de passe incorrect' });
      }
      throw error;
    }

    res.json({
      ok: true,
      message: 'Connexion réussie',
      user: {
        id: data.user.id,
        email: data.user.email,
      },
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_in: data.session.expires_in,
      },
    });
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  res.json({ ok: true, message: 'Déconnexion réussie. Supprimez le token côté client.' });
};

const me = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ ok: false, message: 'Non authentifié' });
    }

    const { data: utilisateur, error } = await supabase
      .from('utilisateurs')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error || !utilisateur) {
      return res.status(404).json({ ok: false, message: 'Profil utilisateur non trouvé' });
    }

    res.json({ ok: true, user: utilisateur });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, logout, me };
