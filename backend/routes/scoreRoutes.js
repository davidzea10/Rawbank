const express = require('express');
const router = express.Router();
const scoreController = require('../controllers/scoreController');

router.get('/diagnose/:id', scoreController.diagnose);
router.get('/:id', scoreController.getScore);

module.exports = router;
