/**
 * Script d'import du CSV credit_df_5000.csv dans donnees_operateurs (Supabase)
 * Usage: node scripts/import-operateurs-csv.js
 *
 * Prérequis:
 * - npm install csv-parse
 * - .env avec SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('ERREUR: SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requis dans .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Chemin du CSV (depuis la racine MicroScore) - Ml ou ML
let csvPath = path.join(__dirname, '..', '..', 'Ml', 'credit_df_5000.csv');
if (!fs.existsSync(csvPath)) {
  csvPath = path.join(__dirname, '..', '..', 'ML', 'credit_df_5000.csv');
}

async function importCsv() {
  console.log('Lecture du fichier:', csvPath);

  if (!fs.existsSync(csvPath)) {
    console.error('Fichier introuvable. Vérifiez Ml/credit_df_5000.csv ou ML/credit_df_5000.csv');
    process.exit(1);
  }

  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const rows = parse(csvContent, { columns: true, skip_empty_lines: true });

  console.log('Lignes lues:', rows.length);

  const BATCH_SIZE = 100;
  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const toInsert = batch.map((r) => ({
      numero_telephone: String(r.numero_telephone || '').trim(),
      avg_transaction_amount: parseFloat(r.avg_transaction_amount) || 0,
      transaction_amount_std: parseFloat(r.transaction_amount_std) || 0,
      avg_balance: parseFloat(r.avg_balance) || 0,
      balance_volatility: parseFloat(r.balance_volatility) || 0,
      fee_ratio: parseFloat(r.fee_ratio) || 0,
      transaction_regularity: parseFloat(r.transaction_regularity) || 0,
      recharge_frequency: parseFloat(r.recharge_frequency) || 0,
      avg_recharge_amount: parseFloat(r.avg_recharge_amount) || 0,
      small_recharge_ratio: parseFloat(r.small_recharge_ratio) || 0,
      total_calls: Math.round(parseFloat(r.total_calls) || 0),
      avg_call_duration: parseFloat(r.avg_call_duration) || 0,
      total_data_mb: parseFloat(r.total_data_mb) || 0,
      total_sms: Math.round(parseFloat(r.total_sms) || 0),
      call_failure_rate: parseFloat(r.call_failure_rate) || 0,
      phone_activity_score: parseFloat(r.phone_activity_score) || 0,
    }));

    const { data, error } = await supabase
      .from('donnees_operateurs')
      .upsert(toInsert, { onConflict: 'numero_telephone', ignoreDuplicates: false });

    if (error) {
      console.error('Erreur lot', Math.floor(i / BATCH_SIZE) + 1, ':', error.message);
      errors += batch.length;
    } else {
      inserted += batch.length;
      console.log(`Importé: ${inserted}/${rows.length}`);
    }
  }

  console.log('--- Terminé ---');
  console.log('Insertés/mis à jour:', inserted);
  if (errors > 0) console.log('Erreurs:', errors);
}

importCsv().catch((err) => {
  console.error(err);
  process.exit(1);
});
