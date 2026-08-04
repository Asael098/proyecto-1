const express = require('express')
const router = express.Router()
const asignacionController = require('../controllers/asignacion.controller')

// Ruta para guardar las asignaciones
router.post('/asignacion', asignacionController.asignacion)

// NUEVA RUTA: Para consultar las asignaciones de un profesor específico
router.get('/asignacion/:id_personal', asignacionController.obtenerAsignaciones)

module.exports = router