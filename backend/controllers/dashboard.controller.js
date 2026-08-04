const db = require('../config/db');

class DashboardController {

    async obtenerEstadisticas(req, res) {
        try {
            // 1. Gráfica de Barras: Promedio por Grupo
            const queryGrupos = `
                SELECT 
                    g.nombre AS name, 
                    COALESCE(ROUND(AVG(c.puntaje)), 0)::numeric AS promedio
                FROM grupos g
                LEFT JOIN asignar_actividades aa ON g.id_grupo = aa.id_grupo
                LEFT JOIN calificaciones c ON aa.id_g_asignado = c.id_g_asignado
                GROUP BY g.id_grupo, g.nombre
                ORDER BY promedio DESC
            `;

            // 2. Gráfica de Pastel: Calificaciones ligadas al Maestro
            const queryMaestros = `
                SELECT 
                    p.id_personal, 
                    p.nombre || ' ' || p.apellido_p AS maestro,
                    c.puntaje
                FROM personal p
                INNER JOIN grupos g ON p.id_personal = g.id_personal
                INNER JOIN asignar_actividades aa ON g.id_grupo = aa.id_grupo
                INNER JOIN calificaciones c ON aa.id_g_asignado = c.id_g_asignado
                WHERE p.rol = 'docente'
            `;

            const resGrupos = await db.query(queryGrupos);
            const resMaestros = await db.query(queryMaestros);

            // Aseguramos que el promedio se envíe como número (para Recharts)
            const barrasGrupos = resGrupos.rows.map(g => ({
                ...g,
                promedio: Number(g.promedio)
            }));

            res.status(200).json({
                barrasGrupos,
                datosMaestros: resMaestros.rows
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: `Error en el servidor: ${error.message}` });
        }
    }
}

module.exports = new DashboardController();