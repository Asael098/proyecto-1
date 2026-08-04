const db = require('../config/db')

class AsignacionController {

    constructor() { }

    // ==========================================
    // GET: Obtener alumnos que ya tiene el profesor
    // ==========================================
    async obtenerAsignaciones(req, res) {
        const { id_personal } = req.params;

        try {
            const query = `SELECT id_alumno FROM asignar_alumno WHERE id_personal = $1`;
            const result = await db.query(query, [id_personal]);

            // Extraemos solo los IDs y los mandamos como un arreglo plano: [1, 5, 8]
            const alumnos_ids = result.rows.map(row => row.id_alumno);

            res.status(200).json({ alumnos_ids });
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: `Error en el servidor: ${error.message}` });
        }
    }

    // ==========================================
    // POST: Guardar nuevas asignaciones
    // ==========================================
    async asignacion(req, res) {
        // Aseguramos que la variable se llame "alumnos" (como la manda el frontend)
        const { id_personal, alumnos } = req.body;

        try {
            // 1. LIMPIEZA: Borramos las asignaciones anteriores de este profesor
            const queryDelete = `DELETE FROM asignar_alumno WHERE id_personal = $1`;
            await db.query(queryDelete, [id_personal]);

            // 2. INSERCIÓN: Si mandaron alumnos en el arreglo, los insertamos
            if (alumnos && alumnos.length > 0) {
                const queryInsert = `INSERT INTO asignar_alumno(id_personal, id_alumno) VALUES($1, $2)`;

                for (let id_alumno of alumnos) {
                    await db.query(queryInsert, [id_personal, id_alumno]);
                }
            }

            res.status(200).json({ mensaje: 'Alumnos asignados correctamente' });

        } catch (error) {
            console.log(error);
            res.status(500).json({ error: `Error en el servidor: ${error.message}` });
        }
    }
}

module.exports = new AsignacionController;