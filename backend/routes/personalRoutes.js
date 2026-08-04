const express = require('express');
const router = express.Router();
const personalController = require('../controllers/personal.controller.js')
const middletoken = require('../middlewares/auth.middleware.js')

router.get('/', middletoken, personalController.consultar)

router.post('/', personalController.agregar)



router.route('/:id')
    .put(personalController.actualizar)
    .delete(personalController.eliminar)
    .get(personalController.consultardetalle)




module.exports = router;

