const jwt = require('jsonwebtoken');
require('dotenv').config();

const verificacion = (req, res, next) => {
    try {
        let token = req.header('Authorization');

        if (!token) {
            return res.status(401).json({ msj: 'No hay acceso por falta de token' })
        }

        // 1. Decodificamos el token
        const check_token = jwt.verify(token, process.env.S_Key);

        // 2. MAGIA AQUÍ: Inyectamos los datos del usuario en la petición (req)
        req.usuario = check_token;

        // 3. Pasamos al siguiente controlador
        next();

    } catch (err) {
        console.log(err);
        res.status(500).json({ msj: 'Existe un error o token inválido', err })
    }
}

module.exports = verificacion;