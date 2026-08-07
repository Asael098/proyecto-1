const jwt = require('jsonwebtoken');
require('dotenv').config();

const verificacion = (req, res, next) => {
    try {
        let authHeader = req.header('Authorization');

        if (!authHeader) {
            return res.status(401).json({ msj: 'No hay acceso por falta de token' });
        }

        // Extraer el token limpiando el prefijo Bearer si está presente
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader;

        if (!process.env.S_Key) {
            console.error('CRÍTICO: Secret Key (S_Key) no configurada en las variables de entorno.');
            return res.status(500).json({ msj: 'Error interno de configuración del servidor' });
        }

        // Decodificamos el token
        const check_token = jwt.verify(token, process.env.S_Key);

        // Inyectamos los datos del usuario en la petición (req)
        req.usuario = check_token;

        // Pasamos al siguiente controlador
        next();

    } catch (err) {
        console.warn('Fallo en verificación JWT:', err.message);

        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ msj: 'El token ha expirado, por favor inicie sesión nuevamente.' });
        }

        return res.status(401).json({ msj: 'Existe un error o token inválido' });
    }
};

module.exports = verificacion;