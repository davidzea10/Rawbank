/**
 * Normalise un numéro de téléphone pour la recherche dans donnees_operateurs.
 * Le CSV a des numéros comme "2347010000345" (sans +).
 */
function normalizePhone(str) {
  if (str == null || str === '') return '';
  return String(str)
    .replace(/\s/g, '')
    .replace(/^\+/, '')
    .trim();
}

module.exports = { normalizePhone };
