/**
 * Supprime les crédits de test pour un utilisateur.
 * Usage: node scripts/delete-test-credits.js <USER_UUID>
 *
 * Récupère USER_UUID depuis la console navigateur après login (user.id)
 * ou Supabase > Table Editor > utilisateurs > colonne id
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
  console.error('Usage: node scripts/delete-test-credits.js <USER_UUID>');
  console.error('Exemple: node scripts/delete-test-credits.js fddcf649-fe96-4ef0-9707-6524ad50f288');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data: credits, error: errList } = await supabase
    .from('credits')
    .select('id, montant, duree_mois')
    .eq('id_utilisateur', userId);

  if (errList) {
    console.error('Erreur lecture credits:', errList.message);
    process.exit(1);
  }

  if (!credits?.length) {
    console.log('Aucun crédit trouvé pour cet utilisateur.');
    return;
  }

  for (const c of credits) {
    await supabase.from('remboursements').delete().eq('id_credit', c.id);
    const { error: errDel } = await supabase.from('credits').delete().eq('id', c.id);
    if (errDel) {
      console.error('Erreur suppression crédit', c.id, errDel.message);
    } else {
      console.log('Supprimé: crédit', c.montant, 'CDF,', c.duree_mois, 'mois');
    }
  }

  console.log('Crédits de test supprimés. Actualisez le tableau de bord.');
}

main();
