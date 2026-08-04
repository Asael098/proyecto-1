const express = require('express');
const router = express.Router();
const controller = require('../controllers/calificaciones.controller');

router.post('/', controller.guardarCalificacion);
router.get('/reporte/:id_grupo', controller.obtenerReporteGrupo);

module.exports = router;