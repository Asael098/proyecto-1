const express = require('express');
const router = express.Router();
const controller = require('../controllers/alumno.controller');

// Rutas exclusivas para el rol "alumno"
router.get('/mis-grupos', controller.obtenerMisGrupos);
router.get('/actividades/:id_grupo', controller.obtenerActividadesDeGrupo);
router.get('/mis-calificaciones', controller.obtenerMisCalificaciones);
router.get('/mis-actividades', controller.obtenerTodasMisActividades);
module.exports = router;