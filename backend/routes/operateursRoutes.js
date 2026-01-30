const express = require('express');
const router = express.Router();
const operateursController = require('../controllers/operateursController');

router.get('/check/:numero_telephone', operateursController.checkNumero);

router.post('/check', operateursController.checkNumero);

module.exports = router;
