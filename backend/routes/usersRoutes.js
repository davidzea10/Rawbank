const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/:id', verifyToken, usersController.getProfile);
router.put('/:id', verifyToken, usersController.updateProfile);

module.exports = router;
