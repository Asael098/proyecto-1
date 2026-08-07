const db = require('../config/db.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

class AuthController {
    constructor() { }

    async login(req, res) {
        const { correo, password } = req.body;

        if (!correo || !password || typeof correo !== 'string' || typeof password !== 'string') {
            return res.status(400).json({ err: 'Correo y contraseña son requeridos' });
        }

        try {
            const correoLimpio = correo.trim();

            // ==========================================
            // 1. BUSCAR EN LA TABLA DE PERSONAL (Admins / Docentes)
            // ==========================================
            const queryPersonal = `SELECT id_personal, nombre, correo, password, rol FROM personal WHERE correo=$1`;
            const resultPersonal = await db.query(queryPersonal, [correoLimpio]);

            if (resultPersonal.rows.length > 0) {

                const usuario = resultPersonal.rows[0];

                // Verificación segura: soporta hash bcrypt y fallback para texto plano en contraseñas existentes
                let isMatch = false;
                if (usuario.password && usuario.password.startsWith('$2')) {
                    isMatch = await bcrypt.compare(password, usuario.password);
                } else {
                    isMatch = (usuario.password === password);
                }

                if (!isMatch) {
                    return res.status(401).json({ err: 'Credenciales inválidas' });
                }

                // Generamos el token para el Personal
                const token = jwt.sign(
                    { id_personal: usuario.id_personal, correo: usuario.correo, rol: usuario.rol, nombre: usuario.nombre },
                    process.env.S_Key,
                    { expiresIn: '1h' }
                );

                return res.status(200).json({
                    msj: `Login correcto (${usuario.rol})`,
                    token: token,
                    usuario: {
                        id: usuario.id_personal,
                        nombre: usuario.nombre,
                        rol: usuario.rol
                    }
                });
            }

            // ==========================================
            // 2. BUSCAR EN LA TABLA DE ALUMNOS (Si no se encontró en Personal)
            // ==========================================
            const queryAlumno = `SELECT id_alumno, nombre, correo, password FROM alumno WHERE correo=$1`;
            const resultAlumno = await db.query(queryAlumno, [correoLimpio]);

            if (resultAlumno.rows.length > 0) {

                const alumno = resultAlumno.rows[0];

                let isMatch = false;
                if (alumno.password && alumno.password.startsWith('$2')) {
                    isMatch = await bcrypt.compare(password, alumno.password);
                } else {

                    isMatch = (alumno.password === password);
                }

                if (!isMatch) {

                    return res.status(401).json({ err: 'Credenciales inválidas' });
                }

                // Generamos el token para el Alumno
                const token = jwt.sign(
                    { id_alumno: alumno.id_alumno, correo: alumno.correo, rol: 'alumno', nombre: alumno.nombre },
                    process.env.S_Key,
                    { expiresIn: '1h' }
                );

                return res.status(200).json({
                    msj: 'Login correcto (alumno)',
                    token: token,
                    usuario: {
                        id: alumno.id_alumno,
                        nombre: alumno.nombre,
                        rol: 'alumno'
                    }
                });
            }

            // ==========================================
            // 3. SI NO EXISTE EN NINGUNA TABLA (Respuesta genérica anti-enumeración)
            // ==========================================
            return res.status(401).json({ err: 'Credenciales inválidas' });

        } catch (err) {
            console.error('Error en AuthController.login:', err);
            res.status(500).json({ err: 'Error interno del servidor' });
        }
    }
}

module.exports = new AuthController();