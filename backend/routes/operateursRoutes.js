const express = require('express');
const router = express.Router();
const operateursController = require('../controllers/operateursController');

router.get('/check/:numero_telephone', operateursController.checkNumero);
router.get('/donnees/:id', operateursController.getDonneesByUserId);

router.post('/check', operateursController.checkNumero);

module.exports = router;
