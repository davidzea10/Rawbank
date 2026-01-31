/**
 * Script pour insérer un crédit de test dans Supabase.
 * Usage: node scripts/insert-test-credit.js <USER_UUID>
 *
 * Récupère USER_UUID depuis:
 * - Supabase Dashboard > Table Editor > utilisateurs > colonne id
 * - Ou depuis la console du navigateur après login: localStorage.getItem('rawfinance_user')
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Variables SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requises (.env)');
  process.exit(1);
}

const userId = process.argv[2];
if (!userId) {
  console.error('Usage: node scripts/insert-test-credit.js <USER_UUID>');
  console.error('Exemple: node scripts/insert-test-credit.js a2e37844-98ad-40ae-9a33-e70b746d1036');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const dateDebut = new Date();
  const dateFin = new Date();
  dateFin.setMonth(dateFin.getMonth() + 3);

  const montant = 150000;
  const duree = 3;
  const tauxInteret = 4; // Score 827 => 4%/mois (700-799)
  const rate = tauxInteret / 100;
  const mensualite = Math.round(
    montant * (rate * Math.pow(1 + rate, duree)) / (Math.pow(1 + rate, duree) - 1)
  );

  const { data: demande, error: errD } = await supabase
    .from('demandes_credit')
    .insert({
      id_utilisateur: userId,
      type_credit: 'microcredit',
      montant_demande: montant,
      duree_demandee_mois: duree,
      score_actuel: 827,
      statut: 'approved',
      decision: 'automatic',
      montant_approuve: montant,
    })
    .select('id')
    .single();

  if (errD) {
    console.error('Erreur demande_credit (table existe?):', errD.message);
    console.error('Créez les tables avec: supabase_create_all_tables.sql');
    process.exit(1);
  }

  const { data: credit, error: errC } = await supabase
    .from('credits')
    .insert({
      id_utilisateur: userId,
      id_demande: demande.id,
      type_credit: 'microcredit',
      montant,
      taux_interet: tauxInteret,
      duree_mois: duree,
      mensualite,
      date_debut: dateDebut.toISOString().slice(0, 10),
      date_fin: dateFin.toISOString().slice(0, 10),
      statut: 'active',
    })
    .select('id')
    .single();

  if (errC) {
    console.error('Erreur credits:', errC.message);
    process.exit(1);
  }

  console.log('Crédit de test créé:', credit.id);
  console.log('Montant:', montant, 'CDF, Durée:', duree, 'mois, Mensualité:', mensualite, 'CDF');
  console.log('Actualisez le tableau de bord pour le voir.');
}

main();
