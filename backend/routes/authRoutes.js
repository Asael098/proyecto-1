const express = require('express');
const router = express.Router();
const authcontroller = require('../controllers/auth.controller.js');

router.post('/', authcontroller.login);

module.exports = router;