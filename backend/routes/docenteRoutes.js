const express = require('express');
const router = express.Router();
const controller = require('../controllers/asignacionGrupo.controller');

router.get('/mis-alumnos', controller.obtenerMisAlumnos);

module.exports = router;