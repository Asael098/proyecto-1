const db = require('../config/db.js');
const jwt = require('jsonwebtoken');

class AuthController {
    constructor() { }

    async login(req, res) {
        const { correo, password } = req.body;

        try {
            // ==========================================
            // 1. BUSCAR EN LA TABLA DE PERSONAL (Admins / Docentes)
            // ==========================================
            const queryPersonal = `SELECT id_personal, nombre, correo, password, rol FROM personal WHERE correo=$1`;
            const resultPersonal = await db.query(queryPersonal, [correo]);

            if (resultPersonal.rows.length > 0) {
                const usuario = resultPersonal.rows[0];

                if (usuario.password !== password) {
                    return res.status(401).json({ err: 'Tu contraseña es inválida' });
                }

                // Generamos el token para el Personal
                const token = jwt.sign(
                    { id_personal: usuario.id_personal, correo: usuario.correo, rol: usuario.rol },
                    process.env.S_Key,
                    { expiresIn: '2h' }
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
            const resultAlumno = await db.query(queryAlumno, [correo]);

            if (resultAlumno.rows.length > 0) {
                const alumno = resultAlumno.rows[0];

                if (alumno.password !== password) {
                    return res.status(401).json({ err: 'Tu contraseña es inválida' });
                }

                // Generamos el token para el Alumno
                // NOTA: Inyectamos el rol 'alumno' manualmente porque esa tabla no tiene columna 'rol'
                const token = jwt.sign(
                    { id_alumno: alumno.id_alumno, correo: alumno.correo, rol: 'alumno' },
                    process.env.S_Key,
                    { expiresIn: '2h' }
                );

                return res.status(200).json({
                    msj: 'Login correcto (alumno)',
                    token: token,
                    usuario: {
                        id: alumno.id_alumno,
                        nombre: alumno.nombre,
                        rol: 'alumno' // Le avisamos al frontend que es un estudiante
                    }
                });
            }

            // ==========================================
            // 3. SI NO EXISTE EN NINGUNA TABLA
            // ==========================================
            return res.status(404).json({ err: 'Credenciales inválidas (Usuario no encontrado)' });

        } catch (err) {
            console.log('Existe un error', err);
            res.status(500).json({ err: 'Error interno del servidor' });
        }
    }
}

module.exports = new AuthController();