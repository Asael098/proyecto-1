const express= require('express')
const router= express.Router()
const Estudiante= require('../controllers/estudiantes.controller.js')


router.get('/',Estudiante.consultar)
router.post('/',Estudiante.agregar)

router.route('/:id')
    .put(Estudiante.actualizar)
    .delete(Estudiante.eliminar)
  


module.exports = router;