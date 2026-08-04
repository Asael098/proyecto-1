const express = require('express');
const router = express.Router();
const controller = require('../controllers/dashboard.controller');

router.get('/estadisticas', controller.obtenerEstadisticas);

module.exports = router;