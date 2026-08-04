const express = require('express')
const router = express.Router()
const Gruposcontroller = require('../controllers/grupos.controller')


router.post('/', Gruposcontroller.crearGrupo)

router.get('/', Gruposcontroller.obtenerGrupos)

router.route('/:id')
    .delete(Gruposcontroller.eliminarGrupo)
    .put(Gruposcontroller.actualizarGrupo)



module.exports = router