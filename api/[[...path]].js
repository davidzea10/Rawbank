/**
 * Catch-all API - délègue toutes les requêtes /api/* à Express
 * Exclut /api/users/:id/score qui est géré par la fonction Python
 */
const app = require('../backend/server');
module.exports = app;
