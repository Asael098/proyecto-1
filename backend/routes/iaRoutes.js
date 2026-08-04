const express = require('express');
const router = express.Router();
const controller = require('../controllers/ia.controller');

router.post('/generar', controller.generarQuiz);

module.exports = router;