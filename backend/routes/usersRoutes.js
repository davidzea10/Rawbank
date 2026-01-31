const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const mobileMoneyController = require('../controllers/mobileMoneyController');
const scoreController = require('../controllers/scoreController');
const creditsController = require('../controllers/creditsController');
// const { verifyToken } = require('../middlewares/authMiddleware'); // JWT désactivé temporairement

router.get('/:id/score', scoreController.getScore);
router.get('/:id/credit-simulate', usersController.getSimulate);
router.get('/:id/credits', usersController.getCredits);
router.post('/:id/credits/request', creditsController.createRequest);
router.get('/:id/transactions', mobileMoneyController.getTransactions);
router.get('/:id/recharges', mobileMoneyController.getRecharges);
router.get('/:id/comptes-mobile', mobileMoneyController.getComptesMobile);
router.get('/:id/solde', mobileMoneyController.getSolde);
router.get('/:id/stats', mobileMoneyController.getStats);
router.get('/:id/mobile-money', mobileMoneyController.getAll);

router.get('/:id', usersController.getProfile);
router.put('/profile', usersController.updateProfile);   // Body: { id, ...champs_modifiés }
router.put('/:id', usersController.updateProfile);       // URL id ou body.id
router.delete('/:id', usersController.deleteAccount);

module.exports = router;
