const db = require('../config/db.js');

class AlumnoController {

    // ==========================================
    // GET: Obtener los grupos en los que estoy inscrito
    // ==========================================
    async obtenerMisGrupos(req, res) {
        // Recuerda que en tu auth.controller le pusimos 'id_alumno' al token
        const id_alumno = req.usuario.id_alumno;

        try {
            const query = `
                SELECT 
                    g.id_grupo, 
                    g.nombre AS nombre_grupo, 
                    g.idioma, 
                    p.nombre AS maestro_nombre, 
                    p.apellido_p AS maestro_apellido
                FROM asignar_grupo ag
                INNER JOIN grupos g ON ag.id_grupo = g.id_grupo
                INNER JOIN personal p ON g.id_personal = p.id_personal
                WHERE ag.id_alumno = $1
                ORDER BY g.id_grupo DESC
            `;
            const result = await db.query(query, [id_alumno]);
            res.status(200).json(result.rows);
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: `Error en el servidor: ${error.message}` });
        }
    }

    // ==========================================
    // GET: Obtener las actividades (Exámenes) de un grupo
    // ==========================================
    async obtenerActividadesDeGrupo(req, res) {
        const { id_grupo } = req.params;
        const id_alumno = req.usuario.id_alumno;

        try {
            const query = `
                SELECT 
                    aa.id_g_asignado, 
                    q.id_quizz, 
                    q.nombre AS nombre_examen, 
                    q.idioma, 
                    q.nivel, 
                    aa.fecha_asignacion, 
                    aa.fecha_limite,
                    c.puntaje,
                    CASE 
                        WHEN c.id_calificacion IS NOT NULL THEN 'Completada'
                        WHEN aa.fecha_limite < CURRENT_DATE THEN 'Vencida'
                        ELSE 'Pendiente'
                    END AS estado
                FROM asignar_actividades aa
                INNER JOIN quizzes q ON aa.id_quizz = q.id_quizz
                LEFT JOIN calificaciones c ON aa.id_g_asignado = c.id_g_asignado AND c.id_alumno = $2
                WHERE aa.id_grupo = $1
                -- ¡AQUÍ ESTÁ EL NUEVO FILTRO DE SEGURIDAD!
                AND (aa.id_alumno IS NULL OR aa.id_alumno = $2)
                ORDER BY aa.fecha_limite ASC
            `;
            const result = await db.query(query, [id_grupo, id_alumno]);
            res.status(200).json(result.rows);
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: `Error en el servidor: ${error.message}` });
        }
    }

    // ==========================================
    // GET: Obtener el historial de calificaciones
    // ==========================================
    async obtenerMisCalificaciones(req, res) {
        const id_alumno = req.usuario.id_alumno;

        try {
            const query = `
                SELECT 
                    g.nombre AS nombre_grupo,
                    g.idioma,
                    q.nombre AS nombre_examen,
                    COALESCE(c.puntaje, 0) AS puntaje,
                    COALESCE(c.correctas, 0) AS correctas,
                    COALESCE(c.total, 0) AS total,
                    COALESCE(c.fecha_evaluacion, aa.fecha_limite) AS fecha_evaluacion,
                    CASE 
                        WHEN c.id_calificacion IS NOT NULL THEN 'Completada'
                        ELSE 'Incompleta'
                    END AS estado_entrega
                FROM asignar_actividades aa
                INNER JOIN asignar_grupo ag ON aa.id_grupo = ag.id_grupo
                INNER JOIN grupos g ON ag.id_grupo = g.id_grupo
                INNER JOIN quizzes q ON aa.id_quizz = q.id_quizz
                -- AQUI ESTÁ LA OTRA CORRECCIÓN CLAVE:
                LEFT JOIN calificaciones c ON aa.id_g_asignado = c.id_g_asignado AND c.id_alumno = ag.id_alumno
                WHERE ag.id_alumno = $1
                  AND (c.id_calificacion IS NOT NULL OR aa.fecha_limite < CURRENT_DATE)
                ORDER BY g.nombre ASC, fecha_evaluacion DESC
            `;
            const result = await db.query(query, [id_alumno]);
            res.status(200).json(result.rows);
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: `Error en el servidor: ${error.message}` });
        }
    }
}

module.exports = new AlumnoController();