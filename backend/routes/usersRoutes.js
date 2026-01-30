const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
// const { verifyToken } = require('../middlewares/authMiddleware'); // JWT désactivé temporairement

router.get('/:id', usersController.getProfile);
router.put('/:id', usersController.updateProfile);

module.exports = router;
