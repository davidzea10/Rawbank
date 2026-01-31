const { supabase } = require('../config/supabase');
const { normalizePhone } = require('../utils/normalizePhone');
const { spawn } = require('child_process');
const path = require('path');

const FEATURE_COLS = [
  'avg_transaction_amount', 'transaction_amount_std', 'avg_balance',
  'balance_volatility', 'fee_ratio', 'transaction_regularity',
  'recharge_frequency', 'avg_recharge_amount', 'small_recharge_ratio',
  'total_calls', 'avg_call_duration', 'total_data_mb', 'total_sms',
  'call_failure_rate', 'phone_activity_score',
];

/**
 * Récupère les features depuis donnees_operateurs par id utilisateur
 * Retourne { features, error } pour diagnostiquer les échecs
 */
async function getFeaturesByUserId(userId) {
  const { data: user, error: errUser } = await supabase
    .from('utilisateurs')
    .select('numero_telephone')
    .eq('id', userId)
    .maybeSingle();

  if (errUser) {
    return { error: 'Erreur BDD utilisateur: ' + errUser.message };
  }
  if (!user) {
    return { error: 'Utilisateur non trouvé dans la table utilisateurs' };
  }
  if (!user.numero_telephone) {
    return { error: 'Numéro téléphone absent pour cet utilisateur' };
  }

  const numero = normalizePhone(user.numero_telephone);

  const { data: operateur, error: errOp } = await supabase
    .from('donnees_operateurs')
    .select('*')
    .eq('numero_telephone', numero)
    .maybeSingle();

  if (errOp) {
    return { error: 'Erreur BDD operateurs: ' + errOp.message };
  }
  if (!operateur) {
    return {
      error: 'Numéro "' + numero + '" non trouvé dans donnees_operateurs. Vérifiez que ce numéro est dans le CSV importé.',
    };
  }

  return { features: operateur };
}

/**
 * Prédit le score via le script Python (modèle pickle)
 * Retourne le score brut (0-1) ou null en cas d'erreur
 */
function predictScore(features) {
  return new Promise((resolve, reject) => {
    const featuresForModel = {};
    for (const col of FEATURE_COLS) {
      const v = features[col];
      featuresForModel[col] = v != null ? parseFloat(v) : 0;
    }

    const scriptPath = path.join(__dirname, '..', 'ml', 'predict.py');
    const pyCmd = process.platform === 'win32' ? 'python' : 'python3';
    const py = spawn(pyCmd, [scriptPath], {
      cwd: path.join(__dirname, '..'),
    });

    let stdout = '';
    let stderr = '';

    py.stdout.on('data', (data) => { stdout += data; });
    py.stderr.on('data', (data) => { stderr += data; });

    py.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(stderr || 'Erreur prédiction Python'));
        return;
      }
      try {
        const jsonMatch = stdout.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : stdout.trim();
        const result = JSON.parse(jsonStr);
        if (result.ok && typeof result.credit_scoring === 'number') {
          resolve(result.credit_scoring);
        } else {
          reject(new Error(result.error || 'Prédiction invalide'));
        }
      } catch (e) {
        reject(new Error('Réponse Python invalide: ' + stdout));
      }
    });

    py.on('error', (err) => {
      reject(new Error('Python non disponible: ' + err.message));
    });

    py.stdin.write(JSON.stringify(featuresForModel));
    py.stdin.end();
  });
}

/**
 * Calcule le score pour un utilisateur
 * 1. Récupère les features depuis donnees_operateurs
 * 2. Charge le modèle et prédit
 * 3. Retourne score * 1000 pour affichage (0-1000)
 */
async function getScoreForUser(userId) {
  const result = await getFeaturesByUserId(userId);
  if (result.error) {
    return { ok: false, message: result.error };
  }

  const features = result.features;

  try {
    const scoreRaw = await predictScore(features);
    const scoreDisplay = Math.round(scoreRaw * 1000);
    const creditLimit = Math.round((scoreDisplay / 1000) * 300000);
    return {
      ok: true,
      score: scoreDisplay,
      score_raw: scoreRaw,
      creditLimit,
    };
  } catch (err) {
    console.error('[ScoreService]', err.message);
    return { ok: false, message: err.message || 'Erreur lors du calcul du score' };
  }
}

module.exports = {
  getFeaturesByUserId,
  predictScore,
  getScoreForUser,
};
