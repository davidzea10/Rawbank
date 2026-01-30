const { supabase } = require('../config/supabase');

const OPERATEURS_MOBILE_MONEY = {
  orange: 'Orange Money',
  mpesa: 'M-Pesa',
  airtel: 'Airtel Money',
};

const register = async (req, res, next) => {
  try {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const contentType = req.get('Content-Type') || '(absent)';

    // Debug: voir ce que le serveur reçoit (mot de passe masqué)
    const debugBody = { ...body };
    if (debugBody.password) debugBody.password = '***';
    if (debugBody.data?.password) debugBody.data.password = '***';
    if (debugBody.user?.password) debugBody.user.password = '***';
    console.log('[REGISTER] Content-Type:', contentType, '| Body reçu:', JSON.stringify(debugBody));

    const data = body.data || body.user || body;
    const email = data.email;
    const password = data.password;
    const numero_telephone = data.numero_telephone ?? data.numeroTelephone ?? data.numero;
    const prenom = data.prenom ?? data.firstName ?? data.prenomUtilisateur;
    const nom = data.nom ?? data.lastName ?? data.nom_famille;
    const mobile_money_lie = data.mobile_money_lie ?? data.mobileMoneyLie ?? data.mobile_money ?? data.mobileMoney ?? data.operateur;

    if (!email || !password || !numero_telephone || !prenom || !nom || !mobile_money_lie) {
      const manquants = [];
      if (!email) manquants.push('email');
      if (!password) manquants.push('password');
      if (!numero_telephone) manquants.push('numero_telephone');
      if (!prenom) manquants.push('prenom');
      if (!nom) manquants.push('nom');
      if (!mobile_money_lie) manquants.push('mobile_money_lie');
      const clesRecues = Object.keys(body).concat(Object.keys(data || {})).filter((k, i, a) => a.indexOf(k) === i);
      return res.status(400).json({
        ok: false,
        message: `Champs requis manquants: ${manquants.join(', ')}`,
        debug: {
          cles_recues: clesRecues,
          content_type: contentType,
          astuce: 'Vérifier que le body est un JSON avec Content-Type: application/json',
        },
      });
    }

    const numero = String(numero_telephone).replace(/\s/g, '');
    const operateurKey = String(mobile_money_lie).toLowerCase().trim();
    const operateur = OPERATEURS_MOBILE_MONEY[operateurKey] || operateurKey;

    if (!['Orange Money', 'M-Pesa', 'Airtel Money'].includes(operateur)) {
      return res.status(400).json({
        ok: false,
        message: "mobile_money_lie doit être: 'orange', 'mpesa' ou 'airtel'",
      });
    }

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
        data: { numero_telephone: numero, prenom, nom },
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

    const { error: insertUserError } = await supabase.from('utilisateurs').insert({
      id: authData.user.id,
      email: authData.user.email,
      numero_telephone: numero,
    });

    if (insertUserError) {
      if (insertUserError.code === '23505') {
        return res.status(400).json({ ok: false, message: 'Ce numéro ou email est déjà enregistré' });
      }
      throw insertUserError;
    }

    const { error: insertProfilError } = await supabase.from('profils_utilisateurs').insert({
      id_utilisateur: authData.user.id,
      type_profil: 'particulier',
      prenom: String(prenom).trim(),
      nom: String(nom).trim(),
    });

    if (insertProfilError) throw insertProfilError;

    const { error: insertCompteError } = await supabase.from('comptes_mobile_money').insert({
      id_utilisateur: authData.user.id,
      operateur,
      numero_compte: numero,
      est_principal: true,
    });

    if (insertCompteError) throw insertCompteError;

    res.status(201).json({
      ok: true,
      message: 'Inscription réussie',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        numero_telephone: numero,
        prenom: String(prenom).trim(),
        nom: String(nom).trim(),
        mobile_money_lie: operateur,
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

    const id = data.user.id;
    const metadata = data.user.user_metadata || {};

    const { data: utilisateur } = await supabase
      .from('utilisateurs')
      .select('*')
      .eq('id', id)
      .single();

    const { data: profil } = await supabase
      .from('profils_utilisateurs')
      .select('*')
      .eq('id_utilisateur', id)
      .single();

    const { data: comptes } = await supabase
      .from('comptes_mobile_money')
      .select('*')
      .eq('id_utilisateur', id);

    let detailsEntrepreneur = null;
    if (profil?.type_profil === 'entrepreneur') {
      const { data: details } = await supabase
        .from('details_entrepreneurs')
        .select('*')
        .eq('id_utilisateur', id)
        .single();
      detailsEntrepreneur = details;
    }

    const user = {
      id: utilisateur?.id ?? id,
      email: utilisateur?.email ?? data.user.email,
      numero_telephone: utilisateur?.numero_telephone ?? metadata.numero_telephone ?? null,
      date_creation: utilisateur?.date_creation ?? null,
      date_mise_a_jour: utilisateur?.date_mise_a_jour ?? null,
      est_actif: utilisateur?.est_actif ?? true,
      derniere_connexion: utilisateur?.derniere_connexion ?? null,
      profil: profil
        ? { ...profil }
        : {
            prenom: metadata.prenom ?? null,
            nom: metadata.nom ?? null,
            type_profil: 'particulier',
          },
      comptes_mobile_money: Array.isArray(comptes) ? comptes : [],
      details_entrepreneur: detailsEntrepreneur,
    };

    res.json({
      ok: true,
      message: 'Connexion réussie',
      user,
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
