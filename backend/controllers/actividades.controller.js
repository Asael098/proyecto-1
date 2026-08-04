const db = require('../config/db');

class ActividadesController {

    // ==========================================
    // GET: Ver las asignaciones hechas por este maestro
    // ==========================================
    async obtenerActividades(req, res) {
        const id_personal = req.usuario.id_personal;

        try {
            // Agregamos q.idioma y q.nivel, y mejoramos los nombres para la Tabla

            const query = `
                SELECT 
                    aa.id_g_asignado, 
                    g.nombre AS nombre_grupo, 
                    q.nombre AS nombre_examen, 
                    q.idioma,
                    q.nivel,
                    TO_CHAR(aa.fecha_asignacion , 'YYYY-MM-DD') AS fecha_asignacion, 
                    TO_CHAR(aa.fecha_limite , 'YYYY-MM-DD') AS fecha_limite 
                FROM asignar_actividades aa
                INNER JOIN grupos g ON aa.id_grupo = g.id_grupo
                INNER JOIN quizzes q ON aa.id_quizz = q.id_quizz
                WHERE g.id_personal = $1
                ORDER BY aa.id_g_asignado DESC
            `;
            const result = await db.query(query, [id_personal]);
            res.status(200).json(result.rows);
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: `Error en el servidor: ${error.message}` });
        }
    }
    // ==========================================
    // POST: Asignar un examen a un grupo
    // ==========================================
    async asignarActividad(req, res) {
        const { id_grupo, id_quizz, fecha_limite } = req.body;

        try {
            const query = `INSERT INTO asignar_actividades (id_grupo, id_quizz, fecha_limite) VALUES ($1, $2, $3)`;
            await db.query(query, [id_grupo, id_quizz, fecha_limite]);
            res.status(200).json({ mensaje: 'Actividad asignada al grupo exitosamente' });
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: `Error al asignar: ${error.message}` });
        }
    }

    // ==========================================
    // DELETE: Quitar el examen de ese grupo
    // ==========================================
    async eliminarActividad(req, res) {
        const { id } = req.params;

        try {
            await db.query(`DELETE FROM asignar_actividades WHERE id_g_asignado = $1`, [id]);
            res.status(200).json({ mensaje: 'Asignación eliminada correctamente' });
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: `Error al eliminar: ${error.message}` });
        }
    }
    async actualizarActividad(req, res) {
        const { id } = req.params; // El id_g_asignado
        const { fecha_limite } = req.body;

        try {
            const query = `UPDATE asignar_actividades SET fecha_limite = $1 WHERE id_g_asignado = $2 RETURNING *`;
            const result = await db.query(query, [fecha_limite, id]);

            if (result.rowCount === 0) {
                return res.status(404).json({ error: 'Asignación no encontrada' });
            }

            res.status(200).json({ mensaje: 'Fecha actualizada correctamente' });
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: `Error al actualizar: ${error.message}` });
        }
    }
}

module.exports = new ActividadesController();