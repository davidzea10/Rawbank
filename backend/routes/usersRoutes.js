const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
// const { verifyToken } = require('../middlewares/authMiddleware'); // JWT désactivé temporairement

router.get('/:id', usersController.getProfile);
router.put('/profile', usersController.updateProfile);   // Body: { id, ...champs_modifiés }
router.put('/:id', usersController.updateProfile);       // URL id ou body.id
router.delete('/:id', usersController.deleteAccount);

module.exports = router;
