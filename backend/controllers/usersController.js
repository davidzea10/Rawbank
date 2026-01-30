const { supabase } = require('../config/supabase');

const getProfile = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.user.id !== id) {
      return res.status(403).json({ ok: false, message: 'Accès non autorisé' });
    }

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
    const { id } = req.params;
    const {
      prenom,
      nom,
      numero_cni,
      date_naissance,
      adresse,
      ville,
      type_profil,
      nom_entreprise,
      secteur_activite,
      localisation,
      description_activite,
    } = req.body;

    if (req.user.id !== id) {
      return res.status(403).json({ ok: false, message: 'Accès non autorisé' });
    }

    const { data: profilExistant } = await supabase
      .from('profils_utilisateurs')
      .select('*')
      .eq('id_utilisateur', id)
      .single();

    if (!profilExistant) {
      return res.status(404).json({ ok: false, message: 'Profil non trouvé' });
    }

    const profilUpdate = {};
    if (prenom !== undefined) profilUpdate.prenom = String(prenom).trim();
    if (nom !== undefined) profilUpdate.nom = String(nom).trim();
    if (numero_cni !== undefined) profilUpdate.numero_cni = numero_cni || null;
    if (date_naissance !== undefined) profilUpdate.date_naissance = date_naissance || null;
    if (adresse !== undefined) profilUpdate.adresse = adresse || null;
    if (ville !== undefined) profilUpdate.ville = ville || null;
    if (type_profil !== undefined) {
      if (!['particulier', 'entrepreneur'].includes(type_profil)) {
        return res.status(400).json({ ok: false, message: "type_profil doit être 'particulier' ou 'entrepreneur'" });
      }
      profilUpdate.type_profil = type_profil;
    }
    profilUpdate.date_mise_a_jour = new Date().toISOString();

    const { error: errProfil } = await supabase
      .from('profils_utilisateurs')
      .update(profilUpdate)
      .eq('id_utilisateur', id);

    if (errProfil) throw errProfil;

    if (type_profil === 'entrepreneur' && (nom_entreprise || secteur_activite || localisation || description_activite)) {
      const { data: detailsExistant } = await supabase
        .from('details_entrepreneurs')
        .select('id')
        .eq('id_utilisateur', id)
        .single();

      if (detailsExistant) {
        const detailsUpdate = {
          date_mise_a_jour: new Date().toISOString(),
        };
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

    const { data: profil } = await supabase
      .from('profils_utilisateurs')
      .select('*')
      .eq('id_utilisateur', id)
      .single();

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
      message: 'Profil mis à jour',
      profil,
      details_entrepreneur: detailsEntrepreneur,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProfile, updateProfile };
