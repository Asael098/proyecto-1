const db = require('../config/db');

class CalificacionesController {

    // ==========================================
    // POST: Guardar el resultado
    // ==========================================
    async guardarCalificacion(req, res) {
        const id_alumno = req.usuario.id_alumno;
        const { id_g_asignado, puntaje, correctas, total } = req.body; // Cambiamos id_quizz por id_g_asignado

        try {
            const check = await db.query('SELECT id_calificacion FROM calificaciones WHERE id_alumno = $1 AND id_g_asignado = $2', [id_alumno, id_g_asignado]);

            if (check.rows.length > 0) {
                return res.status(400).json({ error: 'Ya has resuelto esta tarea anteriormente.' });
            }

            const query = `
                INSERT INTO calificaciones (id_alumno, id_g_asignado, puntaje, correctas, total) 
                VALUES ($1, $2, $3, $4, $5) RETURNING *
            `;
            const result = await db.query(query, [id_alumno, id_g_asignado, puntaje, correctas, total]);

            res.status(200).json({ mensaje: 'Examen entregado y calificado con éxito', data: result.rows[0] });

        } catch (error) {
            console.log(error);
            res.status(500).json({ error: `Error interno: ${error.message}` });
        }
    }

    // ==========================================
    // GET: Obtener el reporte global (Para el Docente)
    // ==========================================
    async obtenerReporteGrupo(req, res) {
        const { id_grupo } = req.params;

        try {
            const query = `
                SELECT 
                    a.id_alumno,
                    a.nombre AS nombre_alumno,
                    a.apellido_p AS apellido_alumno,
                    q.id_quizz,
                    q.nombre AS nombre_examen,
                    COALESCE(c.puntaje, 0) AS puntaje,
                    aa.id_g_asignado,
                    aa.fecha_limite,
                    aa.id_alumno AS es_tarea_individual, -- Para saber si es individual
                    c.fecha_evaluacion,
                    CASE 
                        WHEN c.id_calificacion IS NOT NULL THEN 'Completada'
                        WHEN aa.fecha_limite < CURRENT_DATE THEN 'Vencida'
                        ELSE 'Pendiente'
                    END AS estado
                FROM asignar_grupo ag
                INNER JOIN alumno a ON ag.id_alumno = a.id_alumno
                INNER JOIN asignar_actividades aa ON ag.id_grupo = aa.id_grupo 
                    -- CAMBIO CLAVE: La actividad debe ser grupal (NULL) O asignada específicamente a este alumno
                    AND (aa.id_alumno IS NULL OR aa.id_alumno = a.id_alumno)
                INNER JOIN quizzes q ON aa.id_quizz = q.id_quizz
                LEFT JOIN calificaciones c ON aa.id_g_asignado = c.id_g_asignado AND c.id_alumno = a.id_alumno
                WHERE ag.id_grupo = $1
                ORDER BY a.nombre ASC, aa.fecha_limite ASC
            `;
            const result = await db.query(query, [id_grupo]);
            res.status(200).json(result.rows);
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: `Error en el servidor: ${error.message}` });
        }
    }
}

module.exports = new CalificacionesController();