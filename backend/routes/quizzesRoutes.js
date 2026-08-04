const express = require('express');
const router = express.Router();
const controller = require('../controllers/quizzes.controller');

// --- RUTAS PARA LA CABECERA DEL QUIZ ---
router.get('/', controller.obtenerMisQuizzes);
router.post('/', controller.crearQuizz);
router.route('/:id')
    .delete(controller.eliminarQuizz)
    .put(controller.actualizarQuizz);


// --- RUTAS PARA EL MOTOR DE PREGUNTAS (Anidadas por :id_quizz) ---
router.route('/:id_quizz/preguntas')
    .get(controller.obtenerPreguntas)
    .post(controller.guardarPreguntas)

module.exports = router;