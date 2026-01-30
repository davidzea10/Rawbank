const { supabase } = require('../config/supabase');

const getProfile = async (req, res, next) => {
  try {
    const { id } = req.params;

    // if (req.user?.id !== id) {
    //   return res.status(403).json({ ok: false, message: 'Accès non autorisé' });
    // } // JWT désactivé temporairement

    const { data: utilisateur, error: errUser } = await supabase
      .from('utilisateurs')
      .select('*')
      .eq('id', id)
      .single();

    if (errUser || !utilisateur) {
      return res.status(404).json({ ok: false, message: 'Utilisateur non trouvé' });
    }

    const { data: profil, error: errProfil } = await supabase
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
      const { data } = await supabase
        .from('details_entrepreneurs')
        .select('*')
        .eq('id_utilisateur', id)
        .single();
      detailsEntrepreneur = data;
    }

    res.json({
      ok: true,
      user: {
        ...utilisateur,
        profil: profil || null,
        comptes_mobile_money: comptes || [],
        details_entrepreneur: detailsEntrepreneur,
      },
    });
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const body = req.body || {};
    const id = body.id ?? req.params.id;

    if (!id) {
      return res.status(400).json({ status: 'erreur', message: 'id requis' });
    }

    const prenom = body.prenom ?? body.firstName;
    const nom = body.nom ?? body.lastName ?? body.nom_famille;
    const numero_cni = body.numero_cni ?? body.numeroCni;
    const date_naissance = body.date_naissance ?? body.dateNaissance;
    const adresse = body.adresse;
    const ville = body.ville;
    const type_profil = body.type_profil ?? body.typeProfil;
    const nom_entreprise = body.nom_entreprise ?? body.nomEntreprise;
    const secteur_activite = body.secteur_activite ?? body.secteurActivite;
    const localisation = body.localisation;
    const description_activite = body.description_activite ?? body.descriptionActivite;

    const { data: profilExistant } = await supabase
      .from('profils_utilisateurs')
      .select('*')
      .eq('id_utilisateur', id)
      .single();

    if (!profilExistant) {
      return res.status(404).json({ status: 'erreur', message: 'Profil non trouvé' });
    }

    const profilUpdate = { date_mise_a_jour: new Date().toISOString() };
    if (prenom !== undefined) profilUpdate.prenom = String(prenom).trim();
    if (nom !== undefined) profilUpdate.nom = String(nom).trim();
    if (numero_cni !== undefined) profilUpdate.numero_cni = numero_cni || null;
    if (date_naissance !== undefined) profilUpdate.date_naissance = date_naissance || null;
    if (adresse !== undefined) profilUpdate.adresse = adresse || null;
    if (ville !== undefined) profilUpdate.ville = ville || null;
    if (type_profil !== undefined) {
      if (!['particulier', 'entrepreneur'].includes(type_profil)) {
        return res.status(400).json({ status: 'erreur', message: "type_profil doit être 'particulier' ou 'entrepreneur'" });
      }
      profilUpdate.type_profil = type_profil;
    }

    const { error: errProfil } = await supabase
      .from('profils_utilisateurs')
      .update(profilUpdate)
      .eq('id_utilisateur', id);

    if (errProfil) throw errProfil;

    if (type_profil === 'entrepreneur' && (nom_entreprise !== undefined || secteur_activite !== undefined || localisation !== undefined || description_activite !== undefined)) {
      const { data: detailsExistant } = await supabase
        .from('details_entrepreneurs')
        .select('id')
        .eq('id_utilisateur', id)
        .single();

      if (detailsExistant) {
        const detailsUpdate = { date_mise_a_jour: new Date().toISOString() };
        if (nom_entreprise !== undefined) detailsUpdate.nom_entreprise = String(nom_entreprise).trim();
        if (secteur_activite !== undefined) detailsUpdate.secteur_activite = secteur_activite || null;
        if (localisation !== undefined) detailsUpdate.localisation = localisation || null;
        if (description_activite !== undefined) detailsUpdate.description_activite = description_activite || null;

        await supabase
          .from('details_entrepreneurs')
          .update(detailsUpdate)
          .eq('id_utilisateur', id);
      } else {
        await supabase.from('details_entrepreneurs').insert({
          id_utilisateur: id,
          nom_entreprise: nom_entreprise ? String(nom_entreprise).trim() : 'Entreprise',
          secteur_activite: secteur_activite || null,
          localisation: localisation || null,
          description_activite: description_activite || null,
        });
      }
    }

    return res.json({ status: 'ok' });
  } catch (err) {
    return res.status(500).json({ status: 'erreur', message: err.message || 'Erreur serveur' });
  }
};

const deleteAccount = async (req, res, next) => {
  try {
    const { id } = req.params;

    // if (req.user?.id !== id) {
    //   return res.status(403).json({ ok: false, message: 'Accès non autorisé' });
    // } // JWT désactivé temporairement

    const { data: utilisateur, error: errUser } = await supabase
      .from('utilisateurs')
      .select('id')
      .eq('id', id)
      .single();

    if (errUser || !utilisateur) {
      return res.status(404).json({ ok: false, message: 'Utilisateur non trouvé' });
    }

    const { error: errDelete } = await supabase
      .from('utilisateurs')
      .delete()
      .eq('id', id);

    if (errDelete) throw errDelete;

    const { error: errAuth } = await supabase.auth.admin.deleteUser(id);

    if (errAuth) {
      console.warn('Auth user deletion warning:', errAuth.message);
    }

    res.json({
      ok: true,
      message: 'Compte supprimé avec succès',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProfile, updateProfile, deleteAccount };
