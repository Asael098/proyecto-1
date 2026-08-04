const express = require('express');
const router = express.Router();
const controller = require('../controllers/actividades.controller');

router.route('/')
    .get(controller.obtenerActividades)
    .post(controller.asignarActividad);

router.route('/:id')
    .delete(controller.eliminarActividad)
    .put(controller.actualizarActividad);

module.exports = router;