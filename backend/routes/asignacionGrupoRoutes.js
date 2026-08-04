const express = require('express');
const router = express.Router();
const controller = require('../controllers/asignacionGrupo.controller');

router.get('/detalles/:id_grupo', controller.obtenerDetallesAlumnos);

// Ojo: El parámetro en la URL (:id_grupo) debe coincidir con req.params del controlador
router.get('/:id_grupo', controller.obtenerAlumnosDeGrupo);
router.post('/', controller.guardarAsignacion);

module.exports = router;